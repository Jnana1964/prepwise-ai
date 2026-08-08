import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Briefcase, Rocket, ChevronRight, CheckCircle2, FileEdit } from 'lucide-react';
import { analyticsApi } from '../api/client.js';
import StatCard from '../components/StatCard.jsx';
import RadialProgress from '../components/RadialProgress.jsx';
import ProgressStepper from '../components/ProgressStepper.jsx';
import { Loader, ErrorState } from '../components/Loader.jsx';

export default function CareerCommandCenter() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | error | ready

  const load = async () => {
    setStatus('loading');
    try {
      const { data } = await analyticsApi.dashboard();
      setData(data);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (status === 'loading') return <Loader text="Loading your dashboard..." />;
  if (status === 'error') return <ErrorState message="Couldn't load your dashboard." onRetry={load} />;

  const j = data.journey;
  const steps = [
    { label: 'Resume', sub: 'Completed', status: j.resume === 'done' ? 'done' : j.resume === 'active' ? 'active' : 'pending' },
    { label: 'Analysis', sub: 'Completed', status: j.analysis === 'done' ? 'done' : j.analysis === 'active' ? 'active' : 'pending' },
    { label: 'Mock Tests', sub: 'In Progress', status: j.mockTests === 'done' ? 'done' : j.mockTests === 'active' ? 'active' : 'pending' },
    { label: 'Interview Prep', sub: 'Pending', status: j.interviewPrep === 'done' ? 'done' : j.interviewPrep === 'active' ? 'active' : 'pending' },
    { label: 'Placement', sub: 'Ready', status: j.placement === 'done' ? 'done' : j.placement === 'active' ? 'active' : 'pending' }
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-4 gap-5">
        <StatCard label="Resume Score" value={data.resumeScore ?? '—'} unit="/100" sub={data.resumeScore >= 70 ? 'Strong Profile' : 'Needs Work'} trend={data.resumeScoreTrend} />
        <div className="card p-5 flex items-center justify-between">
          <div>
            <p className="text-muted text-sm mb-2">Career Readiness</p>
            <p className="text-3xl font-bold text-fg">{data.careerReadiness}%</p>
            <p className="text-xs text-muted mt-1">Keep Improving</p>
          </div>
          <RadialProgress value={data.careerReadiness} />
        </div>
        <StatCard
          label="Interviews Prepared"
          value={data.interviewsPrepared}
          sub={`${data.interviewsPreparedThisWeek} This Week`}
          icon={Calendar}
        />
        <StatCard
          label="Applications"
          value={data.applications}
          sub={`${data.applicationsThisWeek} This Week`}
          icon={Briefcase}
        />
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="card p-6 col-span-2">
          <h3 className="text-fg font-semibold text-lg">Your Progress</h3>
          <p className="text-muted text-sm mb-6">Your placement journey</p>
          <ProgressStepper steps={steps} />

          <div className="mt-8">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-fg text-sm font-medium">Progress Overview</p>
                <p className="text-muted text-xs">Track your journey progress</p>
              </div>
              <span className="text-fg font-semibold">{data.progressPercent}%</span>
            </div>
            <div className="h-2 rounded-full bg-surface2 overflow-hidden">
              <div className="h-full bg-accent-500 rounded-full" style={{ width: `${data.progressPercent}%` }} />
            </div>
          </div>
        </div>

        <div className="card p-6 flex flex-col">
          <h3 className="text-fg font-semibold text-lg">AI Recommendation</h3>
          <p className="text-muted text-sm mb-4">Based on your profile and progress</p>
          <div className="flex-1 flex flex-col items-center text-center gap-4 py-2">
            <div className="w-16 h-16 rounded-full bg-accent-500/10 border border-accent-500/40 flex items-center justify-center">
              <Rocket size={26} className="text-accent-500" />
            </div>
            <p className="text-sm text-fg">{data.aiRecommendation?.text}</p>
          </div>
          <button
            onClick={() => navigate(data.aiRecommendation?.href || data.nextStep?.href || '/resume/upload')}
            className="btn-accent px-4 py-2.5 text-sm mt-2"
          >
            {data.aiRecommendation?.ctaLabel || 'View Recommendation'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="card p-6 col-span-2">
          <h3 className="text-fg font-semibold text-lg">Next Step</h3>
          <p className="text-muted text-sm mb-4">Continue your journey</p>
          <button
            onClick={() => navigate(data.nextStep?.href || '/resume/upload')}
            className="w-full flex items-center justify-between p-4 rounded-lg border border-accent-500/40 bg-accent-500/5 hover:bg-accent-500/10 transition-colors mb-4"
          >
            <div className="flex items-center gap-3 text-left">
              <FileEdit size={20} className="text-accent-500" />
              <div>
                <p className="text-fg font-medium">{data.nextStep?.title}</p>
                <p className="text-muted text-xs">{data.nextStep?.description}</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-accent-500" />
          </button>
          <button
            onClick={() => navigate(data.nextStep?.href || '/resume/upload')}
            className="btn-accent px-5 py-2.5 text-sm"
          >
            Continue Now
          </button>
        </div>

        <div className="card p-6">
          <h3 className="text-fg font-semibold text-lg">Recent Activity</h3>
          <p className="text-muted text-sm mb-4">Your latest actions</p>
          <div className="flex flex-col gap-4">
            {data.recentActivity?.length ? (
              data.recentActivity.map((a, i) => (
                <div key={i} className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-success mt-0.5 shrink-0" />
                    <p className="text-sm text-fg">{a.message}</p>
                  </div>
                  <span className="text-xs text-muted whitespace-nowrap">{a.timeAgo}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted">No activity yet.</p>
            )}
          </div>
          <button className="text-accent-500 text-sm flex items-center gap-1 mt-4">
            View All Activity <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
