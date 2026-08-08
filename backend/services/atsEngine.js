// Deterministic ATS / Recruiter / Resume Quality scoring engine.
//
// EVERY number this module returns is computed from the actual resume text
// via regex/keyword matching and simple weighted arithmetic. Nothing here
// is random, nothing is an LLM guess. If you wire in an LLM later (see
// services/aiReview.js), it may only *explain* these numbers - it must
// never be allowed to overwrite them. That separation is the core rule
// of the whole ATS module.

import { SKILL_DICTIONARY } from '../data/skillDictionary.js';

const ROLE_SKILL_CLUSTERS = {
  'Frontend Developer': ['react', 'javascript', 'typescript', 'html', 'css', 'redux', 'next.js'],
  'Backend Developer': ['node', 'express', 'java', 'spring', 'python', 'django', 'sql', 'mongodb'],
  'Full Stack Developer': ['react', 'node', 'express', 'javascript', 'mongodb', 'sql'],
  'Data Analyst': ['sql', 'excel', 'tableau', 'power bi', 'pandas', 'data analysis'],
  'Machine Learning Engineer': ['python', 'tensorflow', 'pytorch', 'machine learning', 'deep learning'],
  'DevOps Engineer': ['docker', 'kubernetes', 'aws', 'ci/cd', 'jenkins', 'linux']
};

const SECTION_PATTERNS = {
  'Contact Information': /(email|phone|linkedin|github)/i,
  'Summary': /(summary|objective|profile)/i,
  'Education': /education/i,
  'Experience': /(experience|work history|employment)/i,
  Skills: /skills/i,
  Projects: /projects?/i,
  Certifications: /certifications?/i,
  Links: /(linkedin\.com|github\.com|portfolio)/i
};

const ACTION_VERBS = [
  'built', 'developed', 'led', 'designed', 'implemented', 'optimized',
  'launched', 'improved', 'created', 'managed', 'automated', 'reduced',
  'increased', 'architected', 'deployed'
];

function clamp(n, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function detectSkills(text) {
  const lower = text.toLowerCase();
  return SKILL_DICTIONARY.filter((skill) => lower.includes(skill));
}

function detectSections(text) {
  return Object.entries(SECTION_PATTERNS).map(([name, pattern]) => ({
    name,
    status: pattern.test(text) ? 'ok' : 'missing'
  }));
}

function predictRole(detectedSkills) {
  let bestRole = 'Software Engineer';
  let bestOverlap = 0;
  for (const [role, cluster] of Object.entries(ROLE_SKILL_CLUSTERS)) {
    const overlap = cluster.filter((s) => detectedSkills.includes(s)).length;
    if (overlap > bestOverlap) {
      bestOverlap = overlap;
      bestRole = role;
    }
  }
  return bestRole;
}

function countActionVerbs(text) {
  const lower = text.toLowerCase();
  return ACTION_VERBS.reduce((sum, verb) => sum + (lower.split(verb).length - 1), 0);
}

function hasQuantifiedAchievements(text) {
  // e.g. "increased performance by 30%", "reduced load time by 2s"
  return /\d+%|\$\d+|\d+x\b|\d+\s?(ms|s|hrs?|hours|users|customers)/i.test(text);
}

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function analyzeResume({ rawText, jobDescription = '' }) {
  const detectedSkills = detectSkills(rawText);
  const sections = detectSections(rawText);
  const sectionsFound = sections.filter((s) => s.status === 'ok').length;
  const totalSections = sections.length;

  const words = wordCount(rawText);
  const actionVerbCount = countActionVerbs(rawText);
  const hasEmail = /[\w.+-]+@[\w-]+\.[a-z]{2,}/i.test(rawText);
  const hasPhone = /(\+?\d[\d\s-]{8,}\d)/.test(rawText);
  const quantified = hasQuantifiedAchievements(rawText);

  // --- ATS Score: section completeness + skill density + contact presence ---
  const sectionScore = (sectionsFound / totalSections) * 40;
  const skillScore = clamp((detectedSkills.length / 12) * 100, 0, 100) * 0.35;
  const contactScore = ((hasEmail ? 1 : 0) + (hasPhone ? 1 : 0)) * 12.5;
  const atsScore = clamp(sectionScore + skillScore + contactScore);

  // --- Recruiter Score: action verbs + quantified impact + length sanity ---
  const verbScore = clamp((actionVerbCount / 8) * 100, 0, 100) * 0.4;
  const quantScore = (quantified ? 1 : 0) * 30;
  const lengthScore = words >= 250 && words <= 900 ? 30 : 15;
  const recruiterScore = clamp(verbScore + quantScore + lengthScore);

  // --- Resume Quality: readability proxy ---
  const bulletDensity = (rawText.match(/^\s*[-•*]/gm) || []).length;
  const qualityScore = clamp(
    (bulletDensity >= 5 ? 40 : bulletDensity * 8) +
      (words >= 250 && words <= 900 ? 40 : 20) +
      (sectionsFound / totalSections) * 20
  );

  const resumeScore = clamp(atsScore * 0.4 + recruiterScore * 0.3 + qualityScore * 0.3);

  // --- JD Match (only if a JD was provided) ---
  let jdMatch = null;
  let missingSkillsFromJD = [];
  if (jobDescription && jobDescription.trim().length > 0) {
    const jdSkills = detectSkills(jobDescription);
    const overlap = jdSkills.filter((s) => detectedSkills.includes(s));
    jdMatch = jdSkills.length ? clamp((overlap.length / jdSkills.length) * 100) : null;
    missingSkillsFromJD = jdSkills.filter((s) => !detectedSkills.includes(s));
  }

  const missingSkills = missingSkillsFromJD.length
    ? missingSkillsFromJD
    : SKILL_DICTIONARY.filter((s) => !detectedSkills.includes(s)).slice(0, 5);

  const missingKeywords = ['System Design', 'REST API', 'Testing', 'CI/CD', 'TypeScript'].filter(
    (kw) => !detectedSkills.includes(kw.toLowerCase())
  );

  const strengths = [];
  const weaknesses = [];
  if (detectedSkills.length >= 8) strengths.push('Strong, diverse skill set detected');
  else weaknesses.push('Limited number of relevant skills detected');
  if (hasEmail && hasPhone) strengths.push('Complete contact information');
  else weaknesses.push('Missing contact details (email/phone)');
  if (quantified) strengths.push('Includes quantified achievements');
  else weaknesses.push('Lacks measurable impact statements (numbers, %, metrics)');
  if (sectionsFound === totalSections) strengths.push('All key resume sections present');
  else weaknesses.push(`${totalSections - sectionsFound} expected section(s) missing`);

  const suggestionsByTab = {
    keywords: missingKeywords.map((kw, i) => ({ id: `kw-${i}`, text: `Add "${kw}" where relevant to your experience`, scoreImpact: 2 })),
    sections: sections
      .filter((s) => s.status === 'missing')
      .map((s, i) => ({ id: `sec-${i}`, text: `Add a "${s.name}" section`, scoreImpact: 3 })),
    certifications: !rawText.toLowerCase().includes('certif')
      ? [{ id: 'cert-1', text: 'Consider adding a relevant certification (e.g. AWS, Google, Coursera)', scoreImpact: 2 }]
      : [],
    formatting: [
      ...(bulletDensity < 5 ? [{ id: 'fmt-1', text: 'Use bullet points to describe experience and projects', scoreImpact: 3 }] : []),
      ...(!quantified ? [{ id: 'fmt-2', text: 'Quantify achievements with numbers or percentages', scoreImpact: 4 }] : [])
    ]
  };

  return {
    atsScore,
    recruiterScore,
    resumeScore,
    resumeQuality: qualityScore,
    jdMatch,
    predictedRole: predictRole(detectedSkills),
    skills: detectedSkills,
    missingSkills,
    missingKeywords,
    sections,
    sectionsFound,
    totalSections,
    strengths,
    weaknesses,
    suggestionsByTab,
    // Deterministic fallback explanation - used unless an LLM key is configured.
    aiReview: `This resume scores ${clamp(
      atsScore
    )}/100 on ATS compatibility, driven mainly by ${detectedSkills.length} detected skills and ${sectionsFound}/${totalSections} standard sections. ${
      weaknesses[0] || 'No major gaps detected.'
    }`
  };
}
