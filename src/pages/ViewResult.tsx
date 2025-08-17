import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
// no header icons needed now
import { signInWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

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

  const [results, setResults] = React.useState<SearchResultItem[]>([]);
  const [selectedAttemptId, setSelectedAttemptId] = React.useState<number | null>(null);
  const [detail, setDetail] = React.useState<DetailDTO | null>(null);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [detailError, setDetailError] = React.useState<string | null>(null);

  // Inline auth form state (for unauthenticated users)
  const [loginEmail, setLoginEmail] = React.useState("");
  const [loginPassword, setLoginPassword] = React.useState("");
  const [authLoading, setAuthLoading] = React.useState(false);
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [isSignUp, setIsSignUp] = React.useState(false);

  // Header simplified: Home + Contact, logo/link to '/'

  React.useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  // Debounced suggestions fetch for quiz name
  React.useEffect(() => {
    const q = quizNameInput.trim();
    setSuggestions([]);
    setSelectedQuizId(null);
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
  }, [quizNameInput]);

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
            <React.Fragment key={`${i}-${j}`}>
              {line}
              {j < arr.length - 1 ? <br /> : null}
            </React.Fragment>
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
        await createUserWithEmailAndPassword(auth, loginEmail, loginPassword);
      } else {
        await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      }
    } catch (err: any) {
      setAuthError(err?.message || "Login failed");
    } finally {
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
        // Instructor search by quiz
        const payload: any = { password: quizPassword.trim() };
        if (selectedQuizId != null) payload.quizId = selectedQuizId;
        else payload.quizName = quizNameInput.trim();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-indigo-900 to-blue-950 text-white flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-indigo-900 to-blue-950 text-white">
      {/* Header (simplified per request) */}
      <div className="bg-gradient-to-br from-white/70 to-indigo-50/60 backdrop-blur-xl shadow-lg border-b border-indigo-200/60 fixed top-0 left-0 w-full z-40 transition-all duration-300">
        <div className="container flex flex-col justify-center px-4">
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-3 cursor-pointer">
              <img src="/logo2.png" alt="PrashnaSetu Logo" className="h-12 w-12 object-contain" />
              <div className="flex flex-col justify-center">
                <h1 className="text-lg font-semibold leading-tight text-black">PrashnaSetu</h1>
                <span className="text-xs text-black leading-tight">Think. Compete. Conquer.</span>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              {user && (
                <div className="hidden md:flex items-center text-right mr-2 text-black">
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
              <Link to="/credits">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-100 text-green-700 font-semibold shadow hover:bg-green-200 focus:ring-2 focus:ring-green-300 border border-green-200 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 8.5V18a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 18V8.5m18 0A2.5 2.5 0 0018.5 6h-13A2.5 2.5 0 003 8.5m18 0V6a2 2 0 00-2-2H5a2 2 0 00-2 2v2.5m18 0l-9 6.5-9-6.5" /></svg>
                  Contact Us
                </button>
              </Link>
              <Link to="/">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-100 text-indigo-700 font-semibold shadow hover:bg-indigo-200 focus:ring-2 focus:ring-indigo-300 border border-indigo-200 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9.75l9-6.75 9 6.75V20a2 2 0 0 1-2 2h-4.5v-6h-5V22H5a2 2 0 0 1-2-2V9.75" />
                  </svg>
                  Home
                </button>
              </Link>
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
            <div className="flex items-center justify-between mb-2">
              <Link to="/" className="flex items-center gap-2 cursor-pointer">
                <img src="/logo2.png" alt="PrashnaSetu Logo" className="h-8 w-8 object-contain" />
                <div className="flex flex-col">
                  <h1 className="text-sm font-semibold leading-tight text-black">PrashnaSetu</h1>
                  <span className="text-xs text-black leading-tight">Think. Compete. Conquer.</span>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-2 mt-2">
              {user && (
                <div className="flex-1 text-right text-black">
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
              <Link to="/credits">
                <button className="px-3 py-1 rounded bg-green-100 text-green-700 font-medium border border-green-200">Contact Us</button>
              </Link>
              <Link to="/">
                <button className="px-3 py-1 rounded bg-indigo-100 text-indigo-700 font-medium border border-indigo-200 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9.75l9-6.75 9 6.75V20a2 2 0 0 1-2 2h-4.5v-6h-5V22H5a2 2 0 0 1-2-2V9.75" />
                  </svg>
                  Home
                </button>
              </Link>
              {user && (
                <button onClick={handleSignOut} className="px-3 py-1 rounded bg-rose-100 text-rose-700 font-medium border border-rose-200">Logout</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-3xl mx-auto bg-white/80 text-black rounded-2xl shadow-xl border border-indigo-200/60 p-6">
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
                        <rect x="5" y="10.5" width="14" height="9" rx="2" ry="2" />
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
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                    value={quizNameInput}
                    onChange={e => setQuizNameInput(e.target.value)}
                    placeholder="Type to search quiz by name"
                  />
                  {suggestLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">...</div>
                  )}
                  {suggestions.length > 0 && quizNameInput.trim().length >= 2 && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow">
                      {suggestions.map(s => (
                        <button
                          key={s.quizId}
                          type="button"
                          onClick={() => { setSelectedQuizId(s.quizId); setQuizNameInput(s.quizName); setSuggestions([]); }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50"
                        >
                          <span className="font-medium">{s.quizName}</span> <span className="text-gray-500">({s.quizCode})</span>
                        </button>
                      ))}
                    </div>
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
                </div>
              </>
            )}
            <div>
              <button
                onClick={doSearch}
                disabled={searchLoading || (!isInstructorView && (!enrollmentNumber.trim() || !email.trim())) || (isInstructorView && ((!quizNameInput.trim() && selectedQuizId == null) || quizPassword.trim().length !== 6))}
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
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600">
                      <th className="p-2">Quiz</th>
                      <th className="p-2">Subject</th>
                      <th className="p-2">Marks</th>
                      <th className="p-2">Duration</th>
                      <th className="p-2">Start</th>
                      <th className="p-2">End</th>
                      <th className="p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map(r => (
                      <tr key={`${r.attemptId}`} className="border-t border-gray-200">
                        <td className="p-2">
                          <div className="font-medium">{r.quizName || '—'}{r.quizCode ? ` (${r.quizCode})` : ''}</div>
                        </td>
                        <td className="p-2">{r.subject || '—'}</td>
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
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-2">Detailed Result</h2>
              {detailLoading && <div className="text-sm text-gray-700">Loading result...</div>}
              {detailError && <div className="text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg px-3 py-2">{detailError}</div>}
              {detail && (
                <div>
                  {/* Summary */}
                  <div className="rounded-xl border border-indigo-200/60 bg-white/70 p-4">
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
                  {detail.summary.meta?.showDetailedResult === false ? (
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
        </div>
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
