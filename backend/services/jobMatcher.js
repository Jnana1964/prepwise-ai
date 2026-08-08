// Computes a real match % between a job and the user's full Resume Analysis
// Profile - not just a skills array. Weighs skills most heavily but also
// nudges the score with ATS/recruiter quality, matching the spec's
// requirement that Opportunity Matcher use the *entire* profile.
export function computeMatch(job, analysis) {
  const resumeSkills = (analysis.skills || []).map((s) => s.toLowerCase());
  const required = (job.requiredSkills || []).map((s) => s.toLowerCase());

  const matchedSkills = required.filter((s) => resumeSkills.includes(s));
  const missing = required.filter((s) => !resumeSkills.includes(s));

  const skillCoverage = required.length ? matchedSkills.length / required.length : 0.5;
  const qualityBoost = ((analysis.atsScore || 0) + (analysis.recruiterScore || 0)) / 200; // 0-1

  const matchPercent = Math.round(Math.min(100, skillCoverage * 85 + qualityBoost * 15));

  return { matchPercent, matchedSkills, missingSkills: missing };
}

// Bidirectional edge from the spec: skills the Opportunity Matcher discovers
// as missing get folded back into the shared ResumeAnalysis document so
// Resume Improvement, Tailored Resume and Skill Builder all see them too.
export function mergeMissingSkills(analysis, newlyMissing) {
  const existing = new Set((analysis.missingSkills || []).map((s) => s.toLowerCase()));
  const additions = newlyMissing.filter((s) => !existing.has(s.toLowerCase()));
  if (additions.length === 0) return false;
  analysis.missingSkills = [...(analysis.missingSkills || []), ...additions];
  return true;
}
