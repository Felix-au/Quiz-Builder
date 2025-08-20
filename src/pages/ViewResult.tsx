import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
// no header icons needed now
import { signInWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup, createUserWithEmailAndPassword, signOut, sendEmailVerification } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const API_BASE = import.meta.env.VITE_RESULTS_API_URL || "https://result-xxa7.onrender.com";

type SearchResultItem = {
  _id: string | null;
  attemptId: number;
  quizId: number;
  quizName: string | null;
  quizCode: string | null;
  subject: string | null;
  instructorName: string | null;
  course: string | null;
  startTime: string | null;
  endTime: string | null;
  durationMinutes: number | null;
  marksObtained: number | null;
  totalMarks: number | null;
  numDisplayedQuestions: number | null;
  status: string | null;
  // present in instructor search results; optional in student view
  studentName?: string | null;
  studentEmail?: string | null;
  enrollmentNumber?: string | null;
};

// Minimal two-theme model cloned from Home/Credits
type ThemeKey = 'solarizedDuo' | 'gradientMeshPop';
type ThemeConfig = {
  name: string;
  rootBg: string;
  header: string;
  headerText: string;
  renderOverlay: (args: { mx: number; my: number; reduceMotion: boolean }) => React.ReactNode;
};

const themes: Record<ThemeKey, ThemeConfig> = {
  solarizedDuo: {
    name: 'Solarized Duo',
    rootBg: 'bg-[#fdf6e3]',
    header: 'bg-[#fdf6e3]/80 backdrop-blur-xl shadow-lg border-b border-amber-200',
    headerText: 'text-black',
    renderOverlay: () => (
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 20% 30%, rgba(38,139,210,0.15), transparent 40%), radial-gradient(circle at 80% 70%, rgba(203,75,22,0.15), transparent 40%)' }} />
    ),
  },
  gradientMeshPop: {
    name: 'Gradient Mesh Pop',
    rootBg: 'bg-black',
    header: 'bg-white/10 backdrop-blur-xl shadow-lg border-b border-white/20',
    headerText: 'text-white',
    renderOverlay: () => (
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 20% 30%, rgba(34,211,238,0.25), transparent 35%), radial-gradient(circle at 80% 20%, rgba(244,63,94,0.25), transparent 35%), radial-gradient(circle at 60% 80%, rgba(250,204,21,0.25), transparent 35%)' }} />
    ),
  },
};

type DetailDTO = {
  summary: {
    quizId: number | null;
    quizName: string | null;
    quizCode: string | null;
    subject: string | null;
    subjectCode: string | null;
    course: string | null;
    instructorName: string | null;
    academicYear: string | null;
    courseYear: string | null;
    numDisplayedQuestions: number | null;
    student: {
      name: string | null;
      email: string | null;
      enrollmentNumber: string | null;
      section: string | null;
    };
    timing: {
      startTime: string | null;
      endTime: string | null;
      durationMinutes: number | null;
    };
    scoring: {
      marksObtained: number | null;
      totalMarks: number | null;
      percentage: number | null;
      easyCorrect?: number | null;
      mediumCorrect?: number | null;
      highCorrect?: number | null;
      easyTotal?: number | null;
      mediumTotal?: number | null;
      highTotal?: number | null;
    };
    meta: {
      systemName: string | null;
      fullScreenFaults: number | null;
      status: string | null;
      showDetailedResult?: boolean | null;
    };
  };
  questions: Array<{
    index: number;
    questionId: number;
    questionText: string;
    imageUrl: string | null;
    points: number | null;
    difficulty: string | null;
    topic: string | null;
    subject: string | null;
    options: Array<{
      id: number;
      text: string;
      isCorrect: boolean;
      isSelected: boolean;
    }>;
    isCorrect: boolean;
    selectedOptionIds: number[];
    correctOptionIds: number[];
  }>;
};

export default function ViewResult() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  // Theme + parallax state
  const [mx, setMx] = React.useState(0);
  const [my, setMy] = React.useState(0);
  const { theme, setTheme, reduceMotion } = useTheme();
  const isDark = themes[theme].headerText.includes('white');
  const btnNeutral = isDark
    ? 'bg-white/10 text-white border-white/15 hover:bg-white/15 focus-visible:ring-white/20'
    : 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100 focus-visible:ring-gray-200';
  const footerShell = isDark ? 'bg-slate-900/60 backdrop-blur-xl border-t border-white/15' : 'bg-white/70 backdrop-blur-xl border-t border-gray-200';
  const footerText = isDark ? 'text-white/80' : 'text-gray-700';
  const targetTheme: ThemeKey = theme === 'solarizedDuo' ? 'gradientMeshPop' : 'solarizedDuo';
  const targetLabel = targetTheme === 'solarizedDuo' ? 'Switch to Solarized Duo' : 'Switch to Gradient Mesh Pop';
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { innerWidth, innerHeight } = window;
    const nx = e.clientX / innerWidth - 0.5;
    const ny = e.clientY / innerHeight - 0.5;
    setMx(nx);
    setMy(ny);
  };
  const [enrollmentNumber, setEnrollmentNumber] = React.useState("");
  const [email, setEmail] = React.useState("");
  // Instructor view toggle and fields
  const [isInstructorView, setIsInstructorView] = React.useState(false);
  const [quizNameInput, setQuizNameInput] = React.useState("");
  const [selectedQuizId, setSelectedQuizId] = React.useState<number | null>(null);
  const [quizPassword, setQuizPassword] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<Array<{ quizId: number; quizName: string; quizCode: string }>>([]);
  const [suggestLoading, setSuggestLoading] = React.useState(false);
  const suggestAbortRef = React.useRef<AbortController | null>(null);

  const [searchLoading, setSearchLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Trusted instructor flow
  const [isTrusted, setIsTrusted] = React.useState<boolean>(false);
  const [trustLoading, setTrustLoading] = React.useState<boolean>(false);

  const [results, setResults] = React.useState<SearchResultItem[]>([]);
  const [selectedAttemptId, setSelectedAttemptId] = React.useState<number | null>(null);
  const [detail, setDetail] = React.useState<DetailDTO | null>(null);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [detailError, setDetailError] = React.useState<string | null>(null);
  const detailRef = React.useRef<HTMLDivElement | null>(null);

  // Instructor-only: filters and sorting
  const [instFilters, setInstFilters] = React.useState({
    name: '',
    email: '',
    enrollment: '',
  });
  const [sortBy, setSortBy] = React.useState<
    'name' | 'email' | 'enrollment' | 'marks' | 'duration' | 'start' | 'end' | 'subject' | 'quiz' | null
  >('enrollment');
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('asc');

  const displayedResults = React.useMemo(() => {
    let arr = results.slice();
    if (isInstructorView) {
      const name = instFilters.name.trim().toLowerCase();
      const email = instFilters.email.trim().toLowerCase();
      const enrollment = instFilters.enrollment.trim().toLowerCase();
      if (name) arr = arr.filter(r => (r.studentName || '').toLowerCase().includes(name));
      if (email) arr = arr.filter(r => (r.studentEmail || '').toLowerCase().includes(email));
      if (enrollment) arr = arr.filter(r => (r.enrollmentNumber || '').toLowerCase().includes(enrollment));

      if (sortBy) {
        const getVal = (r: SearchResultItem) => {
          switch (sortBy) {
            case 'name': return r.studentName ?? '';
            case 'email': return r.studentEmail ?? '';
            case 'enrollment': return r.enrollmentNumber ?? '';
            case 'subject': return r.subject ?? '';
            case 'quiz': return r.quizName ?? '';
            case 'marks': return r.marksObtained ?? -Infinity;
            case 'duration': return r.durationMinutes ?? -Infinity;
            case 'start': return r.startTime ?? '';
            case 'end': return r.endTime ?? '';
            default: return '';
          }
        };
        arr.sort((a, b) => {
          const va = getVal(a) as any;
          const vb = getVal(b) as any;
          // Handle numbers vs strings
          const num = typeof va === 'number' && typeof vb === 'number';
          let cmp = 0;
          if (num) cmp = (va as number) - (vb as number);
          else cmp = String(va).localeCompare(String(vb));
          return sortDir === 'asc' ? cmp : -cmp;
        });
      }
    }
    return arr;
  }, [results, isInstructorView, instFilters, sortBy, sortDir]);

  const toggleSort = (key: NonNullable<typeof sortBy>) => {
    if (sortBy === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(key); setSortDir('asc'); }
  };

  // Inline auth form state (for unauthenticated users)
  const [loginEmail, setLoginEmail] = React.useState("");
  const [loginPassword, setLoginPassword] = React.useState("");
  const [authLoading, setAuthLoading] = React.useState(false);
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [isSignUp, setIsSignUp] = React.useState(false);
  // Email verification modal state
  const [showVerifyDialog, setShowVerifyDialog] = React.useState(false);
  const [verifyEmailAddress, setVerifyEmailAddress] = React.useState("");

  // Header simplified: Home + Contact, logo/link to '/'

  React.useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  // Determine trusted status when entering Instructor view or when email changes
  React.useEffect(() => {
    const run = async () => {
      if (!isInstructorView) { setIsTrusted(false); return; }
      const e = (user?.email || '').trim();
      if (!e) { setIsTrusted(false); return; }
      setTrustLoading(true);
      try {
        const resp = await fetch(`${API_BASE}/api/auth/isTrusted`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: e }),
        });
        if (!resp.ok) throw new Error('trust check failed');
        const data = await resp.json();
        setIsTrusted(!!data?.isTrusted);
      } catch {
        setIsTrusted(false);
      } finally {
        setTrustLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInstructorView, user?.email]);

  // Debounced suggestions fetch for quiz name (only when no selection is active)
  React.useEffect(() => {
    const q = quizNameInput.trim();
    // If a selection exists, do not fetch or mutate suggestions
    if (selectedQuizId != null) return;
    setSuggestions([]);
    if (q.length < 2) return;
    setSuggestLoading(true);
    if (suggestAbortRef.current) suggestAbortRef.current.abort();
    const controller = new AbortController();
    suggestAbortRef.current = controller;
    const t = setTimeout(async () => {
      try {
        const resp = await fetch(`${API_BASE}/api/quizzes/suggest?query=${encodeURIComponent(q)}`, { signal: controller.signal });
        if (!resp.ok) throw new Error("Suggest failed");
        const data = await resp.json();
        setSuggestions(Array.isArray(data?.quizzes) ? data.quizzes.slice(0, 10) : []);
      } catch (_) {
        // ignore
      } finally {
        setSuggestLoading(false);
      }
    }, 300);
    return () => { clearTimeout(t); controller.abort(); };
  }, [quizNameInput, selectedQuizId]);

  const fmtDT = (s: string | null) => {
    if (!s) return "—";
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(d);
  };

  // Latex utils (mirrors Screen3): split into inline/block/text and render with KaTeX
  type LatexSegment = { type: 'inline' | 'block' | 'text'; content: string };
  const parseLatexSegments = (text: string): LatexSegment[] => {
    const regex = /(\$\$[^$]+?\$\$|\$[^$]+\$|\\\([\s\S]+?\\\)|\\\[[\s\S]+?\\\])/g;
    let lastIndex = 0;
    const segments: LatexSegment[] = [];
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) segments.push({ type: 'text', content: text.slice(lastIndex, match.index) });
      const m = match[0];
      if (m.startsWith('$$') && m.endsWith('$$')) segments.push({ type: 'block', content: m.slice(2, -2) });
      else if (m.startsWith('\\[') && m.endsWith('\\]')) segments.push({ type: 'block', content: m.slice(2, -2) });
      else if (m.startsWith('$') && m.endsWith('$')) segments.push({ type: 'inline', content: m.slice(1, -1) });
      else if (m.startsWith('\\(') && m.endsWith('\\)')) segments.push({ type: 'inline', content: m.slice(2, -2) });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) segments.push({ type: 'text', content: text.slice(lastIndex) });
    return segments;
  };

  const LatexInline: React.FC<{ text: string }> = ({ text }) => {
    const segments = parseLatexSegments(text || '');
    return (
      <span className="inline">
        {segments.map((seg, i) => {
          if (seg.type === 'inline') return <InlineMath key={i}>{seg.content}</InlineMath>;
          if (seg.type === 'block') return <BlockMath key={i}>{seg.content}</BlockMath>;
          return seg.content.split(/\n/).map((line, j, arr) => (
            <span key={`${i}-${j}`}>
              {line}
              {j < arr.length - 1 ? <br /> : null}
            </span>
          ));
        })}
      </span>
    );
  };

  // Auth handlers
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!loginEmail || !loginPassword) return;
    setAuthLoading(true);
    try {
      if (isSignUp) {
        const cred = await createUserWithEmailAndPassword(auth, loginEmail, loginPassword);
        try { await sendEmailVerification(cred.user); } catch {}
        setVerifyEmailAddress(loginEmail);
        setShowVerifyDialog(true);
        try { await signOut(auth); } catch {}
      } else {
        await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
        // If password provider and not verified, resend and gate with modal
        const u = auth.currentUser;
        if (u) {
          const providerId = u.providerData[0]?.providerId;
          try { await u.reload(); } catch {}
          if (providerId === 'password' && !u.emailVerified) {
            try { await sendEmailVerification(u); } catch {}
            setVerifyEmailAddress(loginEmail);
            setShowVerifyDialog(true);
            try { await signOut(auth); } catch {}
          }
        }
      }
    } catch (err: any) {
      setAuthError(err?.message || "Login failed");
    } finally {
      setAuthLoading(false);
    }
  };

  // Resend verification: sign in temporarily, send, sign out
  const handleResendVerification = async () => {
    if (!verifyEmailAddress || !loginPassword) {
      toast({ title: 'Missing information', description: 'Enter your email and password to resend the verification link.', variant: 'destructive' });
      return;
    }
    setAuthLoading(true);
    try {
      await signInWithEmailAndPassword(auth, verifyEmailAddress, loginPassword);
      if (auth.currentUser) {
        try { await sendEmailVerification(auth.currentUser); } catch {}
      }
      toast({ title: 'Verification email sent', description: 'Check your inbox and spam folder.' });
    } catch (e: any) {
      toast({ title: 'Failed to resend', description: e?.message || 'Please try again later.', variant: 'destructive' });
    } finally {
      try { await signOut(auth); } catch {}
      setAuthLoading(false);
    }
  };

  // I've verified: sign in, reload, if verified keep logged in and refresh current results route
  const handleIHaveVerified = async () => {
    if (!verifyEmailAddress || !loginPassword) {
      toast({ title: 'Missing information', description: 'Enter your email and password to continue.', variant: 'destructive' });
      return;
    }
    setAuthLoading(true);
    let success = false;
    try {
      await signInWithEmailAndPassword(auth, verifyEmailAddress, loginPassword);
      if (auth.currentUser) {
        try { await auth.currentUser.reload(); } catch {}
        if (auth.currentUser.emailVerified) {
          success = true;
          setShowVerifyDialog(false);
          // Redirect back to this results screen
          navigate(window.location.pathname, { replace: true });
          return;
        }
      }
      toast({ title: 'Still not verified', description: 'We could not confirm verification yet. Please check your inbox and try again.' });
    } catch (e: any) {
      toast({ title: 'Sign-in failed', description: e?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      if (!success) {
        try { await signOut(auth); } catch {}
      }
      setAuthLoading(false);
    }
  };
  const handleForgot = async () => {
    setAuthError(null);
    if (!loginEmail) {
      setAuthError("Enter your email to reset password");
      return;
    }
    setAuthLoading(true);
    try {
      await sendPasswordResetEmail(auth, loginEmail);
      setAuthError("Password reset email sent");
    } catch (err: any) {
      setAuthError(err?.message || "Failed to send reset email");
    } finally {
      setAuthLoading(false);
    }
  };
  const handleGoogle = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setAuthError(err?.message || "Google sign-in failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      // no-op; you may add toast later
    }
  };

  const computeEarned = (q: DetailDTO["questions"][number]) => {
    const points = q.points ?? 1;
    const correct = new Set(q.correctOptionIds);
    const selected = new Set(q.selectedOptionIds);
    // any wrong selected => 0
    for (const id of selected) {
      if (!correct.has(id)) return 0;
    }
    const n = correct.size || 1;
    let x = 0;
    for (const id of selected) if (correct.has(id)) x++;
    // round to 2 decimals to preserve values like 0.75, 0.25
    return Math.round((points * (x / n)) * 100) / 100;
  };

  const doSearch = async () => {
    setError(null);
    setSearchLoading(true);
    setResults([]);
    setDetail(null);
    setSelectedAttemptId(null);
    try {
      if (!isInstructorView) {
        const resp = await fetch(`${API_BASE}/api/results/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enrollmentNumber: enrollmentNumber.trim(), email: email.trim() }),
        });
        if (!resp.ok) throw new Error(`Search failed (${resp.status})`);
        const data = await resp.json();
        setResults(Array.isArray(data?.results) ? data.results : []);
      } else {
        // Instructor search by quiz (selection is compulsory)
        if (selectedQuizId == null) {
          throw new Error('Please select a quiz from suggestions.');
        }
        const payload: any = { quizId: selectedQuizId };
        // Always include email (backend uses it to bypass when trusted)
        if (email?.trim()) payload.email = email.trim();
        if (!isTrusted) payload.password = quizPassword.trim();
        const resp = await fetch(`${API_BASE}/api/results/searchByQuiz`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!resp.ok) {
          const txt = await resp.text();
          try { const j = JSON.parse(txt); throw new Error(j?.error || `Search failed (${resp.status})`); } catch { throw new Error(`Search failed (${resp.status})`); }
        }
        const data = await resp.json();
        setResults(Array.isArray(data?.results) ? data.results : []);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to search");
    } finally {
      setSearchLoading(false);
    }
  };

  const viewDetail = async (attemptId: number) => {
    setSelectedAttemptId(attemptId);
    setDetail(null);
    setDetailError(null);
    setDetailLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/results/${attemptId}`);
      if (!resp.ok) throw new Error(`Fetch detail failed: ${resp.status}`);
      const data = await resp.json();
      setDetail(data);
    } catch (e: any) {
      setDetailError(e?.message || "Failed to load result");
    } finally {
      setDetailLoading(false);
    }
  };

  // KaTeX is synchronous; no MathJax typesetting needed

  // Auto-scroll to the detailed section when it becomes available
  React.useEffect(() => {
    if (selectedAttemptId !== null && (detail || detailLoading)) {
      // scroll once the section is on the page
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedAttemptId, detail, detailLoading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div onMouseMove={handleMouseMove} className={`relative min-h-screen transition-colors duration-700 ${themes[theme].rootBg} text-white`}>
      {/* Themed background layers at z-0 */}
      <div className="pointer-events-none select-none fixed inset-0 z-0">
        <div className="absolute inset-0">
          {!reduceMotion && (
            <div
              className="absolute inset-0 opacity-30 mix-blend-screen animate-[spin_60s_linear_infinite]"
              style={{
                background:
                  'conic-gradient(from_180deg_at_50%_50%, rgba(99,102,241,0.15), rgba(34,211,238,0.12), rgba(244,63,94,0.12), rgba(99,102,241,0.15))',
              }}
            />
          )}
          <div
            className="absolute inset-0 opacity-15"
            style={{
              background:
                'repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 24px), repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 24px)',
            }}
          />
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '22px 22px' }}
          />
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse_at_center, rgba(0,0,0,0.35), transparent_60%)' }} />
          {!reduceMotion && (
            <>
              <div
                className="absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full blur-3xl"
                style={{
                  background: 'radial-gradient(circle_at_30%_30%, rgba(99,102,241,0.35), transparent_60%)',
                  transform: `translate3d(${mx * 40}px, ${my * 40}px, 0)`,
                  transition: 'transform 0.25s ease-out',
                }}
              />
              <div
                className="absolute -bottom-24 -right-24 w-[30rem] h-[30rem] rounded-full blur-3xl"
                style={{
                  background: 'radial-gradient(circle_at_70%_70%, rgba(34,211,238,0.35), transparent_60%)',
                  transform: `translate3d(${mx * -48}px, ${my * -48}px, 0)`,
                  transition: 'transform 0.25s ease-out',
                }}
              />
            </>
          )}
          {/* Theme overlay */}
          {themes[theme].renderOverlay({ mx, my, reduceMotion })}
        </div>
      </div>
      {/* Header (theme-aware) */}
      <div className={`${themes[theme].header} fixed top-0 left-0 w-full z-40 transition-all duration-700`}>
        <div className="container flex flex-col justify-center px-4">
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-3 cursor-pointer h-full">
              <img
                src={isDark ? "/logo1dark.png" : "/logo1light.png"}
                alt="PrashnaSetu Logo"
                className="h-[90%] w-auto object-contain"
              />
            </Link>
            <div className="flex items-center gap-4">
              {user && (
                <div className={`hidden md:flex items-center text-right mr-2 ${themes[theme].headerText}`}>
                  <div className="text-sm font-semibold">Welcome {user.displayName || user.email}</div>
                </div>
              )}
              {/* Toggle button: to the right of Welcome */}
              <button
                onClick={() => setIsInstructorView(v => !v)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-100 text-amber-800 font-semibold shadow hover:bg-amber-200 focus:ring-2 focus:ring-amber-300 border border-amber-200 transition"
                title={isInstructorView ? 'Switch to Student View' : 'Switch to Instructor View'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12M8 7l3-3m-3 3l3 3M16 17H4m12 0l-3-3m3 3l-3 3" />
                </svg>
                {isInstructorView ? 'Switch to Student View' : 'Switch to Instructor View'}
              </button>
              {/* Contact Us removed for View Results header */}
              <Link to="/">
                <button className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow focus-visible:ring-2 border transition ${btnNeutral}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9.75l9-6.75 9 6.75V20a2 2 0 0 1-2 2h-4.5v-6h-5V22H5a2 2 0 0 1-2-2V9.75" />
                  </svg>
                  Home
                </button>
              </Link>
              <motion.button
                whileTap={reduceMotion ? undefined : { scale: 0.95 }}
                onClick={() => setTheme(targetTheme)}
                aria-label={targetLabel}
                className={`flex items-center justify-center px-3 py-2 rounded-lg font-semibold shadow focus-visible:ring-2 border transition cursor-pointer select-none ${btnNeutral}`}
              >
                <AnimatePresence initial={false} mode="wait">
                  {targetTheme === 'solarizedDuo' ? (
                    <motion.span key="sun" initial={reduceMotion ? { opacity: 1 } : { opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, rotate: 90 }} transition={{ duration: reduceMotion ? 0 : 0.5, ease: 'easeOut' }} className="flex">
                      <Sun className="w-5 h-5" />
                    </motion.span>
                  ) : (
                    <motion.span key="moon" initial={reduceMotion ? { opacity: 1 } : { opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, rotate: 90 }} transition={{ duration: reduceMotion ? 0 : 0.5, ease: 'easeOut' }} className="flex">
                      <Moon className="w-5 h-5" />
                    </motion.span>
                  )}
                </AnimatePresence>
                <span className="sr-only">{targetLabel}</span>
              </motion.button>
              {user && (
                <button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-100 text-rose-700 font-semibold shadow hover:bg-rose-200 focus:ring-2 focus:ring-rose-300 border border-rose-200 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H3m12 0l-4-4m4 4l-4 4m6-10V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2v-2"/></svg>
                  Logout
                </button>
              )}
            </div>
          </div>

          {/* Mobile Header */}
          <div className="md:hidden py-3">
            <div className="flex items-center justify-between mb-2 h-16">
              <Link to="/" className="flex items-center gap-2 cursor-pointer h-full">
                <img
                  src={isDark ? "/logo1dark.png" : "/logo1light.png"}
                  alt="PrashnaSetu Logo"
                  className="h-[90%] w-auto object-contain"
                />
              </Link>
            </div>
            <div className="flex items-center gap-2 mt-2">
              {user && (
                <div className={`flex-1 text-right ${themes[theme].headerText}`}>
                  <div className="text-sm font-semibold">Welcome {user.displayName || user.email}</div>
                </div>
              )}
              <button
                onClick={() => setIsInstructorView(v => !v)}
                className="px-3 py-1 rounded bg-amber-100 text-amber-800 font-medium border border-amber-200 flex items-center gap-2"
                title={isInstructorView ? 'Switch to Student View' : 'Switch to Instructor View'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12M8 7l3-3m-3 3l3 3M16 17H4m12 0l-3-3m3 3l-3 3" />
                </svg>
                {isInstructorView ? 'Switch to Student View' : 'Switch to Instructor View'}
              </button>
              {/* Contact Us removed for View Results header (mobile) */}
              <Link to="/">
                <button className={`px-3 py-1 rounded font-medium border flex items-center gap-1 ${btnNeutral}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9.75l9-6.75 9 6.75V20a2 2 0 0 1-2 2h-4.5v-6h-5V22H5a2 2 0 0 1-2-2V9.75" />
                  </svg>
                  Home
                </button>
              </Link>
              <motion.button
                whileTap={reduceMotion ? undefined : { scale: 0.95 }}
                onClick={() => setTheme(targetTheme)}
                aria-label={targetLabel}
                className={`px-3 py-1 rounded font-medium border ${btnNeutral}`}
              >
                <AnimatePresence initial={false} mode="wait">
                  {targetTheme === 'solarizedDuo' ? (
                    <motion.span key="sun" initial={reduceMotion ? { opacity: 1 } : { opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, rotate: 90 }} transition={{ duration: reduceMotion ? 0 : 0.5, ease: 'easeOut' }} className="flex">
                      <Sun className="w-4 h-4" />
                    </motion.span>
                  ) : (
                    <motion.span key="moon" initial={reduceMotion ? { opacity: 1 } : { opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, rotate: 90 }} transition={{ duration: reduceMotion ? 0 : 0.5, ease: 'easeOut' }} className="flex">
                      <Moon className="w-4 h-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
                <span className="sr-only">{targetLabel}</span>
              </motion.button>
          </div>
        </div>
      </div>
    </div>

    {/* Content */}
    <div className="container mx-auto px-4 pt-24 pb-28 relative z-10">
      <br></br>        <br></br>
      <br></br>

      <div className="max-w-5xl mx-auto bg-white/80 text-black rounded-2xl shadow-xl border border-indigo-200/60 px-6 py-12">
        <h1 className="text-2xl font-bold mb-4">View Results</h1>
        {!user ? (
          <div className="py-6">
            <div className="text-center text-gray-900 font-semibold mb-4">Login first to access results</div>
            <div className="max-w-md mx-auto">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 0l8 6 8-6"/></svg>
                    <input
                      className="w-full h-10 rounded-lg border border-gray-300 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                      type="email"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      placeholder="Email address"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V8a4.5 4.5 0 10-9 0v2.5" />
                      <rect x="5" y="10.5" width="14" height="9" rx="2" ry="2" fill="#ffffff" stroke="#E53935" strokeWidth="1.5"/>
                    </svg>
                    <input
                      className="w-full h-10 rounded-lg border border-gray-300 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                      type="password"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder="Password"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full h-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow disabled:opacity-50"
                >
                  {authLoading ? (isSignUp ? 'Creating account...' : 'Signing in...') : (isSignUp ? 'Create Account' : 'Sign In')}
                </button>
              </form>

                <div className="my-4 border-t border-gray-200" />

                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={authLoading}
                  className="w-full h-10 rounded-lg bg-white text-gray-800 font-semibold border border-gray-300 hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 31.7 29.5 35 24 35 16.8 35 11 29.2 11 22s5.8-13 13-13c3.3 0 6.3 1.2 8.6 3.3l5.7-5.7C34.9 3.3 29.7 1 24 1 11.8 1 2 10.8 2 23s9.8 22 22 22c12.1 0 21-8.6 21-21 0-1.3-.1-2.7-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16.3 18.9 13 24 13c3.3 0 6.3 1.2 8.6 3.3l5.7-5.7C34.9 3.3 29.7 1 24 1 16 1 8.8 5.9 6.3 14.7z"/><path fill="#4CAF50" d="M24 45c5.4 0 10.3-1.8 14.1-4.9l-6.5-5.3C29.7 36.3 27 37 24 37c-5.5 0-10.2-3.6-12.1-8.6l-6.6 5.1C8.8 41.6 15.9 45 24 45z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.7 3.2-6.1 6.5-11.3 6.5-7.2 0-13-5.8-13-13 0-2 .5-3.9 1.3-5.6l-6.7-5.1C3.7 13.3 2 17.5 2 22c0 12.2 9.8 22 22 22 12.1 0 21-8.6 21-21 0-1.3-.1-2.7-.4-3.5z"/></svg>
                  Continue with Google
                </button>

                <div className="text-center mt-4 space-y-2">
                  <div>
                    <button
                      type="button"
                      className="text-sm text-indigo-700 underline hover:text-indigo-800"
                      onClick={() => setIsSignUp(s => !s)}
                    >
                      {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create account"}
                    </button>
                  </div>
                  {!isSignUp && (
                    <div>
                      <button type="button" onClick={handleForgot} className="text-sm underline hover:text-indigo-700">Forgot password?</button>
                    </div>
                  )}
                </div>

                {authError && (
                  <div className="mt-4 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg px-3 py-2">
                    {authError}
                  </div>
                )}
              </div>
              {/* Verification Modal */}
              <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Verify your email</DialogTitle>
                    <DialogDescription>
                      We sent a verification link to <span className="font-medium">{verifyEmailAddress}</span>. Please click the link in your inbox to activate your account.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      Tip: Check your Spam/Junk folder if you don’t see the email within a minute.
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Button asChild variant="outline" size="sm">
                        <a href="https://mail.google.com" target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4"><rect x="2" y="5" width="20" height="14" rx="2" ry="2" fill="#ffffff" stroke="#E53935" strokeWidth="1.5"/><path d="M3 7l9 6 9-6" fill="none" stroke="#E53935" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 18V8l8 5 8-5v10" fill="none" stroke="#D32F2F" strokeWidth="1.2" strokeLinejoin="round"/></svg>
                          Gmail
                        </a>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <a href="https://outlook.live.com/mail/0/" target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4"><path fill="#0364B8" d="M45,12.7v22.6c0,1.3-0.9,2.4-2.2,2.7l-19.9,4c-0.8,0.2-1.6-0.4-1.6-1.3V7.3c0-0.9,0.8-1.5,1.6-1.3l19.9,4 C44.1,10.3,45,11.4,45,12.7z"/><path fill="#28A8EA" d="M23.3 6l10.7 2.2v31.6L23.3 42z"/><path fill="#0078D4" d="M3 14c0-1.1.9-2 2-2h17v24H5c-1.1 0-2-.9-2-2V14z"/><path fill="#50D9FF" d="M12 30c4.4 0 8-3.6 8-8s-3.6-8-8-8-8 3.6-8 8 3.6 8 8 8z"/></svg>
                          Outlook
                        </a>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <a href="https://mail.yahoo.com" target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4"><rect x="2" y="3" width="20" height="18" rx="4" fill="#5F01D1"/><path d="M7 7l3 5v4h2v-4l3-5h-2.2L12 10.6 9.2 7H7z" fill="#ffffff"/><rect x="16.5" y="13.7" width="1.8" height="3.8" rx="0.9" fill="#ffffff"/></svg>
                          Yahoo
                        </a>
                      </Button>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <Button variant="outline" onClick={handleResendVerification} disabled={authLoading}>Resend verification link</Button>
                      <div className="space-x-2">
                        <Button variant="secondary" onClick={handleIHaveVerified} disabled={authLoading}>I've verified</Button>
                        <Button onClick={() => setShowVerifyDialog(false)} disabled={authLoading}>Close</Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
          <div className="space-y-4">
            {!isInstructorView ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Enrollment Number</label>
                  <input
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                    value={enrollmentNumber}
                    onChange={e => setEnrollmentNumber(e.target.value)}
                    placeholder="e.g. 415874"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none bg-gray-100 text-gray-700"
                    value={email}
                    readOnly
                    placeholder="e.g. student@example.com"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="relative">
                  <label className="block text-sm font-medium mb-1">Quiz Name</label>
                  <input
                    className={`w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none ${selectedQuizId == null ? 'focus:ring-2 focus:ring-indigo-400 bg-white' : 'bg-gray-100 text-gray-700 cursor-not-allowed pr-24'}`}
                    value={quizNameInput}
                    onChange={e => setQuizNameInput(e.target.value)}
                    readOnly={selectedQuizId != null}
                    placeholder="Type to search quiz by name"
                  />
                  {selectedQuizId != null && (
                    <button
                      type="button"
                      onClick={() => { setSelectedQuizId(null); setQuizNameInput(''); setSuggestions([]); }}
                      className="absolute inset-y-0 my-auto right-2 h-8 px-2.5 flex items-center gap-1 rounded-full bg-gray-200 hover:bg-gray-300 border border-gray-300 text-gray-700 shadow-sm translate-y-[10px]"
                      title="Clear selection"
                      aria-label="Clear selected quiz"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                        <path fillRule="evenodd" d="M10 8.586L5.707 4.293a1 1 0 10-1.414 1.414L8.586 10l-4.293 4.293a1 1 0 101.414 1.414L10 11.414l4.293 4.293a1 1 0 001.414-1.414L11.414 10l4.293-4.293a1 1 0 00-1.414-1.414L10 8.586z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-medium">Clear</span>
                    </button>
                  )}
                  {suggestLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">...</div>
                  )}
                  {selectedQuizId == null && suggestions.length > 0 && quizNameInput.trim().length >= 2 && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow">
                      {suggestions.map(s => (
                        <button
                          key={s.quizId}
                          type="button"
                          onClick={() => { setSelectedQuizId(s.quizId); setQuizNameInput(`${s.quizName} (${s.quizCode})`); setSuggestions([]); }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50"
                        >
                          <span className="font-medium">{s.quizName}</span> <span className="text-gray-500">({s.quizCode})</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedQuizId == null && quizNameInput.trim().length >= 2 && !suggestLoading && (
                    <div className="text-xs text-amber-700 mt-1">Please select a quiz from the suggestions list.</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white tracking-widest uppercase"
                    value={quizPassword}
                    onChange={e => {
                      const v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
                      setQuizPassword(v);
                    }}
                    placeholder="Enter 6-char password"
                  />
                  <div className="text-xs text-gray-600 mt-1">
                    Password is not required for users logged in with an email registered on PrashnaSetu Application
                    {trustLoading && <span className="ml-2 text-gray-400">(checking…)</span>}
                    {(!trustLoading && isTrusted) && <span className="ml-2 text-emerald-700 font-medium">Trusted</span>}
                  </div>
                </div>
              </>
            )}
            <div>
              <button
                onClick={doSearch}
                disabled={
                  searchLoading ||
                  (!isInstructorView && (!enrollmentNumber.trim() || !email.trim())) ||
                  (isInstructorView && (selectedQuizId == null || (!isTrusted && quizPassword.trim().length !== 6)))
                }
                className="w-full h-10 rounded-lg bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {searchLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
          )}

          {error && (
            <div className="mt-4 text-red-700 bg-red-100 border border-red-200 rounded-lg px-3 py-2">{error}</div>
          )}

          {/* Results list */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold">{isInstructorView ? 'Student Attempts' : 'Your Attempts'}</h2>
            {results.length === 0 && !searchLoading && (
              <div className="text-sm text-gray-700 mt-2">No attempts found. Check your inputs.</div>
            )}
            {results.length > 0 && (
              <div className="mt-3 overflow-x-auto">
                {isInstructorView && (
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                    <input
                      className="h-8 rounded border border-gray-300 px-2"
                      placeholder="Filter Name"
                      value={instFilters.name}
                      onChange={e => setInstFilters(s => ({ ...s, name: e.target.value }))}
                    />
                    <input
                      className="h-8 rounded border border-gray-300 px-2"
                      placeholder="Filter Email"
                      value={instFilters.email}
                      onChange={e => setInstFilters(s => ({ ...s, email: e.target.value }))}
                    />
                    <input
                      className="h-8 rounded border border-gray-300 px-2"
                      placeholder="Filter Enrollment"
                      value={instFilters.enrollment}
                      onChange={e => setInstFilters(s => ({ ...s, enrollment: e.target.value }))}
                    />
                    <button
                      type="button"
                      onClick={() => setInstFilters({ name: '', email: '', enrollment: '' })}
                      className="h-8 px-3 rounded bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200"
                      title="Clear filters"
                    >
                      Clear
                    </button>
                    <div className="ml-auto flex items-center gap-2">
                      <label className="text-gray-600">Sort by:</label>
                      <select
                        className="h-8 rounded border border-gray-300 px-2 bg-white"
                        value={sortBy ?? ''}
                        onChange={e => setSortBy((e.target.value || null) as any)}
                      >
                        <option value="">None</option>
                        <option value="enrollment">Enrollment Number</option>
                        <option value="name">Name</option>
                        <option value="email">Email</option>
                        <option value="marks">Marks</option>
                        <option value="start">Start Time</option>
                        <option value="end">End Time</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))}
                        className="h-8 px-3 rounded bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200"
                        title="Toggle ascending/descending"
                      >
                        {sortDir === 'asc' ? 'Asc ▲' : 'Desc ▼'}
                      </button>
                    </div>
                  </div>
                )}
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600">
                      <th className="p-2 w-12">#</th>
                      <th className="p-2">
                        {isInstructorView ? (
                          <button onClick={() => toggleSort('quiz')} className="flex items-center gap-1">
                            Quiz {sortBy === 'quiz' && (<span>{sortDir === 'asc' ? '▲' : '▼'}</span>)}
                          </button>
                        ) : 'Quiz'}
                      </th>
                      <th className="p-2">
                        {isInstructorView ? (
                          <button onClick={() => toggleSort('subject')} className="flex items-center gap-1">
                            Subject {sortBy === 'subject' && (<span>{sortDir === 'asc' ? '▲' : '▼'}</span>)}
                          </button>
                        ) : 'Subject'}
                      </th>
                      {isInstructorView && (
                        <>
                          <th className="p-2">
                            <button onClick={() => toggleSort('name')} className="flex items-center gap-1">
                              Name {sortBy === 'name' && (<span>{sortDir === 'asc' ? '▲' : '▼'}</span>)}
                            </button>
                          </th>
                          <th className="p-2">
                            <button onClick={() => toggleSort('email')} className="flex items-center gap-1">
                              Email {sortBy === 'email' && (<span>{sortDir === 'asc' ? '▲' : '▼'}</span>)}
                            </button>
                          </th>
                          <th className="p-2">
                            <button onClick={() => toggleSort('enrollment')} className="flex items-center gap-1">
                              Enrollment {sortBy === 'enrollment' && (<span>{sortDir === 'asc' ? '▲' : '▼'}</span>)}
                            </button>
                          </th>
                        </>
                      )}
                      <th className="p-2">
                        {isInstructorView ? (
                          <button onClick={() => toggleSort('marks')} className="flex items-center gap-1">
                            Marks {sortBy === 'marks' && (<span>{sortDir === 'asc' ? '▲' : '▼'}</span>)}
                          </button>
                        ) : 'Marks'}
                      </th>
                      <th className="p-2">
                        {isInstructorView ? (
                          <button onClick={() => toggleSort('duration')} className="flex items-center gap-1">
                            Duration {sortBy === 'duration' && (<span>{sortDir === 'asc' ? '▲' : '▼'}</span>)}
                          </button>
                        ) : 'Duration'}
                      </th>
                      <th className="p-2">
                        {isInstructorView ? (
                          <button onClick={() => toggleSort('start')} className="flex items-center gap-1">
                            Start {sortBy === 'start' && (<span>{sortDir === 'asc' ? '▲' : '▼'}</span>)}
                          </button>
                        ) : 'Start'}
                      </th>
                      <th className="p-2">
                        {isInstructorView ? (
                          <button onClick={() => toggleSort('end')} className="flex items-center gap-1">
                            End {sortBy === 'end' && (<span>{sortDir === 'asc' ? '▲' : '▼'}</span>)}
                          </button>
                        ) : 'End'}
                      </th>
                      <th className="p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedResults.map((r, i) => (
                      <tr key={`${r.attemptId}`} className="border-t border-gray-200">
                        <td className="p-2 w-12 text-gray-500">{i + 1}</td>
                        <td className="p-2">
                          <div className="font-medium">{r.quizName || '—'}{r.quizCode ? ` (${r.quizCode})` : ''}</div>
                        </td>
                        <td className="p-2">{r.subject || '—'}</td>
                        {isInstructorView && (
                          <>
                            <td className="p-2 text-sm font-medium text-gray-900">{r.studentName || '—'}</td>
                            <td className="p-2 text-xs text-gray-700">{r.studentEmail || '—'}</td>
                            <td className="p-2 text-xs text-gray-700">{r.enrollmentNumber || '—'}</td>
                          </>
                        )}
                        <td className="p-2">{r.marksObtained} / {r.numDisplayedQuestions ?? '—'}</td>
                        <td className="p-2">{r.durationMinutes ?? '—'} min</td>
                        <td className="p-2">{fmtDT(r.startTime)}</td>
                        <td className="p-2">{fmtDT(r.endTime)}</td>
                        <td className="p-2">
                          <button
                            onClick={() => viewDetail(r.attemptId)}
                            className="px-3 py-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Detail section */}
          {selectedAttemptId !== null && (
            <div ref={detailRef} className="mt-8 scroll-mt-28">
              <h2 className="text-lg font-semibold mb-2">Detailed Result</h2>
              {detailLoading && <div className="text-sm text-gray-700">Loading result...</div>}
              {detailError && <div className="text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg px-3 py-2">{detailError}</div>}
              {detail && (
                <div>
                  {/* Summary */}
                  <div className="rounded-xl border border-indigo-200/60 bg-white/70 px-4 py-6">
                    <div className="font-semibold text-black">{detail.summary.quizName} {detail.summary.quizCode ? `(${detail.summary.quizCode})` : ''}</div>
                    <div className="text-sm text-gray-700">
                      <div>Subject: {detail.summary.subject} {detail.summary.subjectCode ? `(${detail.summary.subjectCode})` : ''}</div>
                      <div>Program: {detail.summary.course} | Instructor: {detail.summary.instructorName}</div>
                      <div>Student: {detail.summary.student.name} ({detail.summary.student.enrollmentNumber})</div>
                      <div>Email: {detail.summary.student.email} | Section: {detail.summary.student.section}</div>
                      <div>Start: {fmtDT(detail.summary.timing.startTime)} | End: {fmtDT(detail.summary.timing.endTime)} | Duration: {detail.summary.timing.durationMinutes} min</div>
                      <div>Score: {detail.summary.scoring.marksObtained} / {detail.summary.numDisplayedQuestions ?? '—'} {detail.summary.scoring.percentage !== null ? `(${detail.summary.scoring.percentage}%)` : ''}</div>
                      {(
                        detail.summary.scoring.easyCorrect != null ||
                        detail.summary.scoring.mediumCorrect != null ||
                        detail.summary.scoring.highCorrect != null
                      ) && (
                        <div className="mt-1">
                          <span className="font-medium">Difficulty-wise:</span>{' '}
                          {detail.summary.scoring.easyCorrect != null && (
                            <span className="mr-3">Easy: {detail.summary.scoring.easyCorrect} / {detail.summary.scoring.easyTotal ?? '—'}</span>
                          )}
                          {detail.summary.scoring.mediumCorrect != null && (
                            <span className="mr-3">Medium: {detail.summary.scoring.mediumCorrect} / {detail.summary.scoring.mediumTotal ?? '—'}</span>
                          )}
                          {detail.summary.scoring.highCorrect != null && (
                            <span>High: {detail.summary.scoring.highCorrect} / {detail.summary.scoring.highTotal ?? '—'}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Questions or Publication Notice */}
                  {!isInstructorView && detail.summary.meta?.showDetailedResult === false ? (
                    <div className="mt-6 text-sm text-rose-800 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                      Detailed result has not been published. Please contact Instructor.
                    </div>
                  ) : (
                    <div className="mt-6 space-y-4">
                      {detail.questions.map(q => (
                        <div key={q.questionId} className={`rounded-xl border p-4 ${q.isCorrect ? 'border-emerald-300 bg-emerald-50/70' : 'border-rose-300 bg-rose-50/70'}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="font-medium text-black">Q{q.index}. <LatexInline text={q.questionText} /></div>
                            {(() => {
                              const earned = computeEarned(q);
                              const isCorrect = earned > 0;
                              const textColor = isCorrect ? 'text-emerald-800' : 'text-rose-800';
                              const bgColor = isCorrect ? 'bg-emerald-200' : 'bg-rose-200';
                              const borderColor = isCorrect ? 'border-emerald-300' : 'border-rose-300';
                              return (
                                <div className="flex flex-col items-center gap-1">
                                  <span className={`text-xs px-2 py-0.5 rounded-full border ${bgColor} ${textColor} ${borderColor}`}>
                                    {earned.toFixed(2)}
                                  </span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full border ${bgColor} ${textColor} ${borderColor}`}>
                                    {isCorrect ? 'Correct' : 'Incorrect'}
                                  </span>
                                </div>
                              );
                            })()}
                          </div>
                          <div className="text-xs text-gray-700 mt-1 hidden">Points: {q.points ?? 1}</div>
                          <div className="text-xs text-gray-700 mt-0.5">Course Outcome and Bloom's Taxonomy: {q.topic || '—'}</div>
                          <div className="text-xs text-gray-700 mt-0.5">Topic: {q.subject || '—'}</div>
                          <div className="text-xs text-gray-700 mt-0.5">Difficulty: {q.difficulty || '—'}</div>
                          {q.imageUrl && (
                            <div className="mt-2">
                              <img src={q.imageUrl} alt="question" className="max-h-64 rounded-lg" />
                            </div>
                          )}
                          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                            {q.options.map(o => (
                              <div
                                key={o.id}
                                className={`px-3 py-2 rounded-lg border text-sm ${o.isCorrect ? 'border-emerald-400 bg-emerald-50' : o.isSelected ? 'border-rose-400 bg-rose-50' : 'border-gray-200 bg-white'}`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <LatexInline text={o.text} />
                                  <div className="flex items-center gap-1 text-xs">
                                    {o.isCorrect && (
                                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">Correct</span>
                                    )}
                                    {o.isSelected && (
                                      <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">Selected</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>        <br></br>
        <br></br>
      </div>

      {/* Cloned Footer */}
      <div className="hidden md:block fixed bottom-0 left-0 w-full bg-gradient-to-br from-white/70 to-indigo-50/60 backdrop-blur-xl border-t border-indigo-200/60 py-3 text-center text-xs text-gray-700 z-40 shadow-lg">
        <p>© Copyrighted by CAD-CS, BML Munjal University</p>
        <p className="flex items-center justify-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5A2.25 2.25 0 0 1 19.5 19.5h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-.96 1.85l-7.29 5.063a2.25 2.25 0 0 1-2.52 0L2.46 8.843a2.25 2.25 0 0 1-.96-1.85V6.75"/></svg><a href="mailto:cadcs@bmu.edu.in" className="underline hover:text-blue-700">cadcs@bmu.edu.in</a></p>
      </div>
      <div className="md:hidden text-center text-xs text-gray-700 mt-6 mb-2 bg-gradient-to-br from-white/70 to-indigo-50/60 backdrop-blur-xl py-3 border-t border-indigo-200/60 shadow">
        <p>© Copyrighted by CAD-CS, BML Munjal University</p>
        <p className="flex items-center justify-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5A2.25 2.25 0 0 1 19.5 19.5h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-.96 1.85l-7.29 5.063a2.25 2.25 0 0 1-2.52 0L2.46 8.843a2.25 2.25 0 0 1-.96-1.85V6.75"/></svg><a href="mailto:cadcs@bmu.edu.in" className="underline hover:text-blue-700">cadcs@bmu.edu.in</a></p>
      </div>
    </div>
  );
}
