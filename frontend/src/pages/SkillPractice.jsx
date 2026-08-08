import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, Sparkles, Send, Loader2, PlayCircle, ArrowRight, RotateCcw, Mic, MicOff, Volume2 } from 'lucide-react';
import { skillsApi } from '../api/client.js';
import { Loader, ErrorState } from '../components/Loader.jsx';
import { runCodingTests } from '../utils/runCodingTests.js';

const CATEGORY_LABEL = {
  mcq: 'MCQ Practice',
  coding: 'Coding Practice',
  ai_tutor: 'AI Tutor',
  aptitude: 'Aptitude Practice',
  hr: 'HR Questions',
  company: 'Company Questions'
};

const OBJECTIVE_CATEGORIES = ['mcq', 'aptitude'];
const OPEN_ENDED_CATEGORIES = ['hr', 'company'];

export default function SkillPractice() {
  const { category } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState('loading');
  const [questions, setQuestions] = useState([]);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiMessage, setAiMessage] = useState('');

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState('question');
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState({});
  const [advancing, setAdvancing] = useState(false);

  const [feedback, setFeedback] = useState({});
  const [feedbackLoading, setFeedbackLoading] = useState({});
  const [feedbackError, setFeedbackError] = useState({});

  const [tutorTopic, setTutorTopic] = useState('');
  const [tutorQuestion, setTutorQuestion] = useState('');
  const [tutorHistory, setTutorHistory] = useState([]);
  const [tutorAsking, setTutorAsking] = useState(false);
  const [tutorError, setTutorError] = useState('');
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const savedRef = useRef(false);

  const label = CATEGORY_LABEL[category] || category;

  const load = async () => {
    setStatus('loading');
    setIndex(0);
    setPhase('question');
    setResults({});
    setFeedback({});
    savedRef.current = false;
    try {
      const { data } = await skillsApi.practice(category);
      const qs = data.questions || [];
      setQuestions(qs);
      setAiEnabled(!!data.aiEnabled);
      setAiMessage(data.message || '');
      if (category === 'coding') {
        const initial = {};
        qs.forEach((q) => {
          initial[q.id] = q.starterCode || '';
        });
        setAnswers(initial);
      } else {
        setAnswers({});
      }
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);
  // Persists the finished session to Track Record the moment the summary
  // screen appears. Guarded by savedRef so it fires exactly once per
  // session, not on every re-render of the summary screen.
  useEffect(() => {
    if (phase !== 'summary' || savedRef.current) return;
    if (category === 'ai_tutor') return;
    savedRef.current = true;

    const questionResults = questions.map((question) => {
      const r = results[question.id];
      if (OBJECTIVE_CATEGORIES.includes(category)) {
        return {
          questionId: question.id,
          prompt: question.prompt,
          correct: !!r?.correct,
          given: typeof r?.given === 'number' ? question.options[r.given] ?? null : null,
          correctAnswer: question.options[question.correctIndex]
        };
      }
      if (category === 'coding') {
        return {
          questionId: question.id,
          prompt: question.prompt,
          correct: !!r?.allPassed,
          testsPassed: r?.results ? r.results.filter((t) => t.pass).length : 0,
          testsTotal: r?.results ? r.results.length : (question.testCases?.length || 0)
        };
      }
      return {
        questionId: question.id,
        prompt: question.prompt,
        correct: !!r?.answered,
        answered: !!r?.answered,
        answer: r?.given || ''
      };
    });

    skillsApi
      .saveAttempt({ category, scorePct, correctCount, totalCount: questions.length, questionResults })
      .catch(() => {
        // Non-fatal - Track Record is a nice-to-have, never block the summary screen over it.
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (!CATEGORY_LABEL[category]) {
    return <ErrorState message="Unknown practice category." onRetry={() => navigate('/skills')} />;
  }
  if (status === 'loading') return <Loader text={`Loading ${label}...`} />;
  if (status === 'error') return <ErrorState message="Couldn't load this practice set." onRetry={load} />;

  const isObjective = OBJECTIVE_CATEGORIES.includes(category);
  const isOpenEnded = OPEN_ENDED_CATEGORIES.includes(category);
  const isCoding = category === 'coding';
  const q = questions[index];
  const isLast = index === questions.length - 1;

  const gradeQuestion = (question) => {
    if (isObjective) {
      const given = answers[question.id];
      const correct = given === question.correctIndex;
      return { correct, correctIndex: question.correctIndex, given };
    }
    if (isCoding) {
      const code = answers[question.id] || '';
      const run = runCodingTests(code, question.functionName, question.testCases);
      return run;
    }
    const given = (answers[question.id] || '').trim();
    return { answered: given.length > 20, given };
  };

  const goNext = async () => {
    if (!q) return;
    setAdvancing(true);
    const result = gradeQuestion(q);
    setResults((prev) => ({ ...prev, [q.id]: result }));

    const correctForProgress = isObjective ? result.correct : isCoding ? result.allPassed : result.answered;
    try {
      await skillsApi.submitAnswer('current', { category, correct: correctForProgress });
    } finally {
      setAdvancing(false);
    }

    if (isLast) {
      setPhase('summary');
    } else {
      setIndex((i) => i + 1);
    }
  };

  const getFeedback = async (question) => {
    setFeedbackLoading((p) => ({ ...p, [question.id]: true }));
    setFeedbackError((p) => ({ ...p, [question.id]: '' }));
    try {
      const { data } = await skillsApi.getFeedback({ prompt: question.prompt, answer: answers[question.id] || '' });
      setFeedback((p) => ({ ...p, [question.id]: data.feedback }));
    } catch (err) {
      setFeedbackError((p) => ({ ...p, [question.id]: err.response?.data?.message || 'Feedback unavailable right now.' }));
    } finally {
      setFeedbackLoading((p) => ({ ...p, [question.id]: false }));
    }
  };

  const askTutor = async () => {
    if (!tutorQuestion.trim()) return;
    setTutorAsking(true);
    setTutorError('');
    const question = tutorQuestion;
    try {
      const { data } = await skillsApi.askTutor({ question, topic: tutorTopic });
      setTutorHistory((h) => [...h, { question, answer: data.answer }]);
      setTutorQuestion('');
    } catch (err) {
      setTutorError(err.response?.data?.message || 'AI Tutor is unavailable right now.');
    } finally {
      setTutorAsking(false);
    }
  };

  // Voice input: fills the question box via the browser's built-in speech
  // recognition (Chrome/Edge). Purely additive - typing still works exactly
  // as before, this just gives a hands-free way to ask.
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setTutorError('Voice input is not supported in this browser - try Chrome or Edge.');
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setTutorQuestion((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  // Read-aloud: speaks a tutor answer using the browser's built-in speech
  // synthesis. No API calls, no cost, works fully offline once loaded.
  const speak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const correctCount = isObjective
    ? Object.values(results).filter((r) => r.correct).length
    : isCoding
      ? Object.values(results).filter((r) => r.allPassed).length
      : Object.values(results).filter((r) => r.answered).length;
  const scorePct = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;

  if (category === 'ai_tutor') {
    return (
      <div className="flex flex-col gap-6">
        <button onClick={() => navigate('/skills')} className="text-muted text-sm flex items-center gap-1.5 hover:text-fg w-fit">
          <ArrowLeft size={15} /> Skill Builder
        </button>
        <h2 className="text-fg text-lg font-semibold -mt-2">{label}</h2>
        <div className="card p-6 flex flex-col gap-4">
          {!aiEnabled && (
            <div className="rounded-input border border-danger/30 bg-danger/5 p-4 text-sm text-danger">{aiMessage}</div>
          )}
          <div className="flex flex-col gap-3">
            <input
              value={tutorTopic}
              onChange={(e) => setTutorTopic(e.target.value)}
              placeholder="Topic (optional) - e.g. Dynamic Programming, SQL Joins, OS Scheduling"
              className="input"
              disabled={!aiEnabled}
            />
            <textarea
              value={tutorQuestion}
              onChange={(e) => setTutorQuestion(e.target.value)}
              placeholder="Ask anything you're stuck on, or use the mic..."
              rows={3}
              className="input resize-none"
              disabled={!aiEnabled}
            />
            {tutorError && <p className="text-danger text-sm">{tutorError}</p>}
            <div className="flex items-center gap-2">
              <button
                onClick={askTutor}
                disabled={!aiEnabled || tutorAsking || !tutorQuestion.trim()}
                className="btn-accent px-5 py-2.5 text-sm flex items-center gap-2"
              >
                {tutorAsking ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                {tutorAsking ? 'Thinking...' : 'Ask AI'}
              </button>
              <button
                type="button"
                onClick={toggleListening}
                disabled={!aiEnabled}
                className={`btn-outline px-3 py-2.5 text-sm flex items-center gap-1.5 ${listening ? 'border-accent-500 text-accent-500' : ''}`}
                title="Ask by voice"
              >
                {listening ? <MicOff size={15} /> : <Mic size={15} />}
                {listening ? 'Listening...' : 'Speak'}
              </button>
            </div>
          </div>

          {tutorHistory.length > 0 && (
            <div className="flex flex-col gap-4 mt-2">
              {tutorHistory.map((turn, i) => (
                <div key={i} className="border border-border rounded-input p-4 flex flex-col gap-2">
                  <p className="text-fg text-sm font-medium">{turn.question}</p>
                  <div className="flex items-start gap-2">
                    <Sparkles size={14} className="text-accent-500 mt-0.5 shrink-0" />
                    <p className="text-muted text-sm whitespace-pre-wrap flex-1">{turn.answer}</p>
                    <button onClick={() => speak(turn.answer)} className="text-muted hover:text-accent-500 shrink-0" title="Read aloud">
                      <Volume2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <button onClick={() => navigate('/skills')} className="text-muted text-sm flex items-center gap-1.5 hover:text-fg w-fit">
          <ArrowLeft size={15} /> Skill Builder
        </button>
        <h2 className="text-fg text-lg font-semibold -mt-2">{label}</h2>
        <div className="card p-6">
          <p className="text-muted text-sm">No questions available for this category yet.</p>
        </div>
      </div>
    );
  }

  if (phase === 'summary') {
    return (
      <div className="flex flex-col gap-6">
        <button onClick={() => navigate('/skills')} className="text-muted text-sm flex items-center gap-1.5 hover:text-fg w-fit">
          <ArrowLeft size={15} /> Skill Builder
        </button>
        <div className="card p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-fg text-lg font-semibold">{label} - Session Complete</h2>
            <span className={scorePct >= 70 ? 'pill-success' : 'pill-danger'}>
              {correctCount}/{questions.length} {isCoding ? 'solved' : 'correct'} ({scorePct}%)
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {questions.map((question, i) => {
              const r = results[question.id];
              const good = isObjective ? r?.correct : isCoding ? r?.allPassed : r?.answered;
              return (
                <div key={question.id} className={`border rounded-input p-4 flex flex-col gap-2 ${good ? 'border-success/40' : 'border-danger/40'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-fg text-sm">
                      {i + 1}. {question.prompt}
                    </p>
                    {good ? <CheckCircle2 size={18} className="text-success shrink-0" /> : <XCircle size={18} className="text-danger shrink-0" />}
                  </div>
                  {isObjective && !good && (
                    <p className="text-xs text-muted">
                      Your answer: <span className="text-danger">{question.options[r?.given] ?? 'Not answered'}</span> · Correct answer:{' '}
                      <span className="text-success">{question.options[question.correctIndex]}</span>
                    </p>
                  )}
                  {isCoding && r?.results && (
                    <p className="text-xs text-muted">{r.results.filter((t) => t.pass).length}/{r.results.length} test cases passed</p>
                  )}
                  {isCoding && r?.error && <p className="text-xs text-danger">{r.error}</p>}
                  {isOpenEnded && (
                    <p className="text-xs text-muted">{good ? 'Answered' : 'Answer too short - aim for a fuller response.'}</p>
                  )}
                </div>
              );
            })}
          </div>

          <button onClick={load} className="btn-accent px-5 py-2.5 text-sm self-start flex items-center gap-2">
            <RotateCcw size={14} /> Practice Again
          </button>
        </div>
      </div>
    );
  }

  const r = results[q.id];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/skills')} className="text-muted text-sm flex items-center gap-1.5 hover:text-fg">
          <ArrowLeft size={15} /> Skill Builder
        </button>
        <span className="text-xs text-muted">
          Question {index + 1} of {questions.length}
        </span>
      </div>

      <h2 className="text-fg text-lg font-semibold -mt-2">{label}</h2>

      <div className="h-1.5 rounded-full bg-surface2 overflow-hidden">
        <div className="h-full bg-accent-500 transition-all" style={{ width: `${((index + (r ? 1 : 0)) / questions.length) * 100}%` }} />
      </div>

      <div className="card p-6 flex flex-col gap-4">
        <p className="text-fg text-base font-medium">
          {q.prompt}
          {q.difficulty && <span className="pill-danger ml-2 align-middle text-[10px]">{q.difficulty}</span>}
        </p>

        {q.options && (
          <div className="flex flex-col gap-2">
            {q.options.map((opt, oi) => {
              const isSelected = answers[q.id] === oi;
              return (
                <label
                  key={opt}
                  className={`flex items-center gap-2 text-sm border rounded-input px-3 py-2 cursor-pointer ${
                    isSelected ? 'border-accent-500 text-fg' : 'border-border text-muted'
                  }`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    checked={isSelected}
                    onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: oi }))}
                  />
                  {opt}
                </label>
              );
            })}
          </div>
        )}

        {isCoding && (
          <textarea
            value={answers[q.id] || ''}
            onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
            rows={10}
            spellCheck={false}
            className="input w-full resize-y font-mono text-xs leading-relaxed"
          />
        )}

        {isOpenEnded && (
          <>
            <textarea
              value={answers[q.id] || ''}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
              rows={5}
              placeholder="Write your answer..."
              className="input w-full resize-none"
            />
            <div className="flex flex-col gap-2">
              {feedback[q.id] ? (
                <p className="text-muted text-sm whitespace-pre-wrap flex items-start gap-2">
                  <Sparkles size={14} className="text-accent-500 mt-0.5 shrink-0" />
                  <span>{feedback[q.id]}</span>
                </p>
              ) : (
                <button
                  onClick={() => getFeedback(q)}
                  disabled={!aiEnabled || feedbackLoading[q.id] || !(answers[q.id] || '').trim()}
                  className="btn-outline px-3 py-1.5 text-xs self-start flex items-center gap-1.5"
                >
                  {feedbackLoading[q.id] ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                  {feedbackLoading[q.id] ? 'Getting feedback...' : 'Get AI Feedback (optional)'}
                </button>
              )}
              {feedbackError[q.id] && <p className="text-danger text-xs">{feedbackError[q.id]}</p>}
              {!aiEnabled && !feedback[q.id] && (
                <p className="text-muted text-xs">{aiMessage || 'AI feedback requires GEMINI_API_KEY on the server.'}</p>
              )}
            </div>
          </>
        )}

        <button
          onClick={goNext}
          disabled={advancing || (isObjective && answers[q.id] === undefined)}
          className="btn-accent px-5 py-2.5 text-sm self-start flex items-center gap-2 mt-2"
        >
          {advancing ? (
            <Loader2 size={15} className="animate-spin" />
          ) : isCoding ? (
            <PlayCircle size={15} />
          ) : (
            <ArrowRight size={15} />
          )}
          {advancing ? 'Grading...' : isCoding ? (isLast ? 'Run Tests & Finish' : 'Run Tests & Next') : isLast ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
}