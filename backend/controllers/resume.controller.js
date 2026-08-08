import { Resume, ResumeAnalysis } from '../models/index.js';
import { extractTextFromPdf } from '../services/pdfParser.js';
import { analyzeResume } from '../services/atsEngine.js';
import { recordMetric } from '../services/metrics.js';
import { generateTailoredContent } from '../services/tailoredResumeGenerator.js';

// analyzeResume() returns sectionsFound/totalSections as convenience fields
// for callers, but the ResumeAnalysis model has no columns for them - they're
// derived at read time instead (see serializeAnalysis below). Spreading the
// raw result straight into a Sequelize create/findOrCreate payload passes
// these two unknown attributes through, which Sequelize warns about on
// every request. Strip them before anything gets persisted.
function omitDerivedFields(analysisResult) {
  const { sectionsFound, totalSections, ...persistable } = analysisResult;
  return persistable;
}

export async function uploadResume(req, res) {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const rawText = await extractTextFromPdf(req.file.path);
  if (!rawText || rawText.trim().length < 30) {
    return res.status(422).json({ message: 'Could not extract readable text from this PDF' });
  }

  const resume = await Resume.create({
    userId: req.userId,
    filename: req.file.originalname,
    storagePath: req.file.path,
    rawText,
    jobDescription: req.body.jobDescription || ''
  });

  const analysis = analyzeResume({ rawText, jobDescription: resume.jobDescription });

  const saved = await ResumeAnalysis.create({
    userId: req.userId,
    resumeId: resume.id,
    ...omitDerivedFields(analysis)
  });

  await recordMetric(req.userId, 'ats_score', saved.atsScore);
  await recordMetric(req.userId, 'resume_score', saved.resumeScore);

  res.status(201).json({ resumeId: resume.id, analysisId: saved.id });
}

export async function listResumes(req, res) {
  const resumes = await Resume.findAll({ where: { userId: req.userId }, order: [['createdAt', 'DESC']] });
  res.json({
    resumes: resumes.map((r) => ({
      id: r.id,
      filename: r.filename,
      uploadedAt: new Date(r.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
    }))
  });
}

// atsEngine.js computes sectionsFound/totalSections but the ResumeAnalysis
// model never had columns for them, so the analysis page was rendering
// bare "undefined/undefined" (which shows as just "/") - this recomputes
// them from the persisted `sections` array instead of adding a DB column,
// so it works immediately without a migration on anyone's existing
// database. Also normalizes the "skills" field into a `skillsCount` so the
// "Key Skills Found" card has something to actually show.
function serializeAnalysis(analysis) {
  const json = analysis.toJSON();
  const sections = json.sections || [];
  return {
    ...json,
    sectionsFound: sections.filter((s) => s.status === 'ok').length,
    totalSections: sections.length,
    skillsCount: (json.skills || []).length
  };
}

export async function getAnalysis(req, res) {
  const analysis = await ResumeAnalysis.findOne({
    where: { resumeId: req.params.resumeId, userId: req.userId }
  });
  if (!analysis) return res.status(404).json({ message: 'Analysis not found' });
  res.json(serializeAnalysis(analysis));
}

export async function improveResume(req, res) {
  const analysis = await ResumeAnalysis.findOne({
    where: { resumeId: req.params.resumeId, userId: req.userId }
  });
  if (!analysis) return res.status(404).json({ message: 'Analysis not found' });
  res.json({
    currentScore: analysis.resumeScore,
    suggestionsByTab: analysis.suggestionsByTab
  });
}

export async function tailorResume(req, res) {
  const { jobDescription } = req.body;
  if (!jobDescription) return res.status(400).json({ message: 'jobDescription is required' });

  const resume = await Resume.findOne({ where: { id: req.params.resumeId, userId: req.userId } });
  if (!resume) return res.status(404).json({ message: 'Resume not found' });

  const analysisResult = analyzeResume({ rawText: resume.rawText, jobDescription });

  const [analysis] = await ResumeAnalysis.findOrCreate({
    where: { resumeId: resume.id, userId: req.userId },
    defaults: { ...omitDerivedFields(analysisResult), userId: req.userId, resumeId: resume.id }
  });

  analysis.jdMatch = analysisResult.jdMatch;
  analysis.missingSkills = analysisResult.missingSkills;
  analysis.missingKeywords = analysisResult.missingKeywords;
  await analysis.save();

  resume.jobDescription = jobDescription;
  await resume.save();

  res.json({
    jdMatch: analysis.jdMatch,
    matchedSkills: analysis.skills.filter((s) => !analysis.missingSkills.includes(s)),
    missingSkills: analysis.missingSkills,
    missingKeywords: analysis.missingKeywords
  });
}

// Generates the actual tailored resume CONTENT (prose, not a score) for a
// chosen template. This is the AI step behind "pick a template, generate a
// tailored resume" - the deterministic jdMatch/matchedSkills/missingSkills
// numbers still come from analyzeResume() (same engine as tailorResume()
// above), never from the model. Requires OPENAI_API_KEY; fails with a clear
// 503 rather than silently returning fabricated content if it's not set.
export async function generateTailoredResume(req, res) {
  const { jobDescription } = req.body;
  if (!jobDescription || !jobDescription.trim()) {
    return res.status(400).json({ message: 'jobDescription is required' });
  }
  if (!process.env.GEMINI_API_KEY) {
  return res.status(503).json({ message: 'Tailored Resume generation requires GEMINI_API_KEY to be set in the backend .env file.' });
}
  const resume = await Resume.findOne({ where: { id: req.params.resumeId, userId: req.userId } });
  if (!resume) return res.status(404).json({ message: 'Resume not found' });

  const analysisResult = analyzeResume({ rawText: resume.rawText, jobDescription });
  const matchedSkills = analysisResult.skills.filter((s) => !analysisResult.missingSkills.includes(s));

  try {
    const content = await generateTailoredContent({
      resumeText: resume.rawText,
      jobDescription,
      matchedSkills,
      missingSkills: analysisResult.missingSkills
    });
    res.json({
      content,
      jdMatch: analysisResult.jdMatch,
      matchedSkills,
      missingSkills: analysisResult.missingSkills
    });
  } catch (err) {
    console.error('[tailored-resume]', err.message);
    res.status(502).json({ message: 'Could not generate a tailored resume right now. Try again in a moment.' });
  }
}

// "Save Changes" on the Improve Resume page. Suggestions are just text
// hints from the deterministic engine - there's no AI rewriting the
// resume, so this only auto-applies the suggestions that can be applied
// mechanically and safely (adding a missing section header, appending
// keywords), then re-runs the SAME real ATS engine so the resulting score
// is genuinely recomputed, never a guessed/estimated delta. Formatting
// suggestions ("use bullet points", "quantify achievements") are not
// auto-applied - rewriting prose like that isn't mechanically safe to do
// blindly, so those are reported back as skipped for the user to handle in
// Edit Resume Directly.
export async function applySuggestions(req, res) {
  const { suggestionIds } = req.body;
  if (!Array.isArray(suggestionIds) || suggestionIds.length === 0) {
    return res.status(400).json({ message: 'suggestionIds (non-empty array) is required' });
  }

  const resume = await Resume.findOne({ where: { id: req.params.resumeId, userId: req.userId } });
  if (!resume) return res.status(404).json({ message: 'Resume not found' });

  const analysis = await ResumeAnalysis.findOne({ where: { resumeId: resume.id, userId: req.userId } });
  if (!analysis) return res.status(404).json({ message: 'Analysis not found' });

  const allSuggestions = Object.values(analysis.suggestionsByTab || {}).flat();
  const accepted = allSuggestions.filter((s) => suggestionIds.includes(s.id));

  const keywordMatches = accepted
    .filter((s) => s.id.startsWith('kw-'))
    .map((s) => (s.text.match(/"([^"]+)"/) || [])[1])
    .filter(Boolean);

  const sectionAdds = accepted
    .filter((s) => s.id.startsWith('sec-'))
    .map((s) => (s.text.match(/Add a "([^"]+)" section/) || [])[1])
    .filter(Boolean);

  const certAccepted = accepted.some((s) => s.id.startsWith('cert-'));
  const skippedFormatting = accepted.filter((s) => s.id.startsWith('fmt-')).length;

  let additions = '';
  if (keywordMatches.length) additions += `\n\nAdditional Keywords: ${keywordMatches.join(', ')}`;
  for (const sectionName of sectionAdds) {
    additions += `\n\n${sectionName}\n[Add your ${sectionName.toLowerCase()} details here]`;
  }
  if (certAccepted && !sectionAdds.includes('Certifications')) {
    additions += `\n\nCertifications\n[Add your certification here]`;
  }

  if (!additions.trim()) {
    return res.json({
      applied: 0,
      skippedFormatting,
      message: skippedFormatting
        ? 'Formatting suggestions need a manual rewrite - use Edit Resume Directly for those.'
        : 'Nothing to apply.',
      resumeScore: analysis.resumeScore,
      atsScore: analysis.atsScore,
      recruiterScore: analysis.recruiterScore
    });
  }

  resume.rawText = `${resume.rawText}${additions}`;
  await resume.save();

  const analysisResult = analyzeResume({ rawText: resume.rawText, jobDescription: resume.jobDescription });
  Object.assign(analysis, omitDerivedFields(analysisResult));
  await analysis.save();

  await recordMetric(req.userId, 'ats_score', analysis.atsScore);
  await recordMetric(req.userId, 'resume_score', analysis.resumeScore);

  res.json({
    applied: keywordMatches.length + sectionAdds.length + (certAccepted ? 1 : 0),
    skippedFormatting,
    resumeScore: analysis.resumeScore,
    atsScore: analysis.atsScore,
    recruiterScore: analysis.recruiterScore
  });
}

// Direct in-app resume editing (Google Docs style) - the user edits the
// plain-text content of their resume without re-uploading a file, and we
// re-run the SAME deterministic ATS engine against the edited text so the
// score always reflects what's actually on the page. Nothing here is
// AI-generated; it's the identical scoring path as a fresh upload.
export async function updateContent(req, res) {
  const { content } = req.body;
  if (!content || content.trim().length < 30) {
    return res.status(400).json({ message: 'content must be at least 30 characters' });
  }

  const resume = await Resume.findOne({ where: { id: req.params.resumeId, userId: req.userId } });
  if (!resume) return res.status(404).json({ message: 'Resume not found' });

  resume.rawText = content;
  await resume.save();

  const analysisResult = analyzeResume({ rawText: content, jobDescription: resume.jobDescription });

  const [analysis] = await ResumeAnalysis.findOrCreate({
    where: { resumeId: resume.id, userId: req.userId },
    defaults: { ...omitDerivedFields(analysisResult), userId: req.userId, resumeId: resume.id }
  });
  Object.assign(analysis, omitDerivedFields(analysisResult));
  await analysis.save();

  await recordMetric(req.userId, 'ats_score', analysis.atsScore);
  await recordMetric(req.userId, 'resume_score', analysis.resumeScore);

  res.json({ resumeId: resume.id, atsScore: analysis.atsScore, resumeScore: analysis.resumeScore });
}

export async function getContent(req, res) {
  const resume = await Resume.findOne({ where: { id: req.params.resumeId, userId: req.userId } });
  if (!resume) return res.status(404).json({ message: 'Resume not found' });
  res.json({ content: resume.rawText });
}