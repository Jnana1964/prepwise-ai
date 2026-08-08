import { Application } from '../models/index.js';
import { recordMetric } from '../services/metrics.js';

export async function listApplications(req, res) {
  const apps = await Application.findAll({ where: { userId: req.userId }, order: [['createdAt', 'DESC']] });
  res.json({
    applications: apps.map((a) => ({
      id: a.id,
      company: a.company,
      role: a.role,
      status: a.status,
      matchPercent: a.matchPercent,
      appliedOn: new Date(a.appliedOn).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
      notes: a.notes
    }))
  });
}

export async function createApplication(req, res) {
  const { jobId, company, role, matchPercent, status, notes } = req.body;
  if (!company || !role) return res.status(400).json({ message: 'company and role are required' });

  // Guard against duplicate rows: saving the same job (from Opportunity
  // Matcher) or the same company+role pair (from the manual Add
  // Application form) twice should update the existing row, not insert
  // a new one.
  const existing = await Application.findOne({
    where: jobId
      ? { userId: req.userId, jobId }
      : { userId: req.userId, company, role }
  });
  if (existing) {
    return res.status(200).json({ id: existing.id, duplicate: true });
  }

  const app = await Application.create({
    userId: req.userId,
    jobId: jobId || null,
    company,
    role,
    matchPercent: matchPercent ?? null,
    status: status || 'saved',
    notes: notes || ''
  });

  const count = await Application.count({ where: { userId: req.userId } });
  await recordMetric(req.userId, 'applications_count', count);

  res.status(201).json({ id: app.id });
}

export async function updateApplication(req, res) {
  const app = await Application.findOne({ where: { id: req.params.id, userId: req.userId } });
  if (!app) return res.status(404).json({ message: 'Application not found' });

  const allowed = ['company', 'role', 'status', 'matchPercent', 'notes'];
  for (const key of allowed) {
    if (key in req.body) app[key] = req.body[key];
  }
  await app.save();
  res.json({ id: app.id, status: app.status });
}

export async function deleteApplication(req, res) {
  const deleted = await Application.destroy({ where: { id: req.params.id, userId: req.userId } });
  if (deleted === 0) return res.status(404).json({ message: 'Application not found' });
  res.status(204).end();
}
