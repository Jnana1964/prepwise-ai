import { computeMatch, mergeMissingSkills } from '../services/jobMatcher.js';

describe('computeMatch', () => {
  test('100% skill coverage plus perfect quality scores yields the maximum match, clamped to 100', () => {
    const job = { requiredSkills: ['react', 'javascript'] };
    const analysis = { skills: ['react', 'javascript', 'node'], atsScore: 100, recruiterScore: 100 };
    const { matchPercent } = computeMatch(job, analysis);
    expect(matchPercent).toBeLessThanOrEqual(100);
    expect(matchPercent).toBeGreaterThanOrEqual(95);
  });

  test('zero overlap between required and resume skills still returns a low, non-negative match', () => {
    const job = { requiredSkills: ['rust', 'kubernetes'] };
    const analysis = { skills: ['react', 'javascript'], atsScore: 50, recruiterScore: 50 };
    const { matchPercent, matchedSkills, missingSkills } = computeMatch(job, analysis);
    expect(matchPercent).toBeGreaterThanOrEqual(0);
    expect(matchedSkills).toHaveLength(0);
    expect(missingSkills).toEqual(['rust', 'kubernetes']);
  });

  test('job with no required skills at all does not throw and falls back to a neutral coverage score', () => {
    const job = { requiredSkills: [] };
    const analysis = { skills: ['react'], atsScore: 80, recruiterScore: 80 };
    expect(() => computeMatch(job, analysis)).not.toThrow();
    const { matchPercent } = computeMatch(job, analysis);
    expect(matchPercent).toBeGreaterThan(0);
  });

  test('skill matching is case-insensitive', () => {
    const job = { requiredSkills: ['React', 'JavaScript'] };
    const analysis = { skills: ['react', 'javascript'], atsScore: 70, recruiterScore: 70 };
    const { matchedSkills } = computeMatch(job, analysis);
    expect(matchedSkills).toEqual(['react', 'javascript']);
  });

  test('a stronger resume (higher ATS/recruiter score) scores at least as high on an identical skill set', () => {
    const job = { requiredSkills: ['react'] };
    const weakAnalysis = { skills: ['react'], atsScore: 40, recruiterScore: 40 };
    const strongAnalysis = { skills: ['react'], atsScore: 95, recruiterScore: 95 };
    expect(computeMatch(job, strongAnalysis).matchPercent).toBeGreaterThanOrEqual(computeMatch(job, weakAnalysis).matchPercent);
  });
});

describe('mergeMissingSkills', () => {
  test('adds genuinely new missing skills and reports that a change happened', () => {
    const analysis = { missingSkills: ['docker'] };
    const changed = mergeMissingSkills(analysis, ['docker', 'kubernetes', 'redis']);
    expect(changed).toBe(true);
    expect(analysis.missingSkills).toEqual(expect.arrayContaining(['docker', 'kubernetes', 'redis']));
    expect(analysis.missingSkills.filter((s) => s === 'docker')).toHaveLength(1);
  });

  test('reports no change when every skill is already tracked (no duplicates introduced)', () => {
    const analysis = { missingSkills: ['docker', 'kubernetes'] };
    const changed = mergeMissingSkills(analysis, ['docker', 'kubernetes']);
    expect(changed).toBe(false);
    expect(analysis.missingSkills).toHaveLength(2);
  });

  test('is case-insensitive when deduplicating', () => {
    const analysis = { missingSkills: ['Docker'] };
    const changed = mergeMissingSkills(analysis, ['docker']);
    expect(changed).toBe(false);
  });

  test('handles an analysis with no prior missingSkills array', () => {
    const analysis = {};
    const changed = mergeMissingSkills(analysis, ['docker']);
    expect(changed).toBe(true);
    expect(analysis.missingSkills).toEqual(['docker']);
  });
});
