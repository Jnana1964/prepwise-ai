import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListChecks, Code2, Brain, Calculator, Users, Building2, ArrowRight } from 'lucide-react';
import { skillsApi } from '../api/client.js';
import { Loader, ErrorState } from '../components/Loader.jsx';

const CATEGORY_META = {
  mcq: { label: 'MCQ Practice', icon: ListChecks, blurb: '8 tough CS-fundamentals questions, graded instantly.' },
  coding: { label: 'Coding Practice', icon: Code2, blurb: '3 hard problems - real test cases, run right in your browser.' },
  ai_tutor: { label: 'AI Tutor', icon: Brain, blurb: "Ask a real AI (Gemini) about anything you're stuck on - voice input and read-aloud answers supported." },
  aptitude: { label: 'Aptitude Practice', icon: Calculator, blurb: '8 quant/logical reasoning questions, graded instantly.' },
  hr: { label: 'HR Questions', icon: Users, blurb: 'Behavioral prompts with optional AI feedback on your answers.' },
  company: { label: 'Company Questions', icon: Building2, blurb: 'Real company-pattern prompts, with optional AI feedback.' }
};

const ORDER = ['mcq', 'coding', 'aptitude', 'hr', 'company'];

export default function SkillBuilder() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [status, setStatus] = useState('loading');

  const load = async () => {
    setStatus('loading');
    try {
      const { data } = await skillsApi.overview();
      setOverview(data);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (status === 'loading') return <Loader text="Loading skill categories..." />;
  if (status === 'error') return <ErrorState message="Couldn't load skill builder." onRetry={load} />;

  const byKey = Object.fromEntries((overview?.categories || []).map((c) => [c.key, c]));
  const rest = ORDER.map((key) => byKey[key] || { key, progress: 0, scorePct: null });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-fg text-lg font-semibold">Skill Builder</h2>
        <p className="text-muted text-sm mt-1">Pick a category to open it as its own practice session.</p>
      </div>

      <button
        onClick={() => navigate('/skills/ai_tutor')}
        className="card p-5 flex items-center gap-4 text-left hover:border-accent-500/50 transition-colors cursor-pointer"
      >
        <div className="w-11 h-11 rounded-full bg-accent-500/10 flex items-center justify-center shrink-0">
          <Brain size={22} className="text-accent-500" />
        </div>
        <div className="flex-1">
          <p className="text-fg font-medium">{CATEGORY_META.ai_tutor.label}</p>
          <p className="text-muted text-xs mt-0.5">{CATEGORY_META.ai_tutor.blurb}</p>
        </div>
        <span className="btn-outline px-4 py-2 text-sm flex items-center gap-1.5 shrink-0">
          Ask AI <ArrowRight size={14} />
        </span>
      </button>

      <div className="flex flex-col gap-3">
        {rest.map((cat) => {
          const meta = CATEGORY_META[cat.key] || { label: cat.key, icon: ListChecks, blurb: '' };
          const Icon = meta.icon;
          return (
            <button
              key={cat.key}
              onClick={() => navigate(`/skills/${cat.key}`)}
              className="card p-5 flex items-center gap-4 text-left hover:border-accent-500/50 transition-colors cursor-pointer"
            >
              <div className="w-11 h-11 rounded-full bg-surface2 flex items-center justify-center shrink-0">
                <Icon size={22} className="text-accent-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-fg font-medium">{meta.label}</p>
                  {typeof cat.scorePct === 'number' && (
                    <span className={cat.scorePct >= 70 ? 'pill-success' : 'pill-danger'}>Score: {cat.scorePct}%</span>
                  )}
                </div>
                <p className="text-muted text-xs mt-0.5">{meta.blurb}</p>
                {typeof cat.progress === 'number' && (
                  <div className="w-full h-1.5 bg-surface2 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-accent-500" style={{ width: `${cat.progress}%` }} />
                  </div>
                )}
              </div>
              <span className="btn-outline px-4 py-2 text-sm flex items-center gap-1.5 shrink-0">
                Start Practice <ArrowRight size={14} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}