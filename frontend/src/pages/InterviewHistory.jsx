import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { interviewApi } from '../api/client.js';
import { Loader, ErrorState } from '../components/Loader.jsx';

export default function InterviewHistory() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [status, setStatus] = useState('loading');
  const [expandedId, setExpandedId] = useState(null);

  const load = async () => {
    setStatus('loading');
    try {
      const { data } = await interviewApi.history();
      setSessions(data.sessions || []);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => { load(); }, []);

  if (status === 'loading') return <Loader text="Loading your interview history..." />;
  if (status === 'error') return <ErrorState message="Couldn't load history." onRetry={load} />;

  return (
    <div className="flex flex-col gap-6">
      <button onClick={() => navigate('/track-record')} className="text-muted text-sm flex items-center gap-1.5 hover:text-fg w-fit">
        <ArrowLeft size={15} /> Track Record
      </button>

      <div>
        <h2 className="text-fg text-lg font-semibold">AI Mock Interview History</h2>
        <p className="text-muted text-sm mt-1">Every finished session, question by question.</p>
      </div>

      {sessions.length === 0 ? (
        <div className="card p-6">
          <p className="text-muted text-sm">No finished interview sessions yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((session) => {
            const isOpen = expandedId === session.id;
            return (
              <div key={session.id} className="card overflow-hidden">
                <button onClick={() => setExpandedId(isOpen ? null : session.id)} className="w-full p-5 flex items-center gap-4 text-left">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-fg font-medium">{session.companyName}</p>
                      {typeof session.overallScore === 'number' && (
                        <span className={session.overallScore >= 70 ? 'pill-success' : 'pill-danger'}>
                          Overall: {Math.round(session.overallScore)}%
                        </span>
                      )}
                    </div>
                    <p className="text-muted text-xs mt-1 flex items-center gap-1.5">
                      <Calendar size={12} />
                      {new Date(session.createdAt).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {isOpen ? <ChevronUp size={18} className="text-muted shrink-0" /> : <ChevronDown size={18} className="text-muted shrink-0" />}
                </button>

                {isOpen && (
                  <div className="border-t border-border p-5 flex flex-col gap-4">
                    <div className="flex flex-wrap gap-2">
                      {typeof session.communicationScore === 'number' && <span className="pill-muted">Communication: {session.communicationScore}%</span>}
                      {typeof session.technicalScore === 'number' && <span className="pill-muted">Technical: {session.technicalScore}%</span>}
                      {typeof session.confidenceScore === 'number' && <span className="pill-muted">Confidence: {session.confidenceScore}%</span>}
                      {typeof session.behavioralScore === 'number' && <span className="pill-muted">Behavioral: {session.behavioralScore}%</span>}
                    </div>
                    <div className="flex flex-col gap-3">
                      {(session.questions || []).filter((q) => q.answer).map((q, i) => (
                        <div key={q.id} className="border border-border rounded-input p-4 flex flex-col gap-2">
                          <p className="text-fg text-sm">
                            <span className="text-muted text-xs">[{q.type}]</span> {i + 1}. {q.prompt}
                          </p>
                          <p className="text-xs text-muted whitespace-pre-wrap">{q.answer}</p>
                          <div className="flex gap-2 flex-wrap">
                            {typeof q.communication === 'number' && <span className="pill-muted text-[11px]">Communication: {q.communication}%</span>}
                            {typeof q.technical === 'number' && <span className="pill-muted text-[11px]">Technical: {q.technical}%</span>}
                            {typeof q.confidence === 'number' && <span className="pill-muted text-[11px]">Confidence: {q.confidence}%</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}