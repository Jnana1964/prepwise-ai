import { sequelize } from '../config/db.js';
import User from './User.js';
import Resume from './Resume.js';
import ResumeAnalysis from './ResumeAnalysis.js';
import Job from './Job.js';
import Application from './Application.js';
import SkillProgress from './SkillProgress.js';
import SkillAttempt from './SkillAttempt.js';
import AssessmentAttempt from './AssessmentAttempt.js';
import InterviewSession from './InterviewSession.js';
import InterviewQuestion from './InterviewQuestion.js';
import MetricSnapshot from './MetricSnapshot.js';
import Company from './Company.js';

User.hasMany(Resume, { foreignKey: 'userId' });
User.hasMany(ResumeAnalysis, { foreignKey: 'userId' });
User.hasMany(Application, { foreignKey: 'userId' });
User.hasMany(SkillProgress, { foreignKey: 'userId' });
User.hasMany(SkillAttempt, { foreignKey: 'userId' });
User.hasMany(AssessmentAttempt, { foreignKey: 'userId' });
User.hasMany(InterviewSession, { foreignKey: 'userId' });
User.hasMany(MetricSnapshot, { foreignKey: 'userId' });

Resume.hasOne(ResumeAnalysis, { foreignKey: 'resumeId' });
ResumeAnalysis.belongsTo(Resume, { foreignKey: 'resumeId' });

Job.hasMany(Application, { foreignKey: 'jobId' });
Application.belongsTo(Job, { foreignKey: 'jobId' });

Company.hasMany(AssessmentAttempt, { foreignKey: 'companyId' });
Company.hasMany(InterviewSession, { foreignKey: 'companyId' });

InterviewSession.hasMany(InterviewQuestion, { foreignKey: 'sessionId', as: 'questions' });
InterviewQuestion.belongsTo(InterviewSession, { foreignKey: 'sessionId' });

export async function syncDatabase({ force = false } = {}) {
  await sequelize.sync({ force });
}

export {
  sequelize,
  User,
  Resume,
  ResumeAnalysis,
  Job,
  Application,
  SkillProgress,
  SkillAttempt,
  AssessmentAttempt,
  InterviewSession,
  InterviewQuestion,
  MetricSnapshot,
  Company
};