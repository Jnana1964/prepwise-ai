import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsApi } from '../api/client.js';
import { Loader, ErrorState } from '../components/Loader.jsx';

const TABS = ['Overview', 'Interview Scores', 'Skills Progress', 'Aptitude Progress'];

function Delta({ value }) {
  if (value === undefined || value === null) return null;
  const up = value >= 0;
  return (
    <p className={`text-xs mt-1 ${up ? 'text-success' : 'text-danger'}`}>
      {up ? '↑' : '↓'} {Math.abs(value)} vs last month
    </p>
  );
}

export default function PerformanceAnalytics() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [tab, setTab] = useState('Overview');

  const load = async () => {
    setStatus('loading');
    try {
      const { data } = await analyticsApi.overview();
      setData(data);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (status === 'loading') return <Loader text="Crunching your performance data..." />;
  if (status === 'error') return <ErrorState message="Couldn't load analytics." onRetry={load} />;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-4 gap-4">
        <div className="card p-5">
          <p className="text-muted text-xs">Avg. Interview Score</p>
          <p className="text-xl font-bold text-fg mt-1">
            {data.avgInterviewScore}
            <span className="text-xs text-muted">/10</span>
          </p>
          <Delta value={data.avgInterviewScoreDelta} />
        </div>
        <div className="card p-5">
          <p className="text-muted text-xs">Coding Score</p>
          <p className="text-xl font-bold text-fg mt-1">{data.codingScore}%</p>
          <Delta value={data.codingScoreDelta} />
        </div>
        <div className="card p-5">
          <p className="text-muted text-xs">Aptitude Score</p>
          <p className="text-xl font-bold text-fg mt-1">{data.aptitudeScore}%</p>
          <Delta value={data.aptitudeScoreDelta} />
        </div>
        <div className="card p-5">
          <p className="text-muted text-xs">ATS Improvement</p>
          <p className="text-xl font-bold text-fg mt-1">+{data.atsImprovement}%</p>
          <Delta value={data.atsImprovementDelta} />
        </div>
      </div>

      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={t === tab ? 'pill-accent' : 'pill-muted'}
            style={{ border: '1px solid #242424' }}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 card p-6">
          <h3 className="text-fg font-semibold mb-4">
            {tab === 'Overview' ? 'Overview Score Trend' : `${tab} Trend`}
          </h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={data.trend?.[tab] || data.trend?.Overview || []}>
                <defs>
                  <linearGradient id="accentFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff6a1a" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#ff6a1a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#242424" vertical={false} />
                <XAxis dataKey="label" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: '#131313', border: '1px solid #242424', borderRadius: 12, fontSize: 12 }}
                  labelStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="value" stroke="#ff6a1a" strokeWidth={2} fill="url(#accentFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="card p-5">
            <h4 className="text-fg font-semibold mb-3">Weak Areas</h4>
            <div className="flex flex-col gap-2">
              {data.weakAreas?.length ? (
                data.weakAreas.map((a) => (
                  <div key={a.name} className="flex items-center justify-between text-sm">
                    <span className="text-fg">{a.name}</span>
                    <button onClick={() => navigate('/resume/upload')} className="text-accent-500 text-xs hover:underline">
                      Improve
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-muted text-sm">No weak areas detected yet.</p>
              )}
            </div>
          </div>
          <div className="card p-5">
            <h4 className="text-fg font-semibold mb-3">Strong Areas</h4>
            <div className="flex flex-col gap-2">
              {data.strongAreas?.map((a) => (
                <div key={a.name} className="flex items-center justify-between text-sm">
                  <span className="text-fg">{a.name}</span>
                  <span className="text-success text-xs">Excellent</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
