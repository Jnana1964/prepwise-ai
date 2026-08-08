import { Job, ResumeAnalysis } from '../models/index.js';
import { computeMatch, mergeMissingSkills } from '../services/jobMatcher.js';
import { buildJobInsight } from '../services/jobInsight.js';
import { syncInternshala } from '../services/internshalaScraper.js';

export async function getMatches(req, res) {
  const analysis = await ResumeAnalysis.findOne({ where: { userId: req.userId }, order: [['createdAt', 'DESC']] });
  if (!analysis) {
    return res.json({ jobs: [], message: 'Complete Resume Intelligence first to unlock job matches.' });
  }

  // Only ever show jobs with a real, specific application link - never a
  // job row missing an applyUrl entirely (defensive; the current source,
  // the Internshala scraper, always sets one).
  const jobs = (await Job.findAll()).filter((j) => !!j.applyUrl);
  let discoveredMissing = [];

  const scored = jobs.map((job) => {
    const { matchPercent, matchedSkills, missingSkills } = computeMatch(job, analysis);
    discoveredMissing = discoveredMissing.concat(missingSkills);
    return {
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      tags: job.requiredSkills,
      matchPercent,
      matchedSkills,
      missingSkills,
      applyUrl: job.applyUrl,
      insight: buildJobInsight({ matchedSkills, missingSkills, analysis })
    };
  });

  // Bidirectional edge from the locked spec: fold newly discovered skill
  // gaps back into the shared Resume Analysis Profile so Resume
  // Improvement / Skill Builder pick them up automatically. This is the
  // ONE field jobs.controller.js is allowed to write on ResumeAnalysis.
  if (mergeMissingSkills(analysis, discoveredMissing)) {
    await analysis.save();
  }

  scored.sort((a, b) => b.matchPercent - a.matchPercent);
  res.json({ jobs: scored });
}

export async function getJobDetail(req, res) {
  const job = await Job.findByPk(req.params.jobId);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  res.json(job);
}

// Manual trigger for the Internshala sync (also runs automatically on
// server startup and on a schedule - see server.js). Lets you refresh
// on-demand instead of waiting for the next scheduled run, e.g. right
// after setting this up for the first time.
export async function syncInternshalaJobs(_req, res) {
  const summary = await syncInternshala();
  res.json(summary);
}
