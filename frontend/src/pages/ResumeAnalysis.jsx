import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Download, RefreshCw, Target } from 'lucide-react';
import { resumeApi } from '../api/client.js';
import RadialProgress from '../components/RadialProgress.jsx';
import { Loader, ErrorState } from '../components/Loader.jsx';
import { openPrintView } from '../utils/exportDocument.js';

export default function ResumeAnalysis() {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');

  const load = async () => {
    setStatus('loading');
    try {
      const { data } = await resumeApi.getAnalysis(resumeId);
      setData(data);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId]);

  if (status === 'loading') return <Loader text="Analyzing your resume..." />;
  if (status === 'error') return <ErrorState message="Couldn't load this analysis." onRetry={load} />;

  const downloadReport = () => {
    const body = `
      <h1>Resume Intelligence Report</h1>
      <p class="muted">Generated ${new Date().toLocaleString()}</p>
      <div class="score-row">
        <div class="score-box"><div class="num">${data.resumeScore}/100</div>Resume Score</div>
        <div class="score-box"><div class="num">${data.atsScore}/100</div>ATS Score</div>
        <div class="score-box"><div class="num">${data.recruiterScore}/100</div>Recruiter Score</div>
      </div>
      <h2>Section Analysis</h2>
      <ul>${(data.sections || []).map((s) => `<li>${s.name}: ${s.status === 'ok' ? 'Present' : 'Missing'}</li>`).join('')}</ul>
      <h2>Top Skills Detected (${data.skills?.length || 0})</h2>
      <p>${(data.skills || []).join(', ') || 'None detected'}</p>
      <h2>Missing Keywords</h2>
      <p>${(data.missingKeywords || []).join(', ') || 'None'}</p>
      ${data.aiReview ? `<h2>Review</h2><p>${data.aiReview}</p>` : ''}
    `;
    openPrintView('Resume Intelligence Report', body);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-end gap-3">
        <button onClick={downloadReport} className="btn-outline px-4 py-2 text-sm flex items-center gap-2">
          <Download size={15} /> Download Report
        </button>
        <button onClick={load} className="btn-outline px-4 py-2 text-sm flex items-center gap-2">
          <RefreshCw size={15} /> Re-analyze
        </button>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="card p-6 flex flex-col items-center justify-center gap-2">
          <RadialProgress value={data.resumeScore} size={110} stroke={9} />
          <p className="text-2xl font-bold text-fg -mt-16">
            {data.resumeScore}
            <span className="text-sm text-muted">/100</span>
          </p>
          <p className="text-sm text-muted mt-14">{data.resumeScore >= 70 ? 'Strong Profile' : 'Needs Work'}</p>
        </div>

        <div className="col-span-2 grid grid-cols-2 gap-4">
          <div className="card p-5">
            <p className="text-muted text-xs">ATS Score</p>
            <p className="text-xl font-bold text-fg mt-1">{data.atsScore}/100</p>
          </div>
          <div className="card p-5">
            <p className="text-muted text-xs">Recruiter Score</p>
            <p className="text-xl font-bold text-fg mt-1">{data.recruiterScore}/100</p>
          </div>
          <div className="card p-5">
            <p className="text-muted text-xs">Sections Found</p>
            <p className="text-xl font-bold text-fg mt-1">
              {data.sectionsFound}/{data.totalSections}
            </p>
          </div>
          <div className="card p-5">
            <p className="text-muted text-xs">Key Skills Found</p>
            <p className="text-xl font-bold text-fg mt-1">{data.skillsCount ?? data.skills?.length ?? 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="card p-6">
          <h3 className="text-fg font-semibold mb-4">Section Analysis</h3>
          <div className="flex flex-col gap-3">
            {data.sections?.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-sm">
                <span className="text-fg">{s.name}</span>
                {s.status === 'ok' ? (
                  <CheckCircle2 size={16} className="text-success" />
                ) : (
                  <XCircle size={16} className="text-danger" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-fg font-semibold mb-4">Top Skills Detected</h3>
          <div className="flex flex-wrap gap-2">
            {data.skills?.length ? (
              data.skills.map((s) => (
                <span key={s} className="pill-accent">
                  {s}
                </span>
              ))
            ) : (
              <p className="text-muted text-sm">No recognized skills detected yet - try Edit Resume Directly to add some.</p>
            )}
          </div>
          {data.missingKeywords?.length > 0 && (
            <>
              <h4 className="text-muted text-xs mt-5 mb-2">Missing Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {data.missingKeywords.map((s) => (
                  <span key={s} className="pill-muted">
                    {s}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {data.aiReview && (
        <div className="card p-6">
          <h3 className="text-fg font-semibold mb-2">AI Recruiter Review</h3>
          <p className="text-sm text-muted leading-relaxed">{data.aiReview}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={() => navigate(`/resume/${resumeId}/improve`)} className="btn-accent px-5 py-3 text-sm">
          Improve This Resume
        </button>
        <button onClick={() => navigate(`/resume/${resumeId}/edit`)} className="btn-outline px-5 py-3 text-sm">
          Edit Resume Directly
        </button>
        <button onClick={() => navigate(`/resume/${resumeId}/tailor`)} className="btn-outline px-5 py-3 text-sm flex items-center gap-2">
          <Target size={15} /> Tailor for a Job
        </button>
      </div>
    </div>
  );
}
