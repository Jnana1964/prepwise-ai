// Deterministic, template-based "why this fits" line for each Opportunity
// Matcher card. Built entirely from real fields already on the job/analysis
// (matchedSkills, missingSkills, resume strengths, predicted role) - not an
// LLM call, not a fabricated sentence. Same inputs always produce the same
// sentence, which is the point: it should read like a summary of real data.
export function buildJobInsight({ matchedSkills, missingSkills, analysis }) {
  const parts = [];

  if (matchedSkills.length > 0) {
    const shown = matchedSkills.slice(0, 3).map(capitalize).join(', ');
    parts.push(`Strong overlap on ${shown}`);
  } else {
    parts.push('Limited skill overlap with your current profile');
  }

  if (analysis.predictedRole) {
    parts.push(`aligned with your predicted role of ${analysis.predictedRole}`);
  }

  if (missingSkills.length > 0) {
    const gap = missingSkills.slice(0, 2).map(capitalize).join(' and ');
    parts.push(`gap: ${gap} not yet detected on your resume`);
  }

  return parts.join(' — ');
}

function capitalize(s) {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}
