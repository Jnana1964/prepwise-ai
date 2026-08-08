import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText } from 'lucide-react';
import { resumeApi } from '../api/client.js';
import { Loader } from '../components/Loader.jsx';

const GUIDELINES = [
  'Use latest resume',
  'PDF format only',
  'Max 5MB size',
  'English language',
  'Clear and readable'
];

export default function ResumeUpload() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [recent, setRecent] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [jobDescription, setJobDescription] = useState('');

  const loadRecent = async () => {
    setLoadingRecent(true);
    try {
      const { data } = await resumeApi.list();
      setRecent(data.resumes || []);
    } catch {
      setRecent([]);
    } finally {
      setLoadingRecent(false);
    }
  };

  useEffect(() => {
    loadRecent();
  }, []);

  const handleFile = async (file) => {
    if (!file) return;
    setError('');
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are supported.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File exceeds 5MB limit.');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      if (jobDescription.trim()) formData.append('jobDescription', jobDescription.trim());
      const { data } = await resumeApi.upload(formData);
      navigate(`/resume/${data.resumeId}/analysis`);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 card p-8">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl py-20 cursor-pointer transition-colors ${
            dragOver ? 'border-accent-500 bg-accent-500/5' : 'border-border hover:border-accent-500/50'
          }`}
        >
          <UploadCloud size={40} className="text-accent-500" />
          <p className="text-fg font-medium">
            {uploading ? 'Uploading...' : 'Drag & drop your resume here'}
          </p>
          <p className="text-muted text-sm">or</p>
          <button
            type="button"
            disabled={uploading}
            className="btn-outline px-5 py-2 text-sm"
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
          >
            Select from device
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
        {error && <p className="text-danger text-sm mt-4">{error}</p>}

        <div className="mt-6">
          <h3 className="text-fg font-semibold mb-1">Job Description (optional)</h3>
          <p className="text-muted text-xs mb-3">
            Paste a job description to also get a JD match score with this upload - or skip this and use "Tailor for a Job" from the analysis page later.
          </p>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here..."
            rows={5}
            className="input w-full resize-none"
          />
        </div>

        <div className="mt-8">
          <h3 className="text-fg font-semibold mb-3">Recent Uploads</h3>
          {loadingRecent ? (
            <Loader text="Loading uploads..." />
          ) : recent.length === 0 ? (
            <p className="text-muted text-sm">No resumes uploaded yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {recent.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <FileText size={18} className="text-accent-500" />
                    <div>
                      <p className="text-sm text-fg">{r.filename}</p>
                      <p className="text-xs text-muted">Uploaded on {r.uploadedAt}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/resume/${r.id}/analysis`)}
                    className="text-accent-500 text-sm font-medium"
                  >
                    View Analysis
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card p-6 h-fit">
        <h3 className="text-fg font-semibold mb-4">Upload Guidelines</h3>
        <ul className="flex flex-col gap-3">
          {GUIDELINES.map((g) => (
            <li key={g} className="flex items-center gap-2 text-sm text-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-500" />
              {g}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
