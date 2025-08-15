import React, { useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, PlusCircle, PlayCircle, BarChart3, ShieldCheck, Brain, Eye, FileDown, Timer } from "lucide-react";
import VideoGallery from "./VideoGallery";

const faqs = [
  { q: "What is PrashnaSetu?", a: "PrashnaSetu is a modern, full-screen quiz app that presents randomized questions with images, and provides real-time monitoring to ensure academic integrity." },
  { q: "Can I import/export quizzes?", a: "Yes, you can import and export quizzes using ZIP files on the website. Only Instructors and Admin can import quizzes on the PrashnaSetu Application." },
  { q: "Who can create quizzes?", a: "All users can create quizzes." },
  { q: "Are there user manuals?", a: "Yes, you can view manuals for the Website as a whole or for the PrashnaSetu Application specified by roles: Students, Admins, Instructors, and Proctors." },
  { q: "Is my data secure?", a: "Yes, your data is securely stored and accessible only by you." },
  { q: "How do I contact support?", a: "Email us at cadcs@bmu.edu.in or harshit.soni.23cse@bmu.edu.in" },
  { q: "Does it support images?", a: "Yes, you can add images to your quiz questions." }
];

const manuals = [
  { label: "Student Manual", href: "/manuals/PrashnaSetu-Application-User-Guide_Student.pdf" },
  { label: "Admin Manual", href: "/manuals/PrashnaSetu-Application-User-Guide_Admin.pdf" },
  { label: "Instructor Manual", href: "/manuals/PrashnaSetu-Application-User-Guide_Instructor.pdf" },
  { label: "Proctor Manual", href: "/manuals/PrashnaSetu-Application-User-Guide_Proctor.pdf" },
  { label: "Website Manual", href: "/manuals/PrashnaSetu-Application-User-Guide_Website.pdf" },
];

const downloads = [
  { label: "Faculty Zip", href: "https://drive.google.com/file/d/1RfUKLSqFVVSjdgm3JXM0joZQBYS7bMQG/view" },
  { label: "Result Zip", href: "https://drive.google.com/file/d/1eOlyx08BCyI421qCoVurFUuSePAsRKk1/view" },
];

// Salient features to show as flip cards (with icons)
const features = [
  {
    title: "Multi-Role Access Control",
    desc: "Hierarchical user management with role-based permissions",
    icon: ShieldCheck,
  },
  {
    title: "Advanced Quiz Engine",
    desc: "Completely Offline support for various question types including images and mathematical expressions",
    icon: Brain,
  },
  {
    title: "Real-time Monitoring",
    desc: "Live surveillance capabilities for proctors during assessments",
    icon: Eye,
  },
  {
    title: "Performance Analytics",
    desc: "Detailed reporting and statistical analysis of student performance",
    icon: BarChart3,
  },
  {
    title: "Export Capabilities",
    desc: "Support for quiz analytics, and result export in multiple formats",
    icon: FileDown,
  },
  {
    title: "Academic Integrity Tools",
    desc: "Time allotment, randomized questions, and monitoring features",
    icon: Timer,
  },
];

function FeatureCard({ title, desc, px = 0, py = 0, icon: Icon }: { title: string; desc: string; px?: number; py?: number; icon?: React.ElementType }) {
  const [flipped, setFlipped] = useState(false);
  const hoverTimer = React.useRef<NodeJS.Timeout | null>(null);
  const flipBackTimer = React.useRef<NodeJS.Timeout | null>(null);

  const scheduleFlipBack = () => {
    if (flipBackTimer.current) clearTimeout(flipBackTimer.current);
    flipBackTimer.current = setTimeout(() => setFlipped(false), 3000);
  };

  const flipTo = (next: boolean) => {
    setFlipped(next);
    if (next) scheduleFlipBack();
    else if (flipBackTimer.current) clearTimeout(flipBackTimer.current);
  };

  const handleClick = () => {
    const next = !flipped;
    flipTo(next);
  };

  const handleMouseEnter = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => flipTo(true), 400);
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  };

  React.useEffect(() => {
    return () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
      if (flipBackTimer.current) clearTimeout(flipBackTimer.current);
    };
  }, []);

  return (
    <div
      className="group cursor-pointer select-none [perspective:1200px]"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="button"
      aria-pressed={flipped}
    >
      {/* Rotating card (entire card flips) with parallax */}
      <div
        className={"relative w-full h-60 transition-transform duration-500 ease-out [transform-style:preserve-3d]"}
        style={{ transform: `translate3d(${px * 16}px, ${py * 16}px, 0) rotateY(${flipped ? 180 : 0}deg)` }}
      >
        {/* Front Face (styled card) */}
        <div className="absolute inset-0 rounded-2xl border border-indigo-200/60 bg-gradient-to-br from-white/70 to-indigo-50/60 backdrop-blur-xl overflow-hidden shadow-md group-hover:shadow-2xl group-hover:-translate-y-1 group-hover:scale-[1.02] ring-0 group-hover:ring-2 group-hover:ring-indigo-400/70 transition-all duration-500 ease-out [backface-visibility:hidden]">
          <div className="absolute inset-0 opacity-30 pointer-events-none bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.15),_transparent_60%)]"></div>
          <div className="relative z-10 h-full w-full p-6 flex flex-col items-center justify-center text-center text-black">
            {Icon ? <Icon className="w-7 h-7 mb-2 text-indigo-600" /> : null}
            <div className="font-semibold">{title}</div>
          </div>
        </div>
        {/* Back Face */}
        <div className="absolute inset-0 rounded-2xl border border-indigo-300/60 bg-gradient-to-br from-indigo-50/90 to-blue-50/90 backdrop-blur-xl overflow-hidden shadow-xl [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(ellipse_at_bottom,_rgba(99,102,241,0.18),_transparent_60%)]"></div>
          <div className="relative z-10 h-full w-full p-6 flex items-center justify-center text-center text-black">
            <span className="text-sm text-gray-800">{desc}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FAQAccordion({ data }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <motion.section
      className="w-full max-w-2xl mx-auto bg-white/70 backdrop-blur rounded-xl shadow-xl p-6 mb-16 mt-8 border border-white/40"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
    >
      <h3 className="text-xl font-semibold text-black mb-4">FAQs</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={item.q} className="border border-indigo-200 rounded-xl overflow-hidden shadow-sm transition-all duration-200 bg-white/80 hover:shadow-md">
            <button
              onClick={() => toggle(index)}
              className={`w-full text-left px-4 py-3 bg-indigo-50 hover:bg-indigo-100 transition flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-indigo-300 ${openIndex === index ? 'ring-2 ring-indigo-400 bg-indigo-100' : ''}`}
            >
              <span className="font-medium text-black">
                Q{index + 1}: {item.q}
              </span>
              {openIndex === index ? (
                <ChevronUp className="w-4 h-4 text-indigo-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-indigo-600" />
              )}
            </button>
            <AnimatePresence initial={false}>
  {openIndex === index && (
    <motion.div
      key="answer"
      initial={{ opacity: 0, scaleY: 0.9 }}
      animate={{ opacity: 1, scaleY: 1 }}
      exit={{ opacity: 0, scaleY: 0.9 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="origin-top px-4 py-2 bg-white text-black text-sm"
    >
      {item.a}
    </motion.div>
  )}
</AnimatePresence>

          </div>
        ))}
      </div>
    </motion.section>
  );
}

export default function HomePage() {
  // Dropdown open state and timeout refs
  const [downloadsOpen, setDownloadsOpen] = useState(false);
  const [manualsOpen, setManualsOpen] = useState(false);
  const downloadsTimeout = React.useRef<NodeJS.Timeout | null>(null);
  const manualsTimeout = React.useRef<NodeJS.Timeout | null>(null);
  // Parallax state
  const [mx, setMx] = useState(0); // -0.5..0.5 range
  const [my, setMy] = useState(0);

  // Inline video modal state (for Video Guide buttons)
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<null | { src: string; title: string }>(null);

  const openVideo = (src: string, title: string) => {
    setActiveVideo({ src, title });
    setVideoModalOpen(true);
  };
  const closeVideo = () => {
    setVideoModalOpen(false);
    setActiveVideo(null);
  };

  // Handlers for Downloads
  const handleDownloadsEnter = () => {
    if (downloadsTimeout.current) clearTimeout(downloadsTimeout.current);
    setDownloadsOpen(true);
  };
  const handleDownloadsLeave = () => {
    downloadsTimeout.current = setTimeout(() => setDownloadsOpen(false), 200);
  };

  // Handlers for Manuals
  const handleManualsEnter = () => {
    if (manualsTimeout.current) clearTimeout(manualsTimeout.current);
    setManualsOpen(true);
  };
  const handleManualsLeave = () => {
    manualsTimeout.current = setTimeout(() => setManualsOpen(false), 200);
  };

  const handleScrollToVideo = () => {
    const el = document.getElementById("video-gallery");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { innerWidth, innerHeight } = window;
    const nx = e.clientX / innerWidth - 0.5;
    const ny = e.clientY / innerHeight - 0.5;
    setMx(nx);
    setMy(ny);
  };

  return (
    <div onMouseMove={handleMouseMove} className="relative h-screen overflow-y-auto overscroll-contain md:snap-y md:snap-mandatory flex flex-col overflow-x-hidden bg-gradient-to-br from-slate-800 via-indigo-900 to-blue-950">
  {/* Enhanced gradient background with subtle animated blobs */}
  <div className="pointer-events-none select-none fixed inset-0 -z-10">
    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-indigo-900 to-blue-950"></div>
    <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_rgba(79,70,229,0.45),_transparent_60%)]"></div>
    <div className="absolute inset-0 bg-black/20"></div>
    <div className="absolute -top-16 -left-16 w-80 h-80 bg-indigo-500/40 rounded-full blur-3xl"
         style={{ transform: `translate3d(${mx * 40}px, ${my * 40}px, 0)`, transition: 'transform 0.25s ease-out' }}></div>
    <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/45 rounded-full blur-3xl"
         style={{ transform: `translate3d(${mx * -48}px, ${my * -48}px, 0)`, transition: 'transform 0.25s ease-out' }}></div>
  </div>
      {/* Header */}
      <div className="bg-gradient-to-br from-white/70 to-indigo-50/60 backdrop-blur-xl shadow-lg border-b border-indigo-200/60 fixed top-0 left-0 w-full z-40 transition-all duration-300">
        <div className="container flex flex-col justify-center px-4">
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between h-20">
            <div className="flex items-center gap-3 cursor-pointer">
              <img src="/logo2.png" alt="PrashnaSetu Logo" className="h-12 w-12 object-contain" />
              <div className="flex flex-col justify-center">
                <h1 className="text-lg font-semibold leading-tight text-black">PrashnaSetu</h1>
                <span className="text-xs text-black leading-tight">Think. Compete. Conquer.</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative hidden"
  onMouseEnter={handleDownloadsEnter}
  onMouseLeave={handleDownloadsLeave}
>
  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-semibold shadow hover:bg-indigo-100 focus:ring-2 focus:ring-indigo-300 transition border border-indigo-100 cursor-pointer select-none">
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" /></svg>
  Downloads
</button>
  <div className={`absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-indigo-100 z-50 ${downloadsOpen ? 'block' : 'hidden'}`}>
    {downloads.map((m) => (
      <a key={m.label} href={m.href} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-black hover:bg-gray-100 rounded">{m.label}</a>
    ))}
  </div>
</div>
              
              <Link to="/results">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-100 text-emerald-700 font-semibold shadow hover:bg-emerald-200 focus:ring-2 focus:ring-emerald-300 border border-emerald-200 transition">
                  <BarChart3 className="w-5 h-5" />
                  View Results
                </button>
              </Link>
              <button
                onClick={handleScrollToVideo}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-semibold shadow hover:bg-indigo-100 focus:ring-2 focus:ring-indigo-300 transition border border-indigo-100 cursor-pointer select-none"
              >
                <PlayCircle className="w-5 h-5" />
                Video Guides
              </button>
              <div className="relative"
  onMouseEnter={handleManualsEnter}
  onMouseLeave={handleManualsLeave}
>
  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 text-amber-800 font-semibold shadow hover:bg-amber-100 focus:ring-2 focus:ring-amber-300 transition border border-amber-100 cursor-pointer select-none">
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h9" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 3.5l2 2-8.5 8.5H8.5v-2l8.5-8.5z" /></svg>
  User Manuals
</button>
  <div className={`absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-indigo-100 z-50 ${manualsOpen ? 'block' : 'hidden'}`}>
    {manuals.map((m) => (
      <a key={m.label} href={m.href} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-black hover:bg-gray-100 rounded">{m.label}</a>
    ))}
  </div>
</div>
              <Link to="/credits">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-100 text-green-700 font-semibold shadow hover:bg-green-200 focus:ring-2 focus:ring-green-300 border border-green-200 transition">
  {/* Mail/Contact icon for Credits & Contact */}
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 8.5V18a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 18V8.5m18 0A2.5 2.5 0 0018.5 6h-13A2.5 2.5 0 003 8.5m18 0V6a2 2 0 00-2-2H5a2 2 0 00-2 2v2.5m18 0l-9 6.5-9-6.5" /></svg>
  Contact Us
</button>
              </Link>
              
            </div>
          </div>

          {/* Mobile Header */}
          <div className="md:hidden py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 cursor-pointer">
                <img src="/logo2.png" alt="PrashnaSetu Logo" className="h-8 w-8 object-contain" />
                <div className="flex flex-col">
                  <h1 className="text-sm font-semibold leading-tight text-black">PrashnaSetu</h1>
                  <span className="text-xs text-black leading-tight">Think. Compete. Conquer.</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="relative hidden"
  onMouseEnter={handleDownloadsEnter}
  onMouseLeave={handleDownloadsLeave}
>
  <button className="px-3 py-1 rounded bg-gray-100 text-black font-medium border border-gray-200 cursor-pointer select-none">Downloads</button>
  <div className={`absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-indigo-100 z-50 ${downloadsOpen ? 'block' : 'hidden'}`}>
    {downloads.map((m) => (
      <a key={m.label} href={m.href} target="_blank" rel="noopener noreferrer" className="block px-3 py-1 text-black hover:bg-gray-100 rounded">{m.label}</a>
    ))}
  </div>
</div>
              
              <Link to="/results">
                <button className="px-3 py-1 rounded bg-emerald-100 text-emerald-700 font-medium border border-emerald-200 flex items-center gap-1">
                  <BarChart3 className="w-4 h-4" />
                  View Results
                </button>
              </Link>
              <button
                onClick={handleScrollToVideo}
                className="px-3 py-1 rounded bg-indigo-100 text-indigo-700 font-medium border border-indigo-200 flex items-center gap-1"
              >
                <PlayCircle className="w-4 h-4" />
                Video Guides
              </button>
              <div className="relative"
  onMouseEnter={handleManualsEnter}
  onMouseLeave={handleManualsLeave}
>
  <button className="px-3 py-1 rounded bg-gray-100 text-black font-medium border border-gray-200 cursor-pointer select-none">User Manuals</button>
  <div className={`absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-indigo-100 z-50 ${manualsOpen ? 'block' : 'hidden'}`}>
    {manuals.map((m) => (
      <a key={m.label} href={m.href} target="_blank" rel="noopener noreferrer" className="block px-3 py-1 text-black hover:bg-gray-100 rounded">{m.label}</a>
    ))}
  </div>
</div>
              <Link to="/credits">
                <button className="px-3 py-1 rounded bg-green-100 text-green-700 font-medium border border-green-200">Contact Us</button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-4 pt-36 pb-12">
        {/* Hero wrapper: fills the viewport (minus header height) */}
        <section className="min-h-[calc(100vh-80px)] md:snap-start md:snap-always flex flex-col justify-center">
        {/* Title & Tagline (no card) */}
        <div className="w-full max-w-4xl mx-auto text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">PrashnaSetu</h1>
          <h2 className="text-lg md:text-xl font-semibold text-slate-100 mt-2">Think. Compete. Conquer.</h2>
          <p className="text-slate-200 mt-4 max-w-2xl mx-auto">
            PrashnaSetu is a modern, full-screen quiz app that presents randomized questions with images,
            and provides real-time monitoring to ensure academic integrity.
          </p>
        </div>

        {/* Two primary cards */}
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
          {/* Start Creating Quiz Card */}
          <div
            className="bg-gradient-to-br from-white/70 to-indigo-50/60 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-indigo-200/60 flex flex-col items-center text-center transition-all duration-500 ease-out hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] relative overflow-hidden"
            style={{ transform: `translate3d(${mx * 14}px, ${my * 14}px, 0)` }}
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-indigo-200/30 blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-blue-200/30 blur-3xl"></div>
            <h3 className="text-xl md:text-2xl font-bold text-black">Create a Quiz</h3>
            <p className="text-gray-700 mt-2">Click "Create Quiz" to start building your quiz.</p>
            <div className="flex flex-wrap justify-center gap-3 mt-5">
              <Link to="/home">
                <button
                  className="relative overflow-hidden px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white font-semibold shadow-lg focus:outline-none transition-transform duration-300 ease-out hover:scale-105 active:scale-95 filter drop-shadow-[0_0_18px_rgba(99,102,241,0.45)]"
                >
                  <span
                    className="pointer-events-none absolute -inset-0.5 rounded-[1.25rem] opacity-80 blur-[0.5px] bg-[conic-gradient(from_0deg,theme(colors.indigo.400),theme(colors.blue.400),theme(colors.indigo.400))] animate-[spin_3s_linear_infinite]"
                    aria-hidden="true"
                  />
                  <span
                    className="pointer-events-none absolute -inset-1 rounded-[1.35rem] opacity-30 blur-xl bg-[conic-gradient(from_0deg,theme(colors.indigo.400),theme(colors.blue.400),theme(colors.indigo.400))] animate-[spin_3s_linear_infinite]"
                    aria-hidden="true"
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    <PlusCircle className="w-5 h-5" />
                    Create Quiz
                  </span>
                </button>
              </Link>
              <button onClick={() => openVideo('/creating.mp4', 'Creating a Quiz')} className="px-6 py-3 rounded-xl bg-amber-100 text-amber-800 font-semibold shadow hover:bg-amber-200 focus:ring-2 focus:ring-amber-300 border border-amber-200 transition-transform duration-300 ease-out hover:scale-105 active:scale-95 flex items-center gap-2">
                <PlayCircle className="w-5 h-5" />
                Video Guide
              </button>
            </div>
          </div>

          {/* Quiz Proctoring Software Card */}
          <div
            className="bg-gradient-to-br from-white/70 to-indigo-50/60 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-indigo-200/60 flex flex-col items-center text-center transition-all duration-500 ease-out hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] relative overflow-hidden"
            style={{ transform: `translate3d(${mx * -14}px, ${my * -14}px, 0)` }}
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-indigo-200/30 blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-blue-200/30 blur-3xl"></div>
            <h3 className="text-xl md:text-2xl font-bold text-black">Quiz Proctoring Software</h3>
            <p className="text-gray-700 mt-2">Download the proctoring tools:</p>
            <div className="flex flex-wrap justify-center gap-3 mt-5">
              <a
                href={downloads[0].href}
                target="_blank"
                rel="noopener noreferrer"
                className="relative overflow-hidden px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white font-semibold shadow-lg focus:outline-none transition-transform duration-300 ease-out hover:scale-105 active:scale-95 filter drop-shadow-[0_0_18px_rgba(16,185,129,0.45)]"
              >
                <span
                  className="pointer-events-none absolute -inset-0.5 rounded-[1.25rem] opacity-80 blur-[0.5px] bg-[conic-gradient(from_0deg,theme(colors.emerald.400),theme(colors.teal.400),theme(colors.emerald.400))] animate-[spin_3s_linear_infinite]"
                  aria-hidden="true"
                />
                <span
                  className="pointer-events-none absolute -inset-1 rounded-[1.35rem] opacity-30 blur-xl bg-[conic-gradient(from_0deg,theme(colors.emerald.400),theme(colors.teal.400),theme(colors.emerald.400))] animate-[spin_3s_linear_infinite]"
                  aria-hidden="true"
                />
                <span className="relative z-10 flex items-center gap-2">
                  <FileDown className="w-5 h-5" />
                  Download
                </span>
              </a>
              <button onClick={() => openVideo('/login.mp4', 'Login: A glance at the Dashboard')} className="px-6 py-3 rounded-xl bg-amber-100 text-amber-800 font-semibold shadow hover:bg-amber-200 focus:ring-2 focus:ring-amber-300 border border-amber-200 transition-transform duration-300 ease-out hover:scale-105 active:scale-95 flex items-center gap-2">
                <PlayCircle className="w-5 h-5" />
                Video Guide
              </button>
            </div>
          </div>
        </div>
        </section>

        {/* Salient Features */}
        <section className="w-full max-w-6xl mx-auto min-h-screen md:snap-start md:snap-always flex items-center">
          <div className="w-full">
            <h3 className="text-3xl font-bold text-white text-center mb-6">Salient Features</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f, idx) => {
                const ref = React.useRef<HTMLDivElement | null>(null);
                const inView = useInView(ref, { amount: 0.25 });
                const offX = idx % 2 === 0 ? -80 : 80;
                return (
                  <motion.div
                    key={f.title}
                    ref={ref}
                    initial={false}
                    animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: offX }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  >
                    <FeatureCard title={f.title} desc={f.desc} px={mx} py={my} icon={f.icon} />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Video Gallery at the end */}
        <section id="video-gallery" className="w-full max-w-6xl mx-auto mt-12 md:mt-0 md:min-h-[calc(100vh-80px)] md:flex md:flex-col md:justify-center md:snap-center md:snap-always">
          <h3 className="text-3xl font-bold text-white text-center mb-6">Video Guides</h3>
          <VideoGallery />
        </section>
      </main>

      {/* Inline Video Modal */}
      <AnimatePresence>
        {videoModalOpen && activeVideo && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeVideo}
          >
            <button
              className="absolute top-4 right-4 text-3xl text-white hover:text-red-500 font-bold z-10 bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center"
              onClick={closeVideo}
              aria-label="Close"
            >
              ×
            </button>
            <motion.div
              className="bg-white rounded-xl shadow-xl p-4 relative flex flex-col items-center"
              style={{ width: "80vw", maxWidth: 900, height: "80vh", maxHeight: 600 }}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <video
                src={activeVideo.src}
                controls
                autoPlay
                className="w-full h-full rounded-lg"
                style={{ maxHeight: "calc(80vh - 60px)" }}
              />
              <div className="text-lg font-semibold text-black mt-2 text-center">
                {activeVideo.title}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Desktop */}
      <div className="hidden md:block fixed bottom-0 left-0 w-full bg-gradient-to-br from-white/70 to-indigo-50/60 backdrop-blur-xl border-t border-indigo-200/60 py-3 text-center text-xs text-gray-700 z-50 shadow-lg">
        <p>© Copyrighted by CAD-CS, BML Munjal University</p>
        <p className="flex items-center justify-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5A2.25 2.25 0 0 1 19.5 19.5h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-.96 1.85l-7.29 5.063a2.25 2.25 0 0 1-2.52 0L2.46 8.843a2.25 2.25 0 0 1-.96-1.85V6.75"/></svg><a href="mailto:cadcs@bmu.edu.in" className="underline hover:text-blue-700">cadcs@bmu.edu.in</a></p>
        </div>

      {/* Footer Mobile */}
      <div className="md:hidden text-center text-xs text-gray-700 mt-6 mb-2 bg-gradient-to-br from-white/70 to-indigo-50/60 backdrop-blur-xl py-3 border-t border-indigo-200/60 shadow">
        <p>© Copyrighted by CAD-CS, BML Munjal University</p>
        <p className="flex items-center justify-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5A2.25 2.25 0 0 1 19.5 19.5h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-.96 1.85l-7.29 5.063a2.25 2.25 0 0 1-2.52 0L2.46 8.843a2.25 2.25 0 0 1-.96-1.85V6.75"/></svg><a href="mailto:cadcs@bmu.edu.in" className="underline hover:text-blue-700">cadcs@bmu.edu.in</a></p>
        </div>
    </div>
  );
}
