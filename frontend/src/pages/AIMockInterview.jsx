import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Lock } from 'lucide-react';
import { interviewApi } from '../api/client.js';
import { Loader, ErrorState } from '../components/Loader.jsx';
import CompanySearch from '../components/CompanySearch.jsx';
import { useSpeechToText } from '../hooks/useSpeechToText.js';

export default function AIMockInterview() {
  const [company, setCompany] = useState(null);
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | starting | active | ended | error | locked
  const [lockedMessage, setLockedMessage] = useState('');
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  // Real mic input - transcribed speech is appended to whatever's already
  // typed, so typing and voice can be mixed freely.
  const { supported: micSupported, listening, toggleListening } = useSpeechToText({
    onResult: (transcript) => setAnswer((prev) => (prev ? `${prev} ${transcript}` : transcript))
  });

  useEffect(() => {
    if (status === 'active') {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [status]);

  const start = async () => {
    if (!company) return;
    setStatus('starting');
    setSeconds(0);
    try {
      const { data } = await interviewApi.start({ company: company.name, companyId: company.id });
      setSession(data);
      setStatus('active');
    } catch (err) {
      if (err.response?.status === 403) {
        setLockedMessage(err.response.data?.message || 'Pass the Mock Assessment for this company first.');
        setStatus('locked');
      } else {
        setStatus('error');
      }
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim() || !session) return;
    setSubmitting(true);
    try {
      const { data } = await interviewApi.answer(session.sessionId, { answer });
      setSession((prev) => ({ ...prev, ...data }));
      setAnswer('');
      if (data.isLastQuestion) {
        const end = await interviewApi.end(session.sessionId);
        setSession((prev) => ({ ...prev, ...end.data }));
        setStatus('ended');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const mmss = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  if (status === 'idle' || status === 'starting') {
    return (
      <div className="card p-8 max-w-md mx-auto flex flex-col gap-4 items-center text-center">
        <Mic size={32} className="text-accent-500" />
        <h3 className="text-fg font-semibold text-lg">Start a Mock Interview</h3>
        <p className="text-muted text-sm">Search for a company to tailor the question pattern.</p>
        <div className="w-full">
          <CompanySearch value={company} onChange={setCompany} />
        </div>
        <button
          onClick={start}
          disabled={status === 'starting' || !company}
          className="btn-accent w-full py-2.5 text-sm disabled:opacity-50"
        >
          {status === 'starting' ? 'Starting...' : 'Start Interview'}
        </button>
      </div>
    );
  }

  if (status === 'locked') {
    return (
      <div className="card p-8 max-w-md mx-auto flex flex-col gap-4 items-center text-center">
        <Lock size={28} className="text-muted" />
        <h3 className="text-fg font-semibold text-lg">Interview Locked</h3>
        <p className="text-muted text-sm">{lockedMessage}</p>
        <button onClick={() => setStatus('idle')} className="btn-outline w-full py-2.5 text-sm">
          Back
        </button>
      </div>
    );
  }

  if (status === 'error') return <ErrorState message="Couldn't start the interview." onRetry={start} />;

  if (status === 'ended') {
    return (
      <div className="card p-8 max-w-md mx-auto flex flex-col gap-4 items-center text-center">
        <p className="text-3xl font-bold text-fg">
          {session?.overallScore ?? '—'}
          <span className="text-sm text-muted">/10</span>
        </p>
        <p className="text-muted text-sm">{session?.performanceLabel || 'Interview complete'}</p>
        <div className="w-full flex flex-col gap-2 text-left text-sm">
          {session?.weakTopics?.length > 0 && (
            <p className="text-muted">
              Weak topics to revisit in Skill Builder: <span className="text-fg">{session.weakTopics.join(', ')}</span>
            </p>
          )}
        </div>
        <button onClick={() => setStatus('idle')} className="btn-accent w-full py-2.5 text-sm">
          Start Another Interview
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-5">
      <div className="col-span-2 card p-6">
        <div className="flex justify-between text-xs text-muted mb-6">
          <span>
            Question {session?.questionIndex} of {session?.totalQuestions}
          </span>
          <span>{mmss}</span>
        </div>
        <p className="text-fg font-medium mb-10">{session?.question}</p>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer, or use voice input"
          rows={4}
          className="input w-full mb-4 resize-none"
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleListening}
              disabled={!micSupported}
              title={micSupported ? (listening ? 'Stop recording' : 'Answer by voice') : 'Voice input not supported in this browser'}
              className={`w-14 h-14 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-40 ${
                listening ? 'bg-danger animate-pulse' : 'bg-accent-500'
              }`}
            >
              {listening ? <MicOff size={22} /> : <Mic size={22} />}
            </button>
            {listening && <span className="text-danger text-xs">Listening...</span>}
            {!micSupported && <span className="text-muted text-xs">Voice input isn't supported in this browser - use Chrome/Edge.</span>}
          </div>
          <button onClick={submitAnswer} disabled={submitting || !answer.trim()} className="btn-accent px-5 py-2.5 text-sm">
            {submitting ? 'Submitting...' : 'Submit Answer'}
          </button>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-fg font-semibold mb-4">AI Feedback</h3>
        {session?.lastFeedback ? (
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Communication</span>
              <span className="text-accent-500">{'★'.repeat(session.lastFeedback.communication)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Technical Knowledge</span>
              <span className="text-accent-500">{'★'.repeat(session.lastFeedback.technical)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Confidence</span>
              <span className="text-accent-500">{'★'.repeat(session.lastFeedback.confidence)}</span>
            </div>
          </div>
        ) : (
          <p className="text-muted text-sm">Submit an answer to see live feedback.</p>
        )}
      </div>
    </div>
  );
}
