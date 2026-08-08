import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { assessmentApi } from '../api/client.js';
import { Loader, ErrorState } from '../components/Loader.jsx';

export default function AssessmentHistory() {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [expandedId, setExpandedId] = useState(null);

  const load = async () => {
    setStatus('loading');
    try {
      const { data } = await assessmentApi.history();
      setAttempts(data.attempts || []);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => { load(); }, []);

  if (status === 'loading') return <Loader text="Loading your assessment history..." />;
  if (status === 'error') return <ErrorState message="Couldn't load history." onRetry={load} />;

  return (
    <div className="flex flex-col gap-6">
      <button onClick={() => navigate('/track-record')} className="text-muted text-sm flex items-center gap-1.5 hover:text-fg w-fit">
        <ArrowLeft size={15} /> Track Record
      </button>

      <div>
        <h2 className="text-fg text-lg font-semibold">Mock Assessment History</h2>
        <p className="text-muted text-sm mt-1">Every attempt, with section scores and every question you got wrong.</p>
      </div>

      {attempts.length === 0 ? (
        <div className="card p-6">
          <p className="text-muted text-sm">No assessment attempts recorded yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {attempts.map((attempt) => {
            const isOpen = expandedId === attempt.id;
            const sectionEntries = Object.entries(attempt.sectionScores || {});
            return (
              <div key={attempt.id} className="card overflow-hidden">
                <button onClick={() => setExpandedId(isOpen ? null : attempt.id)} className="w-full p-5 flex items-center gap-4 text-left">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-fg font-medium">{attempt.companyName}</p>
                      <span className={attempt.passed ? 'pill-success' : 'pill-danger'}>
                        {attempt.score}% {attempt.passed ? '· Passed' : `· Below ${attempt.passThreshold}%`}
                      </span>
                    </div>
                    <p className="text-muted text-xs mt-1 flex items-center gap-1.5">
                      <Calendar size={12} />
                      {new Date(attempt.createdAt).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {isOpen ? <ChevronUp size={18} className="text-muted shrink-0" /> : <ChevronDown size={18} className="text-muted shrink-0" />}
                </button>

                {isOpen && (
                  <div className="border-t border-border p-5 flex flex-col gap-4">
                    <div className="flex flex-wrap gap-2">
                      {sectionEntries.map(([key, pct]) => (
                        <span key={key} className={pct >= attempt.passThreshold ? 'pill-success' : 'pill-danger'}>
                          {key}: {pct}%
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-col gap-3">
                      {(attempt.questionResults || []).map((q, i) => (
                        <div key={q.questionId || i} className={`border rounded-input p-4 flex flex-col gap-2 ${q.correct ? 'border-success/40' : 'border-danger/40'}`}>
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-fg text-sm">
                              <span className="text-muted text-xs">[{q.section}]</span> {i + 1}. {q.prompt}
                            </p>
                            {q.correct ? <CheckCircle2 size={16} className="text-success shrink-0" /> : <XCircle size={16} className="text-danger shrink-0" />}
                          </div>
                          {'correctAnswer' in q && !q.correct && (
                            <p className="text-xs text-muted">
                              Your answer: <span className="text-danger">{q.given ?? 'Not answered'}</span> · Correct answer: <span className="text-success">{q.correctAnswer}</span>
                            </p>
                          )}
                          {'answer' in q && (
                            <p className="text-xs text-muted whitespace-pre-wrap">{q.answered ? q.answer : 'Answer too short - aim for a fuller response.'}</p>
                          )}
                        </div>
                      ))}
                      {(!attempt.questionResults || attempt.questionResults.length === 0) && (
                        <p className="text-muted text-xs">This attempt was recorded before question-level detail was tracked - only section scores are available.</p>
                      )}
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