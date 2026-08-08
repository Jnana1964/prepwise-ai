import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  Code2,
  Star,
  Check,
  X,
  PlayCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Upload,
  BarChart3,
  Sparkles,
  Target,
  Layers,
  Trophy
} from 'lucide-react';
import DemoVideoModal from '../components/DemoVideoModal.jsx';
import logoImg from '../assets/logo.png';

const NAV_LINKS = ['Features', 'Workflow', 'Pricing', 'About'];

const FEATURE_CARDS = [
  {
    icon: FileText,
    title: 'Resume Intelligence',
    items: ['ATS Analysis', 'AI Rewrite', 'Tailored Resume']
  },
  {
    icon: Search,
    title: 'Career Matching',
    items: ['Real Job Match', 'Skill Gap', 'Apply via Internshala']
  },
  {
    icon: Code2,
    title: 'Skill Builder',
    items: ['Coding', 'MCQs', 'AI Tutor', 'Roadmaps']
  },
  {
    icon: Star,
    title: 'AI Interview',
    items: ['Mock Interview', 'Feedback', 'Confidence', 'Placement Readiness']
  }
];

// Rich "How It Works" carousel content - one big card at a time, real icon +
// description + feature tags per step (not just a bare number).
const HOW_IT_WORKS = [
  {
    icon: Upload,
    title: 'Upload resume',
    desc: "Drop it in — every section is read instantly, no waiting.",
    tags: ['PDF parsing', 'Instant read', 'No signup wait']
  },
  {
    icon: BarChart3,
    title: 'Analyze resume',
    desc: 'See your real ATS and recruiter score, computed deterministically.',
    tags: ['ATS score', 'Recruiter score', 'Section check']
  },
  {
    icon: Sparkles,
    title: 'Improve resume',
    desc: 'Accept AI suggestions and watch your score climb live.',
    tags: ['AI rewrite', 'Live score', 'Keyword gaps']
  },
  {
    icon: Target,
    title: 'Match jobs',
    desc: 'Ranked, real listings scored by your actual skill match.',
    tags: ['Internshala live', 'Skill match %', 'Real apply links']
  },
  {
    icon: Layers,
    title: 'Build skills',
    desc: "Practice exactly what the gap analysis found you're missing.",
    tags: ['MCQ', 'Coding', 'Aptitude']
  },
  {
    icon: Trophy,
    title: 'Crack interviews',
    desc: 'Company-specific mock exams, then a real AI interview.',
    tags: ['Company-specific', 'Timed exam', 'Voice AI']
  }
];

const PROBLEMS = ['Generic Resume', 'Missing Keywords', 'Weak Projects', 'Low ATS Score', 'No Interview Practice'];
const FIXES = [
  'Tailored to each JD',
  'Keyword gap detection',
  'AI project rewrite suggestions',
  'Deterministic ATS scoring',
  'Company-specific mock interviews'
];

const METRICS = [
  { value: '8', label: 'Modules' },
  { value: '15', label: 'AI Features' },
  { value: '40+', label: 'Resume Checks' },
  { value: '5', label: 'Assessment Types' },
  { value: '6', label: 'Practice Categories' },
  { value: '3', label: 'Interview Modes' }
];

// Auto-advancing, one-big-card-at-a-time carousel with manual arrows/dots.
// Manual interaction resets the auto-advance timer rather than fighting it.
function HowItWorksCarousel() {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  const startAuto = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % HOW_IT_WORKS.length);
    }, 2800);
  };

  useEffect(() => {
    startAuto();
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const go = (dir) => {
    setIndex((i) => (i + dir + HOW_IT_WORKS.length) % HOW_IT_WORKS.length);
    startAuto();
  };

  const goTo = (i) => {
    setIndex(i);
    startAuto();
  };

  const step = HOW_IT_WORKS[index];
  const Icon = step.icon;

  return (
    <div className="flex items-center gap-5 max-w-3xl mx-auto">
      <button
        onClick={() => go(-1)}
        aria-label="Previous step"
        className="w-10 h-10 rounded-full border border-border bg-surface2 flex items-center justify-center shrink-0 hover:border-accent-500 hover:text-accent-500 transition-colors"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="flex-1 overflow-hidden">
        <div className="card p-12 sm:p-14 flex flex-col items-center text-center relative overflow-hidden">
          <span
            aria-hidden="true"
            className="absolute -top-4 right-2 text-[120px] font-extrabold leading-none pointer-events-none"
            style={{ color: 'rgba(255,106,26,0.05)' }}
          >
            {String(index + 1).padStart(2, '0')}
          </span>
          <p className="text-accent-500 text-xs font-bold uppercase tracking-wider mb-4 relative">
            Step {index + 1} of {HOW_IT_WORKS.length}
          </p>
          <div className="w-[72px] h-[72px] rounded-[20px] bg-accent-500/10 text-accent-500 flex items-center justify-center mb-5 relative">
            <Icon size={30} />
          </div>
          <h4 className="text-2xl font-bold mb-3 relative">{step.title}</h4>
          <p className="text-muted text-[15px] leading-relaxed max-w-md mb-5 relative">{step.desc}</p>
          <div className="flex flex-wrap gap-2 justify-center relative">
            {step.tags.map((t) => (
              <span key={t} className="bg-surface2 border border-border text-muted text-xs px-3 py-1.5 rounded-full">
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-1.5 justify-center mt-6">
          {HOW_IT_WORKS.map((s, i) => (
            <button
              key={s.title}
              onClick={() => goTo(i)}
              aria-label={`Go to step ${i + 1}`}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === index ? 22 : 7,
                background: i === index ? '#ff6a1a' : '#242424'
              }}
            />
          ))}
        </div>
      </div>

      <button
        onClick={() => go(1)}
        aria-label="Next step"
        className="w-10 h-10 rounded-full border border-border bg-surface2 flex items-center justify-center shrink-0 hover:border-accent-500 hover:text-accent-500 transition-colors"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

// Scroll-reveal: any element with data-reveal starts hidden/offset, and
// gets the .reveal-in class (via IntersectionObserver) the first time it
// enters the viewport, then stays revealed. Purely visual - no layout,
// colors or content changed anywhere else on the page.
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-in');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

export default function Homepage() {
  useScrollReveal();
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="min-h-screen bg-base text-white">
      <DemoVideoModal open={showDemo} onClose={() => setShowDemo(false)} />
      <style>{`
        @keyframes pwFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
        @keyframes pwPulse { 0%, 100% { transform: scale(1); opacity: .9; } 50% { transform: scale(1.12); opacity: .55; } }
        @keyframes pwSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pwBlink { 0%, 100% { opacity: 1; } 50% { opacity: .25; } }
        @keyframes pwDrift { 0% { transform: translateY(0); opacity: 0; } 15% { opacity: .8; } 100% { transform: translateY(-180px); opacity: 0; } }

        [data-reveal] {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 0.75s cubic-bezier(0.22,1,0.36,1), transform 0.75s cubic-bezier(0.22,1,0.36,1);
          will-change: opacity, transform;
        }
        [data-reveal].reveal-in {
          opacity: 1;
          transform: translateY(0);
        }
        @media (prefers-reduced-motion: reduce) {
          [data-reveal] { opacity: 1; transform: none; transition: none; }
        }
      `}</style>

      <header className="flex items-center justify-between px-10 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <img src={logoImg} alt="PrepWise AI" width={32} height={32} style={{ objectFit: 'contain' }} />
          <span className="font-semibold text-lg">PrepWise AI</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted">
          {NAV_LINKS.map((l) => (
            <span key={l} className="hover:text-white transition-colors duration-150 cursor-pointer">
              {l}
            </span>
          ))}
          <Link to="/login" className="hover:text-white transition-colors duration-150">
            Login
          </Link>
        </nav>
        <Link to="/signup" className="btn-outline px-5 py-2.5 text-sm">
          Get Started
        </Link>
      </header>

      {/* Hero: content left, animated logo right */}
      <section className="grid md:grid-cols-2 gap-12 items-center px-10 py-20 max-w-7xl mx-auto">
        <div>
          <div
            className="inline-flex items-center gap-2 text-accent-500 text-xs font-semibold tracking-wide px-3.5 py-1.5 rounded-full mb-5"
            style={{ background: 'rgba(255,106,26,0.10)', border: '1px solid rgba(255,106,26,0.30)' }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-accent-500"
              style={{ animation: 'pwBlink 1.6s ease-in-out infinite' }}
            />
            The Future of Career Preparation Is Here
          </div>
          <h1 className="text-[42px] font-extrabold leading-tight mb-5">
            Land Your Dream Career with an <span className="text-accent-500">AI Mentor</span> That Never Stops
            Coaching.
          </h1>
          <p className="text-muted text-[15.5px] leading-relaxed mb-8 max-w-md">
            Upload your resume, uncover hidden weaknesses, improve it with AI, discover the right opportunities,
            master in-demand skills, practice company-specific assessments, and ace mock interviews — all in one
            intelligent career preparation platform.
          </p>
          <div className="flex gap-4">
            <Link to="/signup" className="btn-accent px-6 py-3.5 text-sm">
              Get Started
            </Link>
            <button
              onClick={() => setShowDemo(true)}
              className="btn-outline px-6 py-3.5 text-sm flex items-center gap-2"
            >
              <PlayCircle size={16} /> Watch Demo
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="relative flex items-center justify-center" style={{ width: 540, height: 580 }}>
            <div
              className="absolute rounded-full"
              style={{
                width: 540,
                height: 540,
                background: 'radial-gradient(circle, rgba(255,106,26,0.30) 0%, rgba(255,106,26,0) 70%)',
                animation: 'pwPulse 3.2s ease-in-out infinite'
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                width: 440,
                height: 440,
                border: '1px solid rgba(255,106,26,0.35)',
                animation: 'pwSpin 14s linear infinite'
              }}
            />
            {/* Ambient particles drifting upward around the 3D render */}
            {[...Array(6)].map((_, i) => (
              <span
                key={i}
                className="absolute rounded-full"
                style={{
                  width: 3,
                  height: 3,
                  background: '#ff8a3d',
                  left: `${18 + i * 12}%`,
                  bottom: 20,
                  opacity: 0.7,
                  animation: `pwDrift ${3.5 + i * 0.6}s ease-in-out ${i * 0.4}s infinite`
                }}
              />
            ))}
            <img
              src={logoImg}
              alt="PrepWise AI"
              style={{
                maxWidth: 420,
                maxHeight: 540,
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 22px rgba(255,106,26,0.5))',
                position: 'relative',
                animation: 'pwFloat 4.5s ease-in-out infinite'
              }}
            />
          </div>
        </div>
      </section>

      <section className="px-10 py-16 max-w-7xl mx-auto" data-reveal>
        <h2 className="text-3xl font-bold text-center mb-3">Why PrepWise AI?</h2>
        <p className="text-muted text-sm text-center mb-12 max-w-lg mx-auto">
          Everything a placement journey needs, built as one connected platform instead of five disconnected tools.
        </p>
        <div className="grid md:grid-cols-4 gap-5">
          {FEATURE_CARDS.map(({ icon: Icon, title, items }, i) => (
            <div
              key={title}
              className="card card-hover p-6"
              data-reveal
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <div className="w-10 h-10 rounded-btn bg-accent-500/10 text-accent-500 flex items-center justify-center mb-4">
                <Icon size={19} />
              </div>
              <h3 className="font-semibold mb-3">{title}</h3>
              <div className="flex flex-col gap-1.5">
                {items.map((it) => (
                  <p key={it} className="text-sm text-muted">
                    {it}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-10 py-16 max-w-6xl mx-auto" data-reveal>
        <h2 className="text-3xl font-bold text-center mb-3">How It Works</h2>
        <p className="text-muted text-sm text-center mb-12 max-w-lg mx-auto">
          Moves on its own — or use the arrows/dots to jump ahead.
        </p>
        <HowItWorksCarousel />
      </section>

      <section className="px-10 py-16 max-w-5xl mx-auto" data-reveal>
        <h2 className="text-3xl font-bold text-center mb-3">Why Companies Reject Candidates</h2>
        <p className="text-muted text-sm text-center mb-12 max-w-lg mx-auto">
          Most rejections aren't about talent — they're about invisible gaps a generic job search never catches.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-6" data-reveal>
            <p className="text-sm text-muted mb-4">The problem</p>
            <div className="flex flex-col gap-3">
              {PROBLEMS.map((p) => (
                <div key={p} className="flex items-center gap-2.5 text-sm">
                  <X size={15} className="text-danger shrink-0" />
                  {p}
                </div>
              ))}
            </div>
          </div>
          <div className="card p-6" data-reveal style={{ transitionDelay: '120ms' }}>
            <p className="text-sm text-muted mb-4">PrepWise AI fixes it</p>
            <div className="flex flex-col gap-3">
              {FIXES.map((f) => (
                <div key={f} className="flex items-center gap-2.5 text-sm">
                  <Check size={15} className="text-success shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-10 py-16 max-w-6xl mx-auto" data-reveal>
        <h2 className="text-3xl font-bold text-center mb-12">Platform Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {METRICS.map((m, i) => (
            <div key={m.label} className="card p-5 text-center" data-reveal style={{ transitionDelay: `${i * 70}ms` }}>
              <p className="text-2xl font-bold text-accent-500 mb-1">{m.value}</p>
              <p className="text-xs text-muted">{m.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-10 py-16" data-reveal>
        <div
          className="max-w-4xl mx-auto rounded-modal border border-border p-14 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(180deg, rgb(19,19,19) 0%, rgb(22,22,22) 100%)' }}
        >
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 340,
              height: 180,
              top: -60,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'radial-gradient(circle, rgba(255,106,26,0.20) 0%, rgba(255,106,26,0) 70%)'
            }}
          />
          <h2 className="text-3xl font-bold mb-3 relative">Ready to prepare smarter?</h2>
          <p className="text-muted text-sm mb-8 relative">
            Join now and turn every application into a real shot at an offer.
          </p>
          <Link to="/signup" className="btn-accent px-7 py-3.5 text-sm inline-flex items-center gap-2 relative">
            Start Your Placement Journey <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-4 px-10 py-8">
        <div className="flex items-center gap-2.5">
          <img src={logoImg} alt="PrepWise AI" width={22} height={22} style={{ objectFit: 'contain' }} />
          <span className="font-medium text-sm">PrepWise AI</span>
        </div>
        <div className="flex gap-6 text-sm text-muted">
          <span>Resources</span>
          <span>Privacy</span>
          <span>Terms</span>
          <span>GitHub</span>
          <span>Contact</span>
        </div>
      </footer>
    </div>
  );
}
