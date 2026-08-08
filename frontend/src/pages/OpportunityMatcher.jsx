import { useEffect, useState } from 'react';
import { Search, Filter, Building2, ExternalLink } from 'lucide-react';
import { jobsApi, applicationsApi } from '../api/client.js';
import { Loader, ErrorState, EmptyState } from '../components/Loader.jsx';

export default function OpportunityMatcher() {
  const [jobs, setJobs] = useState([]);
  const [status, setStatus] = useState('loading');
  const [query, setQuery] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());

  const load = async () => {
    setStatus('loading');
    try {
      const { data } = await jobsApi.matches();
      setJobs(data.jobs || []);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = jobs.filter((j) =>
    `${j.title} ${j.company}`.toLowerCase().includes(query.toLowerCase())
  );

  const saveToApplications = async (job) => {
    if (savedIds.has(job.id)) return;
    setSavingId(job.id);
    try {
      await applicationsApi.create({
        jobId: job.id,
        company: job.company,
        role: job.title,
        matchPercent: job.matchPercent,
        status: 'saved'
      });
      setSavedIds((prev) => new Set(prev).add(job.id));
    } finally {
      setSavingId(null);
    }
  };

  if (status === 'loading') return <Loader text="Matching jobs to your profile..." />;
  if (status === 'error') return <ErrorState message="Couldn't load job matches." onRetry={load} />;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-3">
        <div className="flex-1 flex items-center gap-2 bg-surface border border-border rounded-input px-4 py-2.5">
          <Search size={16} className="text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by role, company or keyword"
            className="bg-transparent outline-none text-sm text-fg placeholder-muted flex-1"
          />
        </div>
        <button className="btn-outline px-4 py-2.5 text-sm flex items-center gap-2">
          <Filter size={15} /> Filters
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No matching opportunities yet. Complete Resume Intelligence to unlock matches." />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((job) => (
            <div key={job.id} className="card p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-input bg-surface2 flex items-center justify-center shrink-0">
                    <Building2 size={18} className="text-accent-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-fg font-medium truncate">{job.title}</p>
                    <p className="text-muted text-xs truncate">
                      {job.company} · {job.location} · {job.tags?.join(', ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className={job.matchPercent >= 85 ? 'text-success font-bold text-sm' : 'text-accent-500 font-bold text-sm'}>
                    {job.matchPercent}% Match
                  </span>
                  <button
                    onClick={() => saveToApplications(job)}
                    disabled={savingId === job.id || savedIds.has(job.id)}
                    className="btn-outline px-4 py-2 text-xs disabled:opacity-60"
                  >
                    {savedIds.has(job.id) ? 'Saved' : savingId === job.id ? 'Saving...' : 'Save'}
                  </button>
                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-accent px-4 py-2 text-xs flex items-center gap-1.5"
                  >
                    Apply <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {(job.matchedSkills?.length > 0 || job.missingSkills?.length > 0) && (
                <div className="flex flex-wrap items-center gap-1.5 pl-[52px]">
                  {job.matchedSkills?.map((s) => (
                    <span key={`m-${s}`} className="pill-success text-[11px]">
                      {s}
                    </span>
                  ))}
                  {job.missingSkills?.map((s) => (
                    <span key={`x-${s}`} className="pill-danger text-[11px]">
                      {s} missing
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
