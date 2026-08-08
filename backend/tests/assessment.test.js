import request from 'supertest';
import { app, createUser } from './helpers.js';
import { QUESTION_BANK } from '../data/skillQuestions.js';

const THRESHOLD = Number(process.env.MOCK_ASSESSMENT_PASS_THRESHOLD);

async function completeSkillBuilder(token) {
  for (const category of ['mcq', 'coding', 'aptitude', 'hr', 'company']) {
    const count = QUESTION_BANK[category].length;
    for (let i = 0; i < count; i++) {
      await request(app)
        .post('/api/skills/attempt/x/answer')
        .set('Authorization', `Bearer ${token}`)
        .send({ category, correct: true });
    }
  }
}

function sectionScoresAt(score) {
  return { aptitude: score, technicalMcq: score, programming: score, csFundamentals: score };
}

describe('Mock Assessment gating', () => {
  test('blocks assessment submission until every Skill Builder category is fully practiced', async () => {
    const { token } = await createUser();
    const res = await request(app)
      .post('/api/assessment')
      .set('Authorization', `Bearer ${token}`)
      .send({ company: 'TCS', sectionScores: sectionScoresAt(90) });
    expect(res.status).toBe(403);
  });

  test('reports skillBuilderComplete=false before practicing, true after', async () => {
    const { token } = await createUser();
    const before = await request(app).get('/api/assessment/eligibility').set('Authorization', `Bearer ${token}`);
    expect(before.body.skillBuilderComplete).toBe(false);

    await completeSkillBuilder(token);

    const after = await request(app).get('/api/assessment/eligibility').set('Authorization', `Bearer ${token}`);
    expect(after.body.skillBuilderComplete).toBe(true);
  });

  test('allows submission once Skill Builder is complete, and records the configured threshold on the attempt', async () => {
    const { token } = await createUser();
    await completeSkillBuilder(token);

    const res = await request(app)
      .post('/api/assessment')
      .set('Authorization', `Bearer ${token}`)
      .send({ company: 'TCS', sectionScores: sectionScoresAt(90) });
    expect(res.status).toBe(201);
    expect(res.body.passThreshold).toBe(THRESHOLD);
  });

  test('a score exactly at the threshold counts as passed (boundary, not off-by-one)', async () => {
    const { token } = await createUser();
    await completeSkillBuilder(token);

    const res = await request(app)
      .post('/api/assessment')
      .set('Authorization', `Bearer ${token}`)
      .send({ company: 'TCS', sectionScores: sectionScoresAt(THRESHOLD) });
    expect(res.body.score).toBe(THRESHOLD);
    expect(res.body.passed).toBe(true);
  });

  test('a score exactly one point below the threshold counts as failed', async () => {
    const { token } = await createUser();
    await completeSkillBuilder(token);

    const res = await request(app)
      .post('/api/assessment')
      .set('Authorization', `Bearer ${token}`)
      .send({ company: 'TCS', sectionScores: sectionScoresAt(THRESHOLD - 1) });
    expect(res.body.score).toBe(THRESHOLD - 1);
    expect(res.body.passed).toBe(false);
  });
});

describe('AI Mock Interview gating (depends on Mock Assessment)', () => {
  test('blocks interview start when no assessment attempt exists for that company', async () => {
    const { token } = await createUser();
    const res = await request(app).post('/api/interview/start').set('Authorization', `Bearer ${token}`).send({ company: 'TCS' });
    expect(res.status).toBe(403);
  });

  test('blocks interview start when the latest assessment score is below threshold', async () => {
    const { token } = await createUser();
    await completeSkillBuilder(token);
    await request(app)
      .post('/api/assessment')
      .set('Authorization', `Bearer ${token}`)
      .send({ company: 'TCS', sectionScores: sectionScoresAt(THRESHOLD - 5) });

    const res = await request(app).post('/api/interview/start').set('Authorization', `Bearer ${token}`).send({ company: 'TCS' });
    expect(res.status).toBe(403);
  });

  test('unlocks interview start once the assessment score meets the threshold, and returns the first question', async () => {
    const { token } = await createUser();
    await completeSkillBuilder(token);
    await request(app)
      .post('/api/assessment')
      .set('Authorization', `Bearer ${token}`)
      .send({ company: 'TCS', sectionScores: sectionScoresAt(THRESHOLD) });

    const res = await request(app).post('/api/interview/start').set('Authorization', `Bearer ${token}`).send({ company: 'TCS' });
    expect(res.status).toBe(201);
    expect(res.body.question).toEqual(expect.any(String));
    expect(res.body.totalQuestions).toBeGreaterThan(0);
  });

  test('an unlocked assessment for one company does not unlock the interview for a different company', async () => {
    const { token } = await createUser();
    await completeSkillBuilder(token);
    await request(app)
      .post('/api/assessment')
      .set('Authorization', `Bearer ${token}`)
      .send({ company: 'TCS', sectionScores: sectionScoresAt(95) });

    const res = await request(app).post('/api/interview/start').set('Authorization', `Bearer ${token}`).send({ company: 'Amazon' });
    expect(res.status).toBe(403);
  });
});
