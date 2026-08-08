-- PrepWise AI — MySQL schema
-- Matches backend/models/*.js exactly. Sequelize normally creates these
-- tables for you on server start via syncDatabase() in server.js — this
-- file exists so you can create the database by hand, inspect it in
-- MySQL Workbench / phpMyAdmin / the mysql CLI, and see exactly what
-- signup/login write to.

CREATE DATABASE IF NOT EXISTS prepwise_ai_app
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE prepwise_ai_app;

-- ---------------------------------------------------------------------
-- users — created by POST /api/auth/signup, read by POST /api/auth/login
-- ---------------------------------------------------------------------
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  passwordHash VARCHAR(255) NOT NULL,
  unreadNotifications INT DEFAULT 0,
  plan ENUM('free','pro') DEFAULT 'free',
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- companies — searchable list for Mock Assessment / AI Mock Interview
-- ---------------------------------------------------------------------
CREATE TABLE companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  industry VARCHAR(255) DEFAULT '',
  logoInitial VARCHAR(2) DEFAULT '',
  assessmentPattern ENUM('aptitude_heavy','coding_heavy','balanced','behavioral_heavy') DEFAULT 'balanced',
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- jobs — Opportunity Matcher listings
-- ---------------------------------------------------------------------
CREATE TABLE jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255) DEFAULT 'Remote',
  salary VARCHAR(255) DEFAULT '',
  jobType VARCHAR(255) DEFAULT 'Internship',
  requiredSkills JSON,
  tags JSON,
  applyUrl VARCHAR(255) NOT NULL,
  source VARCHAR(255) DEFAULT 'manual',
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- resumes — raw upload + extracted text (direct editor writes rawText)
-- ---------------------------------------------------------------------
CREATE TABLE resumes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  storagePath VARCHAR(255) NOT NULL,
  rawText LONGTEXT NOT NULL,
  jobDescription TEXT,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  CONSTRAINT fk_resumes_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- resume_analyses — the shared ResumeAnalysisProfile, one row per resume
-- ---------------------------------------------------------------------
CREATE TABLE resume_analyses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  resumeId INT NOT NULL UNIQUE,
  atsScore INT NOT NULL,
  recruiterScore INT NOT NULL,
  resumeScore INT NOT NULL,
  resumeQuality INT NOT NULL,
  jdMatch INT NULL,
  predictedRole VARCHAR(255) DEFAULT '',
  skills JSON,
  missingSkills JSON,
  missingKeywords JSON,
  projects JSON,
  experience JSON,
  education JSON,
  certifications JSON,
  sections JSON,
  strengths JSON,
  weaknesses JSON,
  suggestionsByTab JSON,
  aiReview TEXT,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  CONSTRAINT fk_analysis_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_analysis_resume FOREIGN KEY (resumeId) REFERENCES resumes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- applications — Applications tracker
-- ---------------------------------------------------------------------
CREATE TABLE applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  jobId INT NULL,
  company VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  matchPercent INT NULL,
  status ENUM('saved','applied','online_assessment','interview','hr','offered','rejected') DEFAULT 'saved',
  appliedOn DATETIME DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  CONSTRAINT fk_app_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_app_job FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- skill_progress — owned exclusively by Skill Builder
-- ---------------------------------------------------------------------
CREATE TABLE skill_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  category ENUM('mcq','coding','ai_tutor','aptitude','hr','company') NOT NULL,
  completed INT DEFAULT 0,
  total INT DEFAULT 0,
  correctRate FLOAT DEFAULT 0,
  lastPracticedAt DATETIME NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  UNIQUE KEY uniq_user_category (userId, category),
  CONSTRAINT fk_skill_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- assessment_attempts — owned exclusively by Mock Assessment
-- ---------------------------------------------------------------------
CREATE TABLE assessment_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  companyId INT NULL,
  companyName VARCHAR(255) NOT NULL,
  score INT NOT NULL,
  passThreshold INT NOT NULL,
  passed TINYINT(1) NOT NULL,
  sectionScores JSON,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  CONSTRAINT fk_assess_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_assess_company FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- interview_sessions — owned exclusively by AI Mock Interview
-- ---------------------------------------------------------------------
CREATE TABLE interview_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  companyId INT NULL,
  companyName VARCHAR(255) NOT NULL,
  currentIndex INT DEFAULT 0,
  status ENUM('active','ended') DEFAULT 'active',
  overallScore FLOAT NULL,
  confidenceScore INT NULL,
  communicationScore INT NULL,
  technicalScore INT NULL,
  behavioralScore INT NULL,
  weakTopics JSON,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  CONSTRAINT fk_interview_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_interview_company FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- interview_questions — child rows of interview_sessions
-- ---------------------------------------------------------------------
CREATE TABLE interview_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sessionId INT NOT NULL,
  position INT NOT NULL,
  prompt TEXT NOT NULL,
  type ENUM('hr','technical','coding','resume','project','behavioral') NOT NULL,
  answer TEXT,
  communication INT NULL,
  technical INT NULL,
  confidence INT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  CONSTRAINT fk_question_session FOREIGN KEY (sessionId) REFERENCES interview_sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- metric_snapshots — time series behind Performance Analytics + Dashboard
-- ---------------------------------------------------------------------
CREATE TABLE metric_snapshots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  metric ENUM('ats_score','resume_score','interview_score','coding_score','aptitude_score','applications_count') NOT NULL,
  value FLOAT NOT NULL,
  recordedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  CONSTRAINT fk_metric_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
