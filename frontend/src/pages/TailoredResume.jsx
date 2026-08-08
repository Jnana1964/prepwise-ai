import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Target, CheckCircle2, XCircle, Loader2, FileDown, FileText, Sparkles } from 'lucide-react';
import { resumeApi } from '../api/client.js';
import RadialProgress from '../components/RadialProgress.jsx';
import { TEMPLATES, renderResumeHtml } from '../utils/resumeTemplates.js';
import { openPrintView, downloadAsDoc } from '../utils/exportDocument.js';

// Frontend for the previously-orphaned POST /resume/:id/tailor endpoint -
// the backend logic already existed (real deterministic JD-vs-resume skill
// matching via atsEngine.js's detectSkills, same engine as everywhere
// else, no separate/fake matching logic), it just had no page.
export default function TailoredResume() {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [genStatus, setGenStatus] = useState('idle'); // idle | loading | ready | error
  const [genError, setGenError] = useState('');
  const [tailoredContent, setTailoredContent] = useState(null);

  const submit = async () => {
    if (!jobDescription.trim()) return;
    setStatus('loading');
    setError('');
    try {
      const { data } = await resumeApi.tailor(resumeId, jobDescription.trim());
      setResult(data);
      setStatus('ready');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not tailor this resume against the job description.');
      setStatus('error');
    }
  };

  const pickTemplate = async (templateId) => {
    setSelectedTemplate(templateId);
    setGenStatus('loading');
    setGenError('');
    try {
      const { data } = await resumeApi.generateTailored(resumeId, jobDescription.trim());
      setTailoredContent(data.content);
      setGenStatus('ready');
    } catch (err) {
      setGenError(err.response?.data?.message || 'Could not generate a tailored resume right now.');
      setGenStatus('error');
    }
  };

  const previewHtml = tailoredContent && selectedTemplate ? renderResumeHtml(tailoredContent, selectedTemplate) : '';
  const fileBaseName = tailoredContent?.fullName ? `${tailoredContent.fullName.replace(/\s+/g, '_')}_Resume` : 'Tailored_Resume';

  const downloadPdf = () => {
    if (!previewHtml) return;
    openPrintView(fileBaseName, previewHtml);
  };

  const downloadDoc = () => {
    if (!previewHtml) return;
    downloadAsDoc(fileBaseName, fileBaseName, previewHtml);
  };

  return (
    <div className="flex flex-col gap-5">
      <button onClick={() => navigate(`/resume/${resumeId}/analysis`)} className="text-muted text-sm flex items-center gap-1.5 w-fit hover:text-fg">
        <ArrowLeft size={14} /> Back to Analysis
      </button>

      <div>
        <h2 className="text-fg text-lg font-semibold flex items-center gap-2">
          <Target size={18} className="text-accent-500" /> Tailor for a Job
        </h2>
        <p className="text-muted text-sm mt-1">Paste a job description to see how well this resume matches it, and what's missing.</p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 card p-6 flex flex-col gap-3">
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here..."
            rows={12}
            className="input w-full resize-y text-sm"
          />
          {error && <p className="text-danger text-sm">{error}</p>}
          <button
            onClick={submit}
            disabled={status === 'loading' || !jobDescription.trim()}
            className="btn-accent px-5 py-2.5 text-sm self-start flex items-center gap-2"
          >
            {status === 'loading' && <Loader2 size={15} className="animate-spin" />}
            {status === 'loading' ? 'Matching...' : 'Match Against This JD'}
          </button>
        </div>

        <div className="card p-6 flex flex-col items-center gap-3 h-fit">
          <p className="text-fg font-semibold self-start">JD Match Score</p>
          {result?.jdMatch != null ? (
            <>
              <RadialProgress value={result.jdMatch} size={100} stroke={8} />
              <p className="text-xl font-bold text-fg -mt-14">
                {result.jdMatch}
                <span className="text-sm text-muted">/100</span>
              </p>
              <p className="text-muted text-xs mt-10 text-center">
                {result.jdMatch >= 70 ? 'Strong match for this role' : result.jdMatch >= 40 ? 'Partial match - address the gaps below' : 'Low match - this role needs different skills'}
              </p>
            </>
          ) : (
            <p className="text-muted text-sm text-center py-6">Paste a job description and match to see your score here.</p>
          )}
        </div>
      </div>

      {result && (
        <div className="grid grid-cols-2 gap-5">
          <div className="card p-6">
            <h3 className="text-fg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-success" /> Matched Skills ({result.matchedSkills?.length || 0})
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.matchedSkills?.length ? (
                result.matchedSkills.map((s) => (
                  <span key={s} className="pill-success">
                    {s}
                  </span>
                ))
              ) : (
                <p className="text-muted text-sm">No overlapping skills detected between your resume and this JD.</p>
              )}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-fg font-semibold mb-4 flex items-center gap-2">
              <XCircle size={16} className="text-danger" /> Missing Skills ({result.missingSkills?.length || 0})
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {result.missingSkills?.length ? (
                result.missingSkills.map((s) => (
                  <span key={s} className="pill-danger">
                    {s}
                  </span>
                ))
              ) : (
                <p className="text-muted text-sm">No gaps found - great match.</p>
              )}
            </div>
            {result.missingKeywords?.length > 0 && (
              <>
                <h4 className="text-muted text-xs mb-2">Other Missing Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {result.missingKeywords.map((s) => (
                    <span key={s} className="pill-muted">
                      {s}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {result && (
        <div className="card p-5 flex items-center justify-between">
          <p className="text-muted text-sm">This updates your saved Resume Analysis Profile, so Opportunity Matcher and Skill Builder reflect this JD's gaps too.</p>
          <button onClick={() => navigate(`/resume/${resumeId}/improve`)} className="btn-outline px-4 py-2 text-sm">
            Improve Resume
          </button>
        </div>
      )}

      {result && (
        <div className="card p-6 flex flex-col gap-4">
          <div>
            <h3 className="text-fg font-semibold flex items-center gap-2">
              <Sparkles size={16} className="text-accent-500" /> Generate a Tailored Resume
            </h3>
            <p className="text-muted text-sm mt-1">
              Pick a template - AI rewrites your resume's wording and emphasis for this JD (never invents employers, dates, or achievements), rendered into the layout you choose.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => pickTemplate(t.id)}
                className={`text-left rounded-input border p-3 flex flex-col gap-1 transition-colors ${
                  selectedTemplate === t.id ? 'border-accent-500 bg-accent-500/5' : 'border-border hover:border-muted'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-fg text-xs font-semibold">{t.name}</span>
                  {t.atsFriendly && <span className="pill-success text-[9px]">ATS-Friendly</span>}
                </div>
                <p className="text-muted text-[11px] leading-snug">{t.description}</p>
              </button>
            ))}
          </div>

          {genStatus === 'loading' && (
            <div className="flex items-center gap-2 text-muted text-sm">
              <Loader2 size={15} className="animate-spin" /> Generating your tailored resume...
            </div>
          )}
          {genStatus === 'error' && <p className="text-danger text-sm">{genError}</p>}

          {genStatus === 'ready' && previewHtml && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <button onClick={downloadPdf} className="btn-accent px-4 py-2 text-sm flex items-center gap-2">
                  <FileDown size={14} /> Download PDF
                </button>
                <button onClick={downloadDoc} className="btn-outline px-4 py-2 text-sm flex items-center gap-2">
                  <FileText size={14} /> Download DOCX
                </button>
                <p className="text-muted text-xs ml-2">
                  Use the real Apply link on Opportunity Matcher or the company's careers page to submit this - we can't auto-submit to third-party company systems.
                </p>
              </div>
              <div className="rounded-input overflow-hidden border border-border bg-white max-h-[900px] overflow-y-auto">
                <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
