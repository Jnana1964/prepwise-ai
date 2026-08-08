import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { resumeApi } from '../api/client.js';
import { Loader, ErrorState } from '../components/Loader.jsx';

// Direct in-app editing - no re-upload needed. Saving re-runs the exact
// same deterministic ATS engine the upload flow uses (see
// resume.controller.js `updateContent`), so the score you see here is
// never stale or fabricated - it's recomputed from what's actually on
// the page, the same way Google Docs autosaves without you re-importing
// the file.
export default function EditResume() {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('loading');
  const [saving, setSaving] = useState(false);
  const [savedScore, setSavedScore] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [saveError, setSaveError] = useState('');

  const load = async () => {
    setStatus('loading');
    try {
      const { data } = await resumeApi.getContent(resumeId);
      setContent(data.content);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId]);

  const save = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const { data } = await resumeApi.updateContent(resumeId, content);
      setSavedScore(data);
      setDirty(false);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Could not save your changes. Try again.');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading') return <Loader text="Loading your resume..." />;
  if (status === 'error') return <ErrorState message="Couldn't load this resume." onRetry={load} />;

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="flex flex-col gap-5">
      <button onClick={() => navigate(`/resume/${resumeId}/analysis`)} className="text-muted text-sm flex items-center gap-1 w-fit">
        <ArrowLeft size={14} /> Back to Analysis
      </button>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-3 border-b border-border">
            <span className="text-sm text-muted">{wordCount} words</span>
            <button onClick={save} disabled={saving || !dirty} className="btn-accent px-4 py-2 text-xs flex items-center gap-2 disabled:opacity-40">
              <Save size={13} /> {saving ? 'Saving...' : 'Save & Re-analyze'}
            </button>
          </div>
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setDirty(true);
            }}
            className="w-full bg-transparent text-fg text-sm p-6 outline-none resize-none leading-relaxed"
            style={{ minHeight: 560, fontFamily: 'ui-monospace, monospace' }}
            spellCheck
          />
        </div>

        <div className="card p-6 h-fit flex flex-col gap-4">
          <h3 className="text-fg font-semibold">Live Score</h3>
          {savedScore ? (
            <>
              <div>
                <p className="text-xs text-muted">ATS Score</p>
                <p className="text-2xl font-bold text-fg">{savedScore.atsScore}/100</p>
              </div>
              <div>
                <p className="text-xs text-muted">Resume Score</p>
                <p className="text-2xl font-bold text-fg">{savedScore.resumeScore}/100</p>
              </div>
              <p className="text-xs text-success">Saved and re-analyzed</p>
            </>
          ) : (
            <p className="text-sm text-muted">Save your edits to see the updated score.</p>
          )}
          {dirty && !saving && !saveError && <p className="text-xs text-accent-500">Unsaved changes</p>}
          {saveError && <p className="text-xs text-danger">{saveError}</p>}
        </div>
      </div>
    </div>
  );
}
