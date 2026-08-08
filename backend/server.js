import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { connectDB } from './config/db.js';
import { syncDatabase } from './models/index.js';
import { syncInternshala } from './services/internshalaScraper.js';

import authRoutes from './routes/auth.routes.js';
import resumeRoutes from './routes/resume.routes.js';
import jobsRoutes from './routes/jobs.routes.js';
import applicationsRoutes from './routes/applications.routes.js';
import skillsRoutes from './routes/skills.routes.js';
import interviewRoutes from './routes/interview.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import assessmentRoutes from './routes/assessment.routes.js';
import companiesRoutes from './routes/companies.routes.js';

export function createApp() {
  const app = express();

  const allowedOrigins = [
  'http://localhost:5173',
  'https://prepwise-ai-pink.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
  app.use(express.json());

  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  app.use('/api/auth', authRoutes);
  app.use('/api/resume', resumeRoutes);
  app.use('/api/jobs', jobsRoutes);
  app.use('/api/applications', applicationsRoutes);
  app.use('/api/skills', skillsRoutes);
  app.use('/api/interview', interviewRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/assessment', assessmentRoutes);
  app.use('/api/companies', companiesRoutes);

  // Centralized error handler - multer errors (file too large / wrong type)
  // and any thrown/rejected controller errors land here as JSON, never a
  // raw stack trace to the client.
  app.use((err, _req, res, _next) => {
    console.error(err);
    const status = err.status || 500;
    res.status(status).json({ message: err.message || 'Something went wrong' });
  });

  return app;
}

const app = createApp();

if (process.env.NODE_ENV !== 'test') {
  // Defaults to 3000, not 5000 - Login.jsx/Signup.jsx hardcode
  // http://localhost:3000/api/auth/... directly (they don't go through the
  // Vite proxy), so the backend must match that exact port.
  const PORT = process.env.PORT || 3000;

  connectDB()
    .then(() => syncDatabase())
    .then(() => {
      app.listen(PORT, () => console.log(`PrepWise AI backend running on port ${PORT}`));

      // Real Internshala listings for Opportunity Matcher. Runs once
      // shortly after startup (so the very first Opportunity Matcher view
      // has real data), then on a schedule. Disabled by setting
      // INTERNSHALA_SYNC_ENABLED=false in .env. Never blocks server
      // startup and never crashes the process - internshalaScraper.js
      // fails soft and just logs on error.
      if (process.env.INTERNSHALA_SYNC_ENABLED !== 'false') {
        setTimeout(() => {
          syncInternshala().catch((err) => console.warn('[internshala] startup sync failed:', err.message));
        }, 5000);

        const schedule = process.env.INTERNSHALA_SYNC_CRON || '0 */6 * * *'; // every 6 hours
        cron.schedule(schedule, () => {
          syncInternshala().catch((err) => console.warn('[internshala] scheduled sync failed:', err.message));
        });
      }
    })
    .catch((err) => {
      console.error('Failed to connect to MySQL', err);
      process.exit(1);
    });
}

export default app;
