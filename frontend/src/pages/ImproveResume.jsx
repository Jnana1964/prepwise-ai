import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, X, Undo2, Loader2, Download } from 'lucide-react';
import { resumeApi } from '../api/client.js';
import { Loader, ErrorState } from '../components/Loader.jsx';
import { openPrintView, downloadAsDoc } from '../utils/exportDocument.js';

const TABS = [
  { key: 'keywords', label: 'Missing Keywords' },
  { key: 'sections', label: 'Improve Sections' },
  { key: 'certifications', label: 'Certifications' },
  { key: 'formatting', label: 'Formatting' }
];

function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export default function ImproveResume() {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('keywords');
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [applied, setApplied] = useState({});
  const [dismissed, setDismissed] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const load = async () => {
    setStatus('loading');
    try {
      const { data } = await resumeApi.improve(resumeId);
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

  if (status === 'loading') return <Loader text="Generating improvement suggestions..." />;
  if (status === 'error') return <ErrorState message="Couldn't load suggestions." onRetry={load} />;

  const toggle = (id) => setApplied((prev) => ({ ...prev, [id]: !prev[id] }));
  const dismiss = (id) =>
    setDismissed((prev) => {
      setApplied((a) => ({ ...a, [id]: false }));
      return { ...prev, [id]: true };
    });
  const undoAll = () => {
    setApplied({});
    setDismissed({});
    setSaveResult(null);
  };

  // The API returns suggestionsByTab (grouped), not a flat `suggestions`
  // array - this used to reference a field that never existed, which is
  // why "Potential" score never moved no matter what was accepted.
  const allSuggestions = Object.values(data.suggestionsByTab || {}).flat();
  const appliedCount = Object.values(applied).filter(Boolean).length;
  const potentialGain = allSuggestions.reduce((sum, s) => sum + (applied[s.id] ? s.scoreImpact : 0), 0);
  const acceptedIds = Object.keys(applied).filter((id) => applied[id]);

  const saveChanges = async () => {
    if (acceptedIds.length === 0) return;
    setSaving(true);
    setSaveResult(null);
    try {
      const { data: result } = await resumeApi.applySuggestions(resumeId, acceptedIds);
      setSaveResult(result);
    } catch (err) {
      setSaveResult({ error: err.response?.data?.message || 'Could not save changes.' });
    } finally {
      setSaving(false);
    }
  };

  const buildDownloadBody = async () => {
    const { data: content } = await resumeApi.getContent(resumeId);
    return `<h1>Resume</h1><p class="muted">Exported ${new Date().toLocaleString()}</p><pre style="white-space:pre-wrap;font-family:Arial,Helvetica,sans-serif;font-size:13px;">${escapeHtml(content.content)}</pre>`;
  };

  const downloadPdf = async () => {
    setDownloading(true);
    try {
      const body = await buildDownloadBody();
      openPrintView('Resume', body);
    } finally {
      setDownloading(false);
    }
  };

  const downloadDocx = async () => {
    setDownloading(true);
    try {
      const body = await buildDownloadBody();
      downloadAsDoc('resume', 'Resume', body);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <button onClick={() => navigate(`/resume/${resumeId}/analysis`)} className="text-muted text-sm flex items-center gap-1 w-fit">
        <ArrowLeft size={14} /> Back to Analysis
      </button>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 card p-6">
          <div className="flex gap-2 mb-6 flex-wrap">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={t.key === tab ? 'pw-tab-active' : ''}
                style={
                  t.key === tab
                    ? { background: 'rgba(255,106,26,0.1)', color: '#ff6a1a', border: '1px solid rgba(255,106,26,0.4)', borderRadius: 14, padding: '7px 14px', fontSize: 12, fontWeight: 500 }
                    : { color: '#9ca3af', border: '1px solid #242424', borderRadius: 14, padding: '7px 14px', fontSize: 12, fontWeight: 500 }
                }
              >
                {t.label}
              </button>
            ))}
          </div>

          <h3 className="text-fg font-semibold mb-1">
            {tab === 'keywords' && 'Add these keywords to boost your ATS score'}
            {tab === 'sections' && 'Rewrite suggestions for weaker sections'}
            {tab === 'certifications' && 'Certifications that strengthen your profile'}
            {tab === 'formatting' && 'Formatting fixes'}
          </h3>
          <p className="text-muted text-sm mb-6">
            {tab === 'formatting'
              ? 'These need a manual rewrite - open Edit Resume Directly to apply them.'
              : 'Accept the ones you want, then Save Changes to apply them to your resume and re-score it for real.'}
          </p>

          <div className="flex flex-col gap-3">
            {(data.suggestionsByTab?.[tab] || [])
              .filter((s) => !dismissed[s.id])
              .map((s) => (
                <div key={s.id} className="flex items-center justify-between border border-border rounded-input p-4">
                  <div>
                    <p className="text-fg text-sm">{s.text}</p>
                    {s.scoreImpact ? <p className="text-xs text-success mt-1">+{s.scoreImpact} points (estimated)</p> : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggle(s.id)}
                      className={applied[s.id] ? 'btn-accent w-8 h-8 flex items-center justify-center' : 'btn-outline w-8 h-8 flex items-center justify-center'}
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => dismiss(s.id)}
                      className="w-8 h-8 rounded-btn border border-border text-muted flex items-center justify-center hover:text-danger hover:border-danger/40"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            {(!data.suggestionsByTab?.[tab] || data.suggestionsByTab[tab].filter((s) => !dismissed[s.id]).length === 0) && (
              <p className="text-sm text-muted">No suggestions in this category.</p>
            )}
          </div>
        </div>

        <div className="card p-6 flex flex-col gap-4 h-fit">
          <h3 className="text-fg font-semibold">Score Improvement</h3>

          {saveResult && !saveResult.error ? (
            <div className="flex flex-col gap-1">
              <p className="text-xs text-muted">Actual score after saving</p>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-muted">ATS</p>
                  <p className="text-xl font-bold text-success">{saveResult.atsScore}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Resume</p>
                  <p className="text-xl font-bold text-success">{saveResult.resumeScore}</p>
                </div>
              </div>
              {saveResult.skippedFormatting > 0 && (
                <p className="text-xs text-muted mt-2">{saveResult.skippedFormatting} formatting suggestion(s) need a manual edit - use Edit Resume Directly.</p>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-xs text-muted">Current</p>
                  <p className="text-2xl font-bold text-fg">{data.currentScore}</p>
                </div>
                <ArrowRight size={18} className="text-accent-500" />
                <div>
                  <p className="text-xs text-muted">Potential</p>
                  <p className="text-2xl font-bold text-success">{Math.min(100, data.currentScore + potentialGain)}</p>
                </div>
              </div>
              <span className="pill-success w-fit">+{potentialGain} points from {appliedCount} accepted</span>
            </>
          )}

          {saveResult?.error && <p className="text-danger text-sm">{saveResult.error}</p>}

          <div className="flex gap-2 mt-2">
            <button onClick={undoAll} className="btn-outline px-3 py-2 text-xs flex items-center gap-1 flex-1 justify-center">
              <Undo2 size={13} /> Undo All
            </button>
            <button
              onClick={saveChanges}
              disabled={saving || acceptedIds.length === 0}
              className="btn-accent px-3 py-2 text-xs flex-1 flex items-center justify-center gap-1.5"
            >
              {saving && <Loader2 size={13} className="animate-spin" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <div className="pt-4 border-t border-border flex flex-col gap-2">
            <button onClick={downloadPdf} disabled={downloading} className="btn-outline px-4 py-2 text-sm flex items-center justify-center gap-2">
              <Download size={14} /> Download as PDF
            </button>
            <button onClick={downloadDocx} disabled={downloading} className="btn-outline px-4 py-2 text-sm flex items-center justify-center gap-2">
              <Download size={14} /> Download as DOCX
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
