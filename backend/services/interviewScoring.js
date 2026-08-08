// Deterministic heuristic scoring for interview answers - word count,
// structure, and keyword presence. This is a stand-in for a real LLM
// grader: if OPENAI_API_KEY is set, swap this out for an actual model call
// in interview.controller.js, but keep the same 1-5 star output shape.
export function scoreAnswer(answerText, questionType) {
  const words = (answerText || '').trim().split(/\s+/).filter(Boolean).length;
  const hasStructure = /(first|second|then|because|for example|specifically)/i.test(answerText || '');
  const hasSpecifics = /\d/.test(answerText || '') || (answerText || '').length > 200;

  const communication = clamp(1 + Math.min(3, Math.floor(words / 25)) + (hasStructure ? 1 : 0));
  const technical = clamp(1 + Math.min(3, Math.floor(words / 30)) + (hasSpecifics ? 1 : 0));
  const confidence = clamp(1 + Math.min(4, Math.floor(words / 20)));

  return { communication, technical, confidence };
}

function clamp(n) {
  return Math.max(1, Math.min(5, n));
}

export function summarizeSession(answeredQuestions) {
  const avg = (key) =>
    answeredQuestions.reduce((sum, q) => sum + (q.feedback?.[key] || 0), 0) / (answeredQuestions.length || 1);

  const communication = avg('communication');
  const technical = avg('technical');
  const confidence = avg('confidence');
  const behavioral =
    answeredQuestions.filter((q) => q.type === 'behavioral').reduce((s, q) => s + (q.feedback?.communication || 0), 0) /
    (answeredQuestions.filter((q) => q.type === 'behavioral').length || 1);

  const overallScore = Math.round(((communication + technical + confidence) / 3) * 2) / 2; // out of 10, .5 steps

  const weakTopics = [];
  if (technical < 3) weakTopics.push('Technical Depth');
  if (communication < 3) weakTopics.push('Communication');
  if (confidence < 3) weakTopics.push('Confidence');

  return {
    overallScore,
    communicationScore: Math.round(communication * 20), // to %
    technicalScore: Math.round(technical * 20),
    confidenceScore: Math.round(confidence * 20),
    behavioralScore: Math.round((behavioral || communication) * 20),
    weakTopics,
    performanceLabel: overallScore >= 8 ? 'Excellent Performance' : overallScore >= 6 ? 'Good Performance' : 'Needs Improvement'
  };
}
