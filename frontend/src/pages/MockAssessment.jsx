import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ChevronRight, Video, VideoOff, Timer } from 'lucide-react';
import { assessmentApi, skillsApi } from '../api/client.js';
import CompanySearch from '../components/CompanySearch.jsx';
import { Loader, ErrorState } from '../components/Loader.jsx';

// Section -> Skill Builder category. Reuses the SAME real question bank as
// Skill Builder (no separate fake assessment content) - "programming" maps
// to the coding bank, which is open-ended, so it's scored by whether a
// substantive answer was given rather than an exact-match key.
const ALL_SECTIONS = [
  { key: 'aptitude', label: 'Aptitude', category: 'aptitude' },
  { key: 'technicalMcq', label: 'Technical MCQ', category: 'mcq' },
  { key: 'programming', label: 'Programming', category: 'coding' },
  { key: 'csFundamentals', label: 'CS Fundamentals', category: 'company' },
  { key: 'hrBehavioral', label: 'HR / Behavioral', category: 'hr' }
];

// Real placement exams are not one-size-fits-all - a TCS-style drive is
// aptitude-heavy with light coding, a product company (Amazon/Google/
// Microsoft) is coding-heavy, and consulting firms (Deloitte/EY/PwC/KPMG)
// lean on behavioral rounds. This maps each company's `assessmentPattern`
// (already seeded in companiesSeed.js but previously unused by this page)
// to which sections appear, how many questions each gets, and how long the
// timed exam runs - so picking TCS vs. Amazon now genuinely produces a
// different exam, not just a different label.
const PATTERN_CONFIG = {
  aptitude_heavy: {
    label: 'Aptitude-Heavy Pattern',
    durationSeconds: 45 * 60,
    counts: { aptitude: 6, technicalMcq: 4, programming: 1, csFundamentals: 1 }
  },
  coding_heavy: {
    label: 'Coding-Heavy Pattern',
    durationSeconds: 60 * 60,
    counts: { aptitude: 2, technicalMcq: 3, programming: 3, csFundamentals: 2 }
  },
  behavioral_heavy: {
    label: 'Behavioral-Heavy Pattern',
    durationSeconds: 40 * 60,
    counts: { aptitude: 2, technicalMcq: 2, programming: 1, csFundamentals: 1, hrBehavioral: 3 }
  },
  balanced: {
    label: 'Balanced Pattern',
    durationSeconds: 50 * 60,
    counts: { aptitude: 3, technicalMcq: 3, programming: 2, csFundamentals: 2 }
  }
};

function mmss(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function MockAssessment() {
  const navigate = useNavigate();
  const [eligibility, setEligibility] = useState(null);
  const [status, setStatus] = useState('loading');
  const [company, setCompany] = useState(null);
  const [examPhase, setExamPhase] = useState('precheck'); // precheck | active
  const [questionsBySection, setQuestionsBySection] = useState({});
  const [activeSection, setActiveSection] = useState(null);
  const [answers, setAnswers] = useState({}); // `${section}-${qid}` -> selectedIndex or text
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);
  const submitRef = useRef(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [camStatus, setCamStatus] = useState('idle'); // idle | requesting | on | denied | unsupported

  const pattern = company ? PATTERN_CONFIG[company.assessmentPattern] || PATTERN_CONFIG.balanced : null;
  const sections = pattern ? ALL_SECTIONS.filter((s) => pattern.counts[s.key] > 0) : [];

  const load = async () => {
    setStatus('loading');
    try {
      const { data } = await assessmentApi.eligibility();
      setEligibility(data);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Camera preview - visual proctoring simulation only. Nothing is recorded
  // or uploaded; the stream stays local to the <video> element and is
  // stopped the moment the exam ends or the tab is left.
  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCamStatus('unsupported');
      return;
    }
    setCamStatus('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCamStatus('on');
    } catch {
      setCamStatus('denied');
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  useEffect(() => () => stopCamera(), []);

  const beginExam = async () => {
    if (!company || !pattern) return;
    setLoadingQuestions(true);
    try {
      const entries = await Promise.all(
        sections.map(async (s) => {
          const { data: p } = await skillsApi.practice(s.category);
          return [s.key, (p.questions || []).slice(0, pattern.counts[s.key])];
        })
      );
      setQuestionsBySection(Object.fromEntries(entries));
      setActiveSection(sections[0]?.key || null);
      setTimeLeft(pattern.durationSeconds);
      setExamPhase('active');
      startCamera();
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Countdown timer - auto-submits the moment it hits zero, same as a real
  // proctored placement exam.
  useEffect(() => {
    if (examPhase !== 'active' || result) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          submitRef.current?.(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examPhase, result]);

  if (status === 'loading') return <Loader text="Checking eligibility..." />;
  if (status === 'error') return <ErrorState message="Couldn't load the assessment." onRetry={load} />;

  if (!eligibility?.skillBuilderComplete) {
    return (
      <div className="card p-8 max-w-md mx-auto flex flex-col gap-4 items-center text-center">
        <Lock size={28} className="text-muted" />
        <h3 className="text-fg font-semibold text-lg">Complete Skill Builder First</h3>
        <p className="text-muted text-sm">
          Practice every Skill Builder category before taking a Mock Assessment.
        </p>
        <button onClick={() => navigate('/skills')} className="btn-accent w-full py-2.5 text-sm">
          Go to Skill Builder
        </button>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="card p-8 max-w-md mx-auto flex flex-col gap-4 items-center text-center">
        <h3 className="text-fg font-semibold text-lg">Choose a Company</h3>
        <p className="text-muted text-sm">Search any company - the exam pattern, timer, and question mix adapt to it.</p>
        <div className="w-full">
          <CompanySearch value={company} onChange={setCompany} />
        </div>
      </div>
    );
  }

  // ---- Pre-check screen: shown before the timer/camera start ----
  if (examPhase === 'precheck') {
    return (
      <div className="card p-8 max-w-lg mx-auto flex flex-col gap-4 items-center text-center">
        <h3 className="text-fg font-semibold text-lg">{company.name} Assessment</h3>
        <span className="pill-accent">{pattern.label}</span>
        <div className="w-full flex flex-col gap-2 text-left text-sm text-muted">
          <p>
            Duration: <span className="text-fg">{Math.round(pattern.durationSeconds / 60)} minutes</span> · auto-submits when time runs out.
          </p>
          <p>
            Sections: <span className="text-fg">{sections.map((s) => s.label).join(', ')}</span>
          </p>
          <p>This assessment uses your webcam for a proctoring-style preview. Nothing is recorded or uploaded.</p>
        </div>
        <button onClick={beginExam} disabled={loadingQuestions} className="btn-accent w-full py-2.5 text-sm">
          {loadingQuestions ? 'Preparing exam...' : 'Start Exam'}
        </button>
        <button onClick={() => setCompany(null)} className="text-muted text-xs">
          Choose a different company
        </button>
      </div>
    );
  }

  const computeSectionScores = () => {
    const scores = {};
    for (const section of sections) {
      const questions = questionsBySection[section.key] || [];
      if (questions.length === 0) {
        scores[section.key] = 0;
        continue;
      }
      let correct = 0;
      for (const q of questions) {
        const given = answers[`${section.key}-${q.id}`];
        if (typeof q.correctIndex === 'number') {
          if (given === q.correctIndex) correct += 1;
        } else if (typeof given === 'string' && given.trim().length > 20) {
          // Open-ended (coding / HR) - credit a substantive attempt.
          correct += 1;
        }
      }
      scores[section.key] = Math.round((correct / questions.length) * 100);
    }
    return scores;
  };
  // Same per-question data computeSectionScores already walks through, just
  // kept as individual records instead of collapsed into a percentage - this
  // is what lets Track Record show exactly which questions were missed.
  const buildQuestionResults = () => {
    const list = [];
    for (const section of sections) {
      const questions = questionsBySection[section.key] || [];
      for (const q of questions) {
        const given = answers[`${section.key}-${q.id}`];
        if (typeof q.correctIndex === 'number') {
          const correct = given === q.correctIndex;
          list.push({
            questionId: q.id,
            prompt: q.prompt,
            section: section.label,
            category: section.category,
            correct,
            given: typeof given === 'number' ? q.options[given] ?? null : null,
            correctAnswer: q.options[q.correctIndex]
          });
        } else {
          const answered = typeof given === 'string' && given.trim().length > 20;
          list.push({
            questionId: q.id,
            prompt: q.prompt,
            section: section.label,
            category: section.category,
            correct: answered,
            answered,
            answer: given || ''
          });
        }
      }
    }
    return list;
  };

  const submit = async (auto = false) => {
    if (submitting || result) return;
    setSubmitting(true);
    clearInterval(timerRef.current);
    stopCamera();
    try {
       const sectionScores = computeSectionScores();
      const questionResults = buildQuestionResults();
      const { data } = await assessmentApi.submit({ company: company.name, companyId: company.id, sectionScores, questionResults });
      setResult({ ...data, sectionScores, autoSubmitted: auto });
    } finally {
      setSubmitting(false);
    }
  };
  submitRef.current = submit;

  if (result) {
    return (
      <div className="card p-8 max-w-md mx-auto flex flex-col gap-4 items-center text-center">
        {result.autoSubmitted && <p className="text-xs text-danger">Time ran out - your exam was auto-submitted.</p>}
        <div className="text-3xl font-bold text-fg">
          {result.score}
          <span className="text-sm text-muted">%</span>
        </div>
        <span className={result.passed ? 'pill-success' : 'pill-danger'}>
          {result.passed ? 'Passed' : `Below ${result.passThreshold}% threshold`}
        </span>
        {result.passed ? (
          <>
            <p className="text-muted text-sm">AI Mock Interview is now unlocked for {company.name}.</p>
            <button onClick={() => navigate('/interview')} className="btn-accent w-full py-2.5 text-sm">
              Start AI Mock Interview
            </button>
          </>
        ) : (
          <>
            <p className="text-muted text-sm">Practice more in Skill Builder, then retake this assessment.</p>
            <button
              onClick={async () => {
                try { await skillsApi.reset(); } catch { /* non-fatal - navigate anyway */ }
                navigate('/skills');
             }}
             className="btn-outline w-full py-2.5 text-sm"
           >
             Back to Skill Builder
           </button>
          </>
        )}
      </div>
    );
  }

  const questions = questionsBySection[activeSection] || [];
  const lowTime = timeLeft <= 300;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {sections.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={s.key === activeSection ? 'pill-accent' : 'pill-muted'}
              style={{ border: '1px solid #242424' }}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className={`flex items-center gap-2 text-sm font-semibold ${lowTime ? 'text-danger' : 'text-fg'}`}>
          <Timer size={16} />
          {mmss(timeLeft)}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 card p-6 flex flex-col gap-4">
          {questions.length === 0 ? (
            <p className="text-sm text-muted">No questions available for this section.</p>
          ) : (
            questions.map((q, i) => (
              <div key={q.id} className="border border-border rounded-input p-4">
                <p className="text-fg text-sm mb-3">
                  {i + 1}. {q.prompt}
                </p>
                {q.options ? (
                  <div className="flex flex-col gap-1.5">
                    {q.options.map((opt, oi) => (
                      <label key={opt} className="flex items-center gap-2 text-sm text-muted">
                        <input
                          type="radio"
                          name={`${activeSection}-${q.id}`}
                          checked={answers[`${activeSection}-${q.id}`] === oi}
                          onChange={() => setAnswers((prev) => ({ ...prev, [`${activeSection}-${q.id}`]: oi }))}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                ) : (
                  <textarea
                    className="input w-full resize-none"
                    rows={3}
                    placeholder="Write your answer..."
                    value={answers[`${activeSection}-${q.id}`] || ''}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [`${activeSection}-${q.id}`]: e.target.value }))}
                  />
                )}
              </div>
            ))
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="card p-6 flex flex-col gap-4 h-fit">
            <div>
              <p className="text-fg font-semibold">{company.name}</p>
              <p className="text-xs text-muted">{company.industry}</p>
              <span className="pill-muted text-[11px] mt-1 inline-block">{pattern.label}</span>
            </div>
            <div>
              <p className="text-xs text-muted">Pass Threshold</p>
              <p className="text-2xl font-bold text-accent-500">{eligibility.passThreshold}%</p>
            </div>
            <button onClick={() => submit(false)} disabled={submitting} className="btn-accent py-2.5 text-sm flex items-center justify-center gap-2">
              {submitting ? 'Scoring...' : 'Submit Assessment'} <ChevronRight size={15} />
            </button>
          </div>

          <div className="card p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs text-muted">
              {camStatus === 'on' ? <Video size={14} className="text-success" /> : <VideoOff size={14} />}
              Proctoring Preview
            </div>
            {camStatus === 'on' && (
              <video ref={videoRef} autoPlay muted playsInline className="w-full rounded-input bg-black aspect-video" />
            )}
            {camStatus === 'requesting' && <p className="text-xs text-muted">Requesting camera access...</p>}
            {camStatus === 'denied' && <p className="text-xs text-muted">Camera access denied - continuing without preview.</p>}
            {camStatus === 'unsupported' && <p className="text-xs text-muted">Camera not supported in this browser.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
