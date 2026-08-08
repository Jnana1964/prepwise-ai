import { MetricSnapshot } from '../models/index.js';

// Every module that changes a score calls this instead of just updating the
// "latest" value in place. Performance Analytics reads the history back out
// (see analytics.controller.js) to compute real deltas, not display a
// static number.
export async function recordMetric(userId, metric, value) {
  await MetricSnapshot.create({ userId, metric, value });
}

export async function getTrend(userId, metric, limit = 10) {
  const rows = await MetricSnapshot.findAll({
    where: { userId, metric },
    order: [['recordedAt', 'ASC']],
    limit
  });
  return rows.map((r) => ({
    label: new Date(r.recordedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
    value: r.value
  }));
}

export async function getDelta(userId, metric) {
  const rows = await MetricSnapshot.findAll({
    where: { userId, metric },
    order: [['recordedAt', 'DESC']],
    limit: 2
  });
  if (rows.length < 2) return 0;
  return Math.round(rows[0].value - rows[1].value);
}
// "Overview" trend for Performance Analytics: blends interview, coding
// (Skill Builder), and aptitude scores into ONE line. Every individual
// score update (across all three metrics) becomes its own point - same
// density as the single-metric trends (getTrend) - by keeping a running
// "latest known value" per metric and re-blending the average each time
// any one of them changes. A metric with no data yet is excluded from the
// average rather than counted as 0, so an early Coding session doesn't
// unfairly tank the blended score before you've done an Interview or
// Aptitude round.
export async function getBlendedTrend(userId, metricList, limit = 10) {
  const rows = await MetricSnapshot.findAll({
    where: { userId, metric: metricList },
    order: [['recordedAt', 'ASC']]
  });
  if (rows.length === 0) return [];

  const carried = {};
  const points = [];
  for (const row of rows) {
    carried[row.metric] = row.value;
    const known = metricList.filter((m) => carried[m] !== undefined).map((m) => carried[m]);
    if (known.length === 0) continue;
    const blended = known.reduce((a, b) => a + b, 0) / known.length;
    points.push({
      label: new Date(row.recordedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      value: Math.round(blended)
    });
  }

  return points.slice(-limit);
}