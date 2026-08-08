import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Homepage from './pages/Homepage.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import CareerCommandCenter from './pages/CareerCommandCenter.jsx';
import ResumeUpload from './pages/ResumeUpload.jsx';
import ResumeAnalysis from './pages/ResumeAnalysis.jsx';
import ImproveResume from './pages/ImproveResume.jsx';
import EditResume from './pages/EditResume.jsx';
import TailoredResume from './pages/TailoredResume.jsx';
import OpportunityMatcher from './pages/OpportunityMatcher.jsx';
import Applications from './pages/Applications.jsx';
import SkillBuilder from './pages/SkillBuilder.jsx';
import SkillPractice from './pages/SkillPractice.jsx';
import MockAssessment from './pages/MockAssessment.jsx';
import AIMockInterview from './pages/AIMockInterview.jsx';
import PerformanceAnalytics from './pages/PerformanceAnalytics.jsx';
import TrackRecord from './pages/TrackRecord.jsx';
import SkillHistory from './pages/SkillHistory.jsx';
import AssessmentHistory from './pages/AssessmentHistory.jsx';
import InterviewHistory from './pages/InterviewHistory.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<CareerCommandCenter />} />
          <Route path="/resume/upload" element={<ResumeUpload />} />
          <Route path="/resume/:resumeId/analysis" element={<ResumeAnalysis />} />
          <Route path="/resume/:resumeId/improve" element={<ImproveResume />} />
          <Route path="/resume/:resumeId/edit" element={<EditResume />} />
          <Route path="/resume/:resumeId/tailor" element={<TailoredResume />} />
          <Route path="/opportunities" element={<OpportunityMatcher />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/skills" element={<SkillBuilder />} />
          <Route path="/skills/:category" element={<SkillPractice />} />
          <Route path="/assessment" element={<MockAssessment />} />
          <Route path="/interview" element={<AIMockInterview />} />
          <Route path="/analytics" element={<PerformanceAnalytics />} />
          <Route path="/track-record" element={<TrackRecord />} />
          <Route path="/track-record/skills" element={<SkillHistory />} />
          <Route path="/track-record/assessment" element={<AssessmentHistory />} />
          <Route path="/track-record/interview" element={<InterviewHistory />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}