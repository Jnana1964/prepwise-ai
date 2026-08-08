import { askGemini } from './geminiClient.js';

// Turns a real resume + a real job description into a structured, rewritten
// resume (JSON, not a score). Per the app's core rule, the AI is only ever
// allowed to REORGANIZE and REWORD content that's actually in the source
// resume - it is explicitly instructed never to invent employers, titles,
// dates, degrees, or achievements. This keeps the deterministic ATS engine
// as the sole source of truth for scores; this module only produces prose.
const SYSTEM_PROMPT = `You are a professional resume writer. You will be given a candidate's REAL resume text and a REAL job description. Your job is to rewrite and reorganize the resume to better target this specific job.

Strict rules:
- Do NOT invent employers, job titles, dates, degrees, schools, or achievements that are not present in the source resume text.
- You MAY rephrase, reorder, tighten wording, and naturally emphasize skills/keywords from the job description IF they are genuinely supported by the source resume content.
- If the source resume lacks a section (e.g. no projects), return an empty array for it instead of fabricating one.`;

// Passed as generationConfig.responseSchema - Gemini enforces this shape
// server-side, so the response is guaranteed valid JSON matching exactly
// this structure. No manual extraction/parsing needed.
const RESUME_SCHEMA = {
  type: 'object',
  properties: {
    fullName: { type: 'string' },
    title: { type: 'string' },
    summary: { type: 'string' },
    contact: { type: 'string' },
    skills: { type: 'array', items: { type: 'string' } },
    experience: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          company: { type: 'string' },
          role: { type: 'string' },
          dates: { type: 'string' },
          bullets: { type: 'array', items: { type: 'string' } }
        },
        required: ['company', 'role', 'dates', 'bullets']
      }
    },
    education: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          school: { type: 'string' },
          degree: { type: 'string' },
          dates: { type: 'string' }
        },
        required: ['school', 'degree', 'dates']
      }
    },
    projects: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          bullets: { type: 'array', items: { type: 'string' } }
        },
        required: ['name', 'bullets']
      }
    }
  },
  required: ['fullName', 'title', 'summary', 'contact', 'skills', 'experience', 'education', 'projects']
};

export async function generateTailoredContent({ resumeText, jobDescription, matchedSkills = [], missingSkills = [] }) {
  const userPrompt = `SOURCE RESUME:\n"""${resumeText.slice(0, 6000)}"""\n\nJOB DESCRIPTION:\n"""${jobDescription.slice(0, 3000)}"""\n\nSkills the resume already matches for this job: ${matchedSkills.join(', ') || 'none detected'}.\nSkills the job wants but the resume is missing: ${missingSkills.join(', ') || 'none'}.\n\nRewrite the resume as instructed.`;

  const parsed = await askGemini({
    system: SYSTEM_PROMPT,
    user: userPrompt,
    temperature: 0.3,
    maxTokens: 4096,
    responseSchema: RESUME_SCHEMA
  });

  // Defensive normalization - never let a malformed field crash the renderer.
  return {
    fullName: parsed.fullName || '',
    title: parsed.title || '',
    summary: parsed.summary || '',
    contact: parsed.contact || '',
    skills: Array.isArray(parsed.skills) ? parsed.skills : [],
    experience: Array.isArray(parsed.experience)
      ? parsed.experience.map((e) => ({
          company: e.company || '',
          role: e.role || '',
          dates: e.dates || '',
          bullets: Array.isArray(e.bullets) ? e.bullets : []
        }))
      : [],
    education: Array.isArray(parsed.education)
      ? parsed.education.map((e) => ({ school: e.school || '', degree: e.degree || '', dates: e.dates || '' }))
      : [],
    projects: Array.isArray(parsed.projects)
      ? parsed.projects.map((p) => ({ name: p.name || '', bullets: Array.isArray(p.bullets) ? p.bullets : [] }))
      : []
  };
}