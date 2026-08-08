import { analyzeResume } from '../services/atsEngine.js';

const STRONG_RESUME = `
Contact: jane@example.com | +1 415 555 0100 | linkedin.com/in/jane | github.com/jane

Summary
Frontend engineer focused on React and performance.

Education
B.S. Computer Science, State University

Experience
Software Engineer - Acme Inc
- Built a React dashboard used by 500+ internal users
- Reduced page load time by 30% using code splitting
- Implemented REST API integration with Node.js backend
- Increased test coverage by 40% using Jest

Projects
Task Manager - React, Redux, MongoDB
- Developed a full stack task management app with authentication

Certifications
AWS Certified Cloud Practitioner

Skills
JavaScript, TypeScript, React, Redux, Node.js, MongoDB, Git, HTML, CSS
`;

const EMPTY_RESUME = 'x'.repeat(40);

describe('analyzeResume - deterministic scoring', () => {
  test('returns identical output for identical input (determinism, no randomness)', () => {
    const a = analyzeResume({ rawText: STRONG_RESUME, jobDescription: '' });
    const b = analyzeResume({ rawText: STRONG_RESUME, jobDescription: '' });
    expect(a).toEqual(b);
  });

  test('every numeric score is clamped between 0 and 100', () => {
    for (const text of [STRONG_RESUME, EMPTY_RESUME]) {
      const result = analyzeResume({ rawText: text, jobDescription: '' });
      for (const key of ['atsScore', 'recruiterScore', 'resumeScore', 'resumeQuality']) {
        expect(result[key]).toBeGreaterThanOrEqual(0);
        expect(result[key]).toBeLessThanOrEqual(100);
        expect(Number.isInteger(result[key])).toBe(true);
      }
    }
  });

  test('a resume with real sections, skills, and quantified achievements scores meaningfully higher than a near-empty one', () => {
    const strong = analyzeResume({ rawText: STRONG_RESUME, jobDescription: '' });
    const weak = analyzeResume({ rawText: EMPTY_RESUME, jobDescription: '' });
    expect(strong.atsScore).toBeGreaterThan(weak.atsScore);
    expect(strong.recruiterScore).toBeGreaterThan(weak.recruiterScore);
    expect(strong.skills.length).toBeGreaterThan(weak.skills.length);
  });

  test('detects skills case-insensitively and does not fabricate skills not present in the text', () => {
    const result = analyzeResume({ rawText: STRONG_RESUME, jobDescription: '' });
    expect(result.skills).toEqual(expect.arrayContaining(['react', 'javascript', 'typescript', 'mongodb']));
    expect(result.skills).not.toContain('rust');
    expect(result.skills).not.toContain('kubernetes');
  });

  test('jdMatch is null when no job description is provided', () => {
    const result = analyzeResume({ rawText: STRONG_RESUME, jobDescription: '' });
    expect(result.jdMatch).toBeNull();
  });

  test('jdMatch is 100 when every JD skill is present in the resume', () => {
    const jd = 'Looking for a React and JavaScript developer.';
    const result = analyzeResume({ rawText: STRONG_RESUME, jobDescription: jd });
    expect(result.jdMatch).toBe(100);
  });

  test('jdMatch reflects partial overlap and reports the missing skills', () => {
    const jd = 'Looking for a React, JavaScript, and Kubernetes engineer with GraphQL experience.';
    const result = analyzeResume({ rawText: STRONG_RESUME, jobDescription: jd });
    expect(result.jdMatch).toBeGreaterThan(0);
    expect(result.jdMatch).toBeLessThan(100);
    expect(result.missingSkills).toEqual(expect.arrayContaining(['kubernetes', 'graphql']));
  });

  test('all sections detected on a complete resume', () => {
    const result = analyzeResume({ rawText: STRONG_RESUME, jobDescription: '' });
    expect(result.sectionsFound).toBe(result.totalSections);
    expect(result.sections.every((s) => s.status === 'ok')).toBe(true);
  });

  test('missing sections are individually flagged, not just counted', () => {
    const noEducation = STRONG_RESUME.replace(/Education[\s\S]*?Experience/, 'Experience');
    const result = analyzeResume({ rawText: noEducation, jobDescription: '' });
    const educationSection = result.sections.find((s) => s.name === 'Education');
    expect(educationSection.status).toBe('missing');
    expect(result.sectionsFound).toBeLessThan(result.totalSections);
  });

  test('predicts a role from the strongest matching skill cluster', () => {
    const result = analyzeResume({ rawText: STRONG_RESUME, jobDescription: '' });
    expect(['Frontend Developer', 'Full Stack Developer']).toContain(result.predictedRole);
  });

  test('falls back to a generic role when no cluster matches', () => {
    const result = analyzeResume({ rawText: EMPTY_RESUME, jobDescription: '' });
    expect(result.predictedRole).toBe('Software Engineer');
  });

  test('suggestionsByTab always has all four tabs, each an array', () => {
    const result = analyzeResume({ rawText: EMPTY_RESUME, jobDescription: '' });
    for (const tab of ['keywords', 'sections', 'certifications', 'formatting']) {
      expect(Array.isArray(result.suggestionsByTab[tab])).toBe(true);
    }
  });

  test('formatting suggestions recommend bullet points when the resume has none', () => {
    const noBullets = STRONG_RESUME.replace(/^- /gm, '');
    const result = analyzeResume({ rawText: noBullets, jobDescription: '' });
    const formatting = result.suggestionsByTab.formatting;
    expect(formatting.some((s) => /bullet/i.test(s.text))).toBe(true);
  });

  test('aiReview is a deterministic string derived from real numbers, not a placeholder', () => {
    const result = analyzeResume({ rawText: STRONG_RESUME, jobDescription: '' });
    expect(result.aiReview).toContain(String(result.atsScore));
    expect(result.aiReview).not.toMatch(/lorem ipsum|placeholder|TODO/i);
  });
});
