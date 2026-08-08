import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { skillsApi } from '../api/client.js';
import { Loader, ErrorState } from '../components/Loader.jsx';

const CATEGORY_LABEL = {
  mcq: 'MCQ Practice',
  coding: 'Coding Practice',
  aptitude: 'Aptitude Practice',
  hr: 'HR Questions',
  company: 'Company Questions'
};

const FILTERS = ['all', 'mcq', 'coding', 'aptitude', 'hr', 'company'];

// Read-only review of every past Skill Builder practice session - NOT the
// live SkillProgress counter (which only tracks a running total that gets
// overwritten). Each row here is one completed session with a full
// question-by-question breakdown, so a user can come back later and study
// exactly what they got wrong instead of just seeing an aggregate score.
export default function SkillHistory() {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const load = async () => {
    setStatus('loading');
    try {
      const { data } = await skillsApi.history();
      setAttempts(data.attempts || []);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (status === 'loading') return <Loader text="Loading your practice history..." />;
  if (status === 'error') return <ErrorState message="Couldn't load history." onRetry={load} />;

  const visible = filter === 'all' ? attempts : attempts.filter((a) => a.category === filter);

  return (
    <div className="flex flex-col gap-6">
      <button onClick={() => navigate('/track-record')} className="text-muted text-sm flex items-center gap-1.5 hover:text-fg w-fit">
        <ArrowLeft size={15} /> Track Record
      </button>

      <div>
        <h2 className="text-fg text-lg font-semibold">Practice History</h2>
        <p className="text-muted text-sm mt-1">Every past session, with what you got right and wrong.</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={f === filter ? 'pill-accent' : 'pill-muted'}
            style={{ border: '1px solid #242424' }}
          >
            {f === 'all' ? 'All' : CATEGORY_LABEL[f]}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="card p-6">
          <p className="text-muted text-sm">
            No practice sessions recorded yet{filter !== 'all' ? ` for ${CATEGORY_LABEL[filter]}` : ''}.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((attempt) => {
            const isOpen = expandedId === attempt.id;
            return (
              <div key={attempt.id} className="card overflow-hidden">
                <button
                  onClick={() => setExpandedId(isOpen ? null : attempt.id)}
                  className="w-full p-5 flex items-center gap-4 text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-fg font-medium">{CATEGORY_LABEL[attempt.category] || attempt.category}</p>
                      <span className={attempt.scorePct >= 70 ? 'pill-success' : 'pill-danger'}>
                        {attempt.correctCount}/{attempt.totalCount} ({attempt.scorePct}%)
                      </span>
                    </div>
                    <p className="text-muted text-xs mt-1 flex items-center gap-1.5">
                      <Calendar size={12} />
                      {new Date(attempt.createdAt).toLocaleString('en-US', {
                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  {isOpen ? <ChevronUp size={18} className="text-muted shrink-0" /> : <ChevronDown size={18} className="text-muted shrink-0" />}
                </button>

                {isOpen && (
                  <div className="border-t border-border p-5 flex flex-col gap-3">
                    {(attempt.questionResults || []).map((q, i) => (
                      <div
                        key={q.questionId || i}
                        className={`border rounded-input p-4 flex flex-col gap-2 ${q.correct ? 'border-success/40' : 'border-danger/40'}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-fg text-sm">{i + 1}. {q.prompt}</p>
                          {q.correct ? <CheckCircle2 size={16} className="text-success shrink-0" /> : <XCircle size={16} className="text-danger shrink-0" />}
                        </div>
                        {'given' in q && 'correctAnswer' in q && !q.correct && (
                          <p className="text-xs text-muted">
                            Your answer: <span className="text-danger">{q.given ?? 'Not answered'}</span> · Correct answer:{' '}
                            <span className="text-success">{q.correctAnswer}</span>
                          </p>
                        )}
                        {'testsPassed' in q && (
                          <p className="text-xs text-muted">{q.testsPassed}/{q.testsTotal} test cases passed</p>
                        )}
                        {'answer' in q && (
                          <p className="text-xs text-muted whitespace-pre-wrap">
                            {q.answered ? q.answer : 'Answer too short - aim for a fuller response.'}
                          </p>
                        )}
                      </div>
                    ))}
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