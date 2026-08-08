import { askGemini } from './geminiClient.js';

// AI Tutor: free-form Q&A. The model only ever explains/teaches - it never
// produces a score, and nothing it returns is written to SkillProgress or
// any score field.
export async function answerTutorQuestion({ question, topic }) {
  const system =
    'You are a precise, encouraging placement-prep tutor for engineering students preparing for ' +
    'technical interviews and campus placements in India. Answer clearly and concretely - no vague ' +
    'filler, no hedging, no "it depends" without immediately saying what it depends on. Prefer short, ' +
    'structured explanations (a short definition, then a concrete example) over long theory. If the ' +
    'question is about code, include a small code snippet. Keep the answer under 250 words unless the ' +
    'question genuinely needs more.';
  const user = topic ? `Topic: ${topic}\n\nQuestion: ${question}` : question;
  return askGemini({ system, user, temperature: 0.4, maxTokens: 1000 });
}

// Feedback on an open-ended HR/company-round answer (never a score - Skill
// Builder's actual "completed" progress is still recorded deterministically
// by skills.controller.js regardless of what this returns).
export async function feedbackOnOpenAnswer({ prompt, answer }) {
  const system =
    'You are an experienced interview coach reviewing a candidate\'s written answer to a behavioral or ' +
    'technical-discussion interview question. Give specific, actionable feedback in exactly 3 short ' +
    'sentences, in this order: (1) what is concretely strong about the answer, (2) what is missing or ' +
    'vague, (3) one specific rewrite suggestion. Be direct, not diplomatic filler. Do not assign a ' +
    'numeric score or grade - only give qualitative feedback.';
  const user = `Interview question: ${prompt}\n\nCandidate's answer: ${answer}`;
  return askGemini({ system, user, temperature: 0.5, maxTokens: 600 });
}