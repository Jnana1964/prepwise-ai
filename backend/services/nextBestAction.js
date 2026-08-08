// Rule-based resolver - deterministic, derived from persisted module state.
// NOT an AI call. This is intentional per spec: the dashboard's recommended
// next step must be reproducible and explainable, not a model guess.
export function resolveNextBestAction({ hasResume, latestAnalysis, applicationsCount, skillProgressComplete, latestAssessment, assessmentThreshold, hasInterview }) {
  if (!hasResume) {
    return { title: 'Upload Your Resume', description: 'Start by uploading your resume for AI-powered analysis.', href: '/resume/upload' };
  }
  if (latestAnalysis && latestAnalysis.atsScore < 80) {
    return { title: 'Improve Your Resume', description: 'Add missing keywords and improve your ATS score.', href: `/resume/${latestAnalysis.resume}/improve` };
  }
  if (applicationsCount === 0) {
    return { title: 'Find Matching Opportunities', description: 'Discover jobs that match your improved profile.', href: '/opportunities' };
  }
  if (!skillProgressComplete) {
    return { title: 'Complete Skill Builder', description: 'Strengthen the skills flagged as weak in your analysis.', href: '/skills' };
  }
  if (!latestAssessment || latestAssessment.score < assessmentThreshold) {
    return { title: 'Take a Mock Assessment', description: `Score ${assessmentThreshold}%+ to unlock the AI Mock Interview.`, href: '/skills' };
  }
  if (!hasInterview) {
    return { title: 'Start Your AI Mock Interview', description: "You're eligible - practice with a real interview flow.", href: '/interview' };
  }
  return { title: 'Review Your Analytics', description: 'Check your progress and keep improving.', href: '/analytics' };
}
