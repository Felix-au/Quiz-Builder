import React, { useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { PlusCircle, PlayCircle, BarChart3, ShieldCheck, Brain, Eye, FileDown, Timer, Sun, Moon } from "lucide-react";
import VideoGallery from "./VideoGallery";
import { useTheme } from "@/contexts/ThemeContext";

// ------------------------------
// HomePage-only Themes
// ------------------------------
type ThemeKey =
  | "solarizedDuo"
  | "gradientMeshPop";

type ThemeConfig = {
  name: string;
  rootBg: string; // base classes for root background color/gradient
  header: string; // header container classes
  // Render theme-specific overlay(s) inside the fixed background
  renderOverlay: (args: { mx: number; my: number; reduceMotion: boolean }) => React.ReactNode;
  headerText: string; // text color classes for header titles
};

const themes: Record<ThemeKey, ThemeConfig> = {
  solarizedDuo: {
    name: "Solarized Duo",
    rootBg: "bg-[#fdf6e3]",
    header: "bg-[#fdf6e3]/80 backdrop-blur-xl shadow-lg border-b border-amber-200",
    headerText: "text-black",
    renderOverlay: ({ mx, my, reduceMotion }) => (
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 20% 30%, rgba(38,139,210,0.15), transparent 40%), radial-gradient(circle at 80% 70%, rgba(203,75,22,0.15), transparent 40%)" }} />
    ),
  },
  gradientMeshPop: {
    name: "Gradient Mesh Pop",
    rootBg: "bg-black",
    header: "bg-white/10 backdrop-blur-xl shadow-lg border-b border-white/20",
    headerText: "text-white",
    renderOverlay: ({ mx, my, reduceMotion }) => (
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 20% 30%, rgba(34,211,238,0.25), transparent 35%), radial-gradient(circle at 80% 20%, rgba(244,63,94,0.25), transparent 35%), radial-gradient(circle at 60% 80%, rgba(250,204,21,0.25), transparent 35%)" }} />
    ),
  },
};



const manuals = [
  { label: "Admin Manual", href: "/manuals/PrashnaSetu-Application-User-Guide_Admin.pdf" },
  { label: "Instructor Manual", href: "/manuals/PrashnaSetu-Application-User-Guide_Instructor.pdf" },
  { label: "Proctor Manual", href: "/manuals/PrashnaSetu-Application-User-Guide_Proctor.pdf" },
  { label: "Student Manual", href: "/manuals/PrashnaSetu-Application-User-Guide_Student.pdf" },
  { label: "Website Manual", href: "/manuals/PrashnaSetu-Application-User-Guide_Website.pdf" },
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

function FeatureCard({ title, desc, px = 0, py = 0, icon: Icon, onDark = false }: { title: string; desc: string; px?: number; py?: number; icon?: React.ElementType; onDark?: boolean }) {
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
  // theme-aware helpers moved to HomePage

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
        <div className={`absolute inset-0 rounded-2xl border bg-gradient-to-br backdrop-blur-xl overflow-hidden shadow-md group-hover:shadow-2xl group-hover:-translate-y-1 group-hover:scale-[1.02] ring-0 group-hover:ring-2 transition-all duration-500 ease-out [backface-visibility:hidden] ${onDark ? 'border-white/15 from-white/10 to-white/5 group-hover:ring-white/30' : 'border-black/10 from-white/70 to-white/60 group-hover:ring-indigo-400/70'}`}>
          <div className={`absolute inset-0 opacity-30 pointer-events-none ${onDark ? 'bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.12),_transparent_60%)]' : 'bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.15),_transparent_60%)]'}`}></div>
          <div className={`relative z-10 h-full w-full p-6 flex flex-col items-center justify-center text-center ${onDark ? 'text-white' : 'text-black'}`}>
            {Icon ? <Icon className={`w-7 h-7 mb-2 ${onDark ? 'text-indigo-300' : 'text-indigo-600'}`} /> : null}
            <div className="font-semibold">{title}</div>
          </div>
        </div>
        {/* Back Face */}
        <div className={`absolute inset-0 rounded-2xl border bg-gradient-to-br backdrop-blur-xl overflow-hidden shadow-xl [transform:rotateY(180deg)] [backface-visibility:hidden] ${onDark ? 'border-white/15 from-white/10 to-white/5' : 'border-indigo-300/60 from-indigo-50/90 to-blue-50/90'}`}>
          <div className={`absolute inset-0 opacity-40 pointer-events-none ${onDark ? 'bg-[radial-gradient(ellipse_at_bottom,_rgba(255,255,255,0.16),_transparent_60%)]' : 'bg-[radial-gradient(ellipse_at_bottom,_rgba(99,102,241,0.18),_transparent_60%)]'}`}></div>
          <div className={`relative z-10 h-full w-full p-6 flex items-center justify-center text-center ${onDark ? 'text-white' : 'text-black'}`}>
            <span className={`text-sm ${onDark ? 'text-white/85' : 'text-gray-800'}`}>{desc}</span>
          </div>
        </div>
      </div>
    </div>
  );
}



export default function HomePage() {
  // Dropdown open state and timeout refs
  const [manualsOpen, setManualsOpen] = useState(false);
  const manualsTimeout = React.useRef<NodeJS.Timeout | null>(null);
  // Parallax state
  const [mx, setMx] = useState(0); // -0.5..0.5 range
  const [my, setMy] = useState(0);

  // Shared theme and motion from context
  const { theme, setTheme, reduceMotion } = useTheme();

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

  // Warm up backend services on first load
  React.useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const ping = async (url: string, label: string) => {
      try {
        const resp = await fetch(`${url}/api/health`, { method: 'GET', signal: controller.signal, cache: 'no-store' });
        if (resp.ok) {
          const data = await resp.json().catch(() => ({}));
          if (data && data.ok) {
            console.log(`${label}: ok`);
          }
        }
      } catch (_) {
        // ignore warming failures silently
      }
    };
    // Render services
    ping('https://quiz-builder-9afc.onrender.com', 'Email'); // email service
    ping('https://result-xxa7.onrender.com', 'Result'); // results service
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  // Handlers for Manuals
  const handleManualsEnter = () => {
    if (manualsTimeout.current) clearTimeout(manualsTimeout.current);
    setManualsOpen(true);
  };
  const handleManualsLeave = () => {
    manualsTimeout.current = setTimeout(() => setManualsOpen(false), 200);
  };

  // (Student Corner removed)

  // (theme dropdown removed)

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

  // Theme-aware helpers (light vs dark based on headerText)
  const isDark = themes[theme].headerText.includes('white');
  // Target theme for toggle (icon reflects target)
  const targetTheme: ThemeKey = theme === 'solarizedDuo' ? 'gradientMeshPop' : 'solarizedDuo';
  const targetLabel = targetTheme === 'solarizedDuo' ? 'Switch to Solarized Duo' : 'Switch to Gradient Mesh Pop';

  const btnNeutral = isDark
    ? 'bg-white/10 text-white border-white/15 hover:bg-white/15 focus-visible:ring-white/20'
    : 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100 focus-visible:ring-gray-200';

  const tone = {
    indigo: isDark
      ? 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30 hover:bg-indigo-500/30 focus-visible:ring-indigo-400/30'
      : 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100 focus-visible:ring-indigo-300',
    blue: isDark
      ? 'bg-blue-500/20 text-blue-200 border-blue-400/30 hover:bg-blue-500/30 focus-visible:ring-blue-400/30'
      : 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100 focus-visible:ring-blue-300',
    emerald: isDark
      ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30 hover:bg-emerald-500/30 focus-visible:ring-emerald-400/30'
      : 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200 focus-visible:ring-emerald-300',
    green: isDark
      ? 'bg-green-500/20 text-green-200 border-green-400/30 hover:bg-green-500/30 focus-visible:ring-green-400/30'
      : 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200 focus-visible:ring-green-300',
    amber: isDark
      ? 'bg-amber-400/20 text-amber-200 border-amber-300/30 hover:bg-amber-400/30 focus-visible:ring-amber-300/30'
      : 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200 focus-visible:ring-amber-300',
    gray: btnNeutral,
  } as const;

  const menuPanel = isDark
    ? 'bg-slate-900/90 backdrop-blur-xl border border-white/15'
    : 'bg-white border border-gray-200';
  const menuItemBase = isDark ? 'text-white hover:bg-white/10 focus-visible:bg-white/10' : 'text-black hover:bg-gray-100 focus-visible:bg-gray-100';
  const iconIndigo = isDark ? 'text-indigo-300' : 'text-indigo-700';
  const iconAmber = isDark ? 'text-amber-300' : 'text-amber-700';

  const cardShell = isDark
    ? 'bg-white/10 border border-white/15'
    : 'bg-gradient-to-br from-white/70 to-indigo-50/60 border border-indigo-200/60';
  const cardTextPrimary = isDark ? 'text-white' : 'text-black';
  const cardTextSecondary = isDark ? 'text-white/85' : 'text-gray-700';
  const videoBtnTone = isDark
    ? 'px-6 py-3 rounded-xl bg-amber-400/20 text-amber-200 font-semibold shadow hover:bg-amber-400/30 focus-visible:ring-2 focus-visible:ring-amber-300/30 border border-amber-300/30 transition-transform duration-300 ease-out hover:scale-105 active:scale-95 flex items-center gap-2'
    : 'px-6 py-3 rounded-xl bg-amber-100 text-amber-800 font-semibold shadow hover:bg-amber-200 focus-visible:ring-2 focus-visible:ring-amber-300 border border-amber-200 transition-transform duration-300 ease-out hover:scale-105 active:scale-95 flex items-center gap-2';

  // CTA helpers (theme-aware wrappers around gradients and halo accents)
  const ctaBase = 'relative overflow-hidden px-6 py-3 rounded-2xl text-white font-semibold shadow-lg focus:outline-none focus-visible:ring-2 transition-transform duration-300 ease-out hover:scale-105 active:scale-95';
  const ctaPrimary = `${ctaBase} ${isDark ? 'bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-600 focus-visible:ring-indigo-400/60' : 'bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 focus-visible:ring-indigo-300'} filter drop-shadow-[0_0_18px_rgba(99,102,241,0.45)]`;
  const ctaDownload = `${ctaBase} ${isDark ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 focus-visible:ring-emerald-400/60' : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 focus-visible:ring-emerald-300'} filter drop-shadow-[0_0_18px_rgba(16,185,129,0.45)]`;
  const haloIndigo1 = 'pointer-events-none absolute -inset-0.5 rounded-[1.25rem] opacity-80 blur-[0.5px] bg-[conic-gradient(from_0deg,theme(colors.indigo.400),theme(colors.blue.400),theme(colors.indigo.400))] animate-[spin_3s_linear_infinite]';
  const haloIndigo2 = 'pointer-events-none absolute -inset-1 rounded-[1.35rem] opacity-30 blur-xl bg-[conic-gradient(from_0deg,theme(colors.indigo.400),theme(colors.blue.400),theme(colors.indigo.400))] animate-[spin_3s_linear_infinite]';
  const haloEmerald1 = 'pointer-events-none absolute -inset-0.5 rounded-[1.25rem] opacity-80 blur-[0.5px] bg-[conic-gradient(from_0deg,theme(colors.emerald.400),theme(colors.teal.400),theme(colors.emerald.400))] animate-[spin_3s_linear_infinite]';
  const haloEmerald2 = 'pointer-events-none absolute -inset-1 rounded-[1.35rem] opacity-30 blur-xl bg-[conic-gradient(from_0deg,theme(colors.emerald.400),theme(colors.teal.400),theme(colors.emerald.400))] animate-[spin_3s_linear_infinite]';

  const footerShell = isDark
    ? 'bg-slate-900/60 backdrop-blur-xl border-t border-white/15'
    : 'bg-white/70 backdrop-blur-xl border-t border-gray-200';
  const footerText = isDark ? 'text-white/80' : 'text-gray-700';

  return (
    <div onMouseMove={handleMouseMove} className={`relative h-screen overflow-y-auto overscroll-contain md:snap-y md:snap-mandatory flex flex-col overflow-x-hidden transition-colors duration-700 ${themes[theme].rootBg}`}>
  {/* Themed background overlay */}
  <div className="pointer-events-none select-none fixed inset-0 z-0">
    {/* Global rich background layers (beyond simple gradients) */}
    <div className="absolute inset-0">
      {/* Animated conic mesh */}
      {!reduceMotion && (
        <div
          className="absolute inset-0 opacity-30 mix-blend-screen animate-[spin_60s_linear_infinite]"
          style={{
            background:
              "conic-gradient(from_180deg_at_50%_50%, rgba(99,102,241,0.15), rgba(34,211,238,0.12), rgba(244,63,94,0.12), rgba(99,102,241,0.15))",
          }}
        />
      )}
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 24px), repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 24px)",
        }}
      />
      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "22px 22px" }}
      />
      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse_at_center, rgba(0,0,0,0.35), transparent_60%)" }}
      />
      {/* Parallax blobs */}
      {!reduceMotion && (
        <>
          <div
            className="absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full blur-3xl"
            style={{
              background: "radial-gradient(circle_at_30%_30%, rgba(99,102,241,0.35), transparent_60%)",
              transform: `translate3d(${mx * 40}px, ${my * 40}px, 0)`,
              transition: "transform 0.25s ease-out",
            }}
          />
          <div
            className="absolute -bottom-24 -right-24 w-[30rem] h-[30rem] rounded-full blur-3xl"
            style={{
              background: "radial-gradient(circle_at_70%_70%, rgba(34,211,238,0.35), transparent_60%)",
              transform: `translate3d(${mx * -48}px, ${my * -48}px, 0)`,
              transition: "transform 0.25s ease-out",
            }}
          />
          {/* Animated sweep band */}
          <div
            className="absolute inset-x-0 top-1/3 h-40 opacity-25 blur-3xl mix-blend-screen"
            style={{
              background:
                "linear-gradient(90deg, rgba(99,102,241,0) 0%, rgba(99,102,241,0.45) 50%, rgba(99,102,241,0) 100%)",
              transform: `translate3d(${mx * 60}px, 0, 0)`,
              transition: "transform 0.2s ease-out",
            }}
          />
        </>
      )}
      {/* SVG noise overlay for texture */}
      <svg className="absolute inset-0 w-full h-full opacity-10" aria-hidden="true" focusable="false">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch">
            {/* animate baseFrequency subtly unless reduced motion */}
            {!reduceMotion && (
              // @ts-ignore - SVG animate is valid in runtime
              <animate attributeName="baseFrequency" dur="12s" values="0.8;0.6;0.8" repeatCount="indefinite" />
            )}
          </feTurbulence>
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" opacity="0.05" />
      </svg>
    </div>
    {/* Theme-specific overlay on top */}
    {themes[theme].renderOverlay({ mx, my, reduceMotion })}
  </div>
      {/* Header */}
      <div className={`${themes[theme].header} fixed top-0 left-0 w-full z-40 transition-all duration-700`}>
        <div className="container flex flex-col justify-center px-4">
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between h-20">
            <div className="flex items-center gap-3 cursor-pointer h-full">
              <img
                src={isDark ? "/logo1dark.png" : "/logo1light.png"}
                alt="PrashnaSetu Logo"
                className="h-[90%] w-auto object-contain"
              />
            </div>
            <div className="flex items-center gap-4">
              
              
              {/* Student Corner removed */}
              <Link to="/results">
                <button className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow focus-visible:ring-2 border transition ${tone.emerald}`}>
                  <BarChart3 className="w-5 h-5" />
                  View Results
                </button>
              </Link>
              <button
                onClick={handleScrollToVideo}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow focus-visible:ring-2 border transition cursor-pointer select-none ${tone.indigo}`}
              >
                <PlayCircle className="w-5 h-5" />
                Video Guides
              </button>
              {/* Student Corner (Desktop) moved above */}
              <div className="relative"
  onMouseEnter={handleManualsEnter}
  onMouseLeave={handleManualsLeave}
>
  <button
    aria-haspopup="menu"
    aria-expanded={manualsOpen}
    aria-controls="menu-manuals-desktop"
    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow focus-visible:ring-2 border transition cursor-pointer select-none ${tone.amber}`}
  >
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h9" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 3.5l2 2-8.5 8.5H8.5v-2l8.5-8.5z" /></svg>
  User Manuals
</button>
  <div
    id="menu-manuals-desktop"
    role="menu"
    aria-hidden={!manualsOpen}
    className={`absolute right-0 mt-2 w-56 rounded-lg shadow-lg z-50 ${menuPanel} ${manualsOpen ? 'block' : 'hidden'}`}
  >
    {manuals.map((m) => (
      <a key={m.label} href={m.href} target="_blank" rel="noopener noreferrer" role="menuitem" className={`flex items-center gap-2 px-4 py-2 ${menuItemBase}`}>
        {/* Icon per manual */}
        {m.label === 'Admin Manual' && (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`h-5 w-5 ${iconIndigo}`}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 4.5v4.5c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V7.5L12 3z"/></svg>
        )}
        {m.label === 'Instructor Manual' && (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`h-5 w-5 ${iconIndigo}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20a5 5 0 11-10 0 5 5 0 0110 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
        {m.label === 'Student Manual' && (
          // Document Text outline (consistent with Student Corner)
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`h-5 w-5 ${iconIndigo}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5.25A2.25 2.25 0 0 1 5.25 3h8.69a2.25 2.25 0 0 1 1.59.659l3.06 3.06A2.25 2.25 0 0 1 19.25 8.31V18.75A2.25 2.25 0 0 1 17 21H5.25A2.25 2.25 0 0 1 3 18.75V5.25z"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 7.5h3.75M9 12h6M9 16.5h6"/>
          </svg>
        )}
        {m.label === 'Proctor Manual' && (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`h-5 w-5 ${iconIndigo}`}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-6 9.75-6 9.75 6 9.75 6-3.75 6-9.75 6-9.75-6-9.75-6z"/><circle cx="12" cy="12" r="3.75"/></svg>
        )}
        {m.label === 'Website Manual' && (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`h-5 w-5 ${iconIndigo}`}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9z"/><path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M12 3c2.5 3 2.5 15 0 18M7 6.5c3 1.5 7 1.5 10 0M7 17.5c3-1.5 7-1.5 10 0"/></svg>
        )}
        {m.label}
      </a>
    ))}
  </div>
</div>
              <Link to="/credits">
                <button className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow focus-visible:ring-2 border transition ${tone.green}`}>
  {/* Mail/Contact icon for Credits & Contact */}
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 8.5V18a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 18V8.5m18 0A2.5 2.5 0 0018.5 6h-13A2.5 2.5 0 003 8.5m18 0V6a2 2 0 00-2-2H5a2 2 0 00-2 2v2.5m18 0l-9 6.5-9-6.5" /></svg>
  Contact Us
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
                    <motion.span
                      key="sun"
                      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, rotate: 90 }}
                      transition={{ duration: reduceMotion ? 0 : 0.5, ease: 'easeOut' }}
                      className="flex"
                    >
                      <Sun className="w-5 h-5" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="moon"
                      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, rotate: 90 }}
                      transition={{ duration: reduceMotion ? 0 : 0.5, ease: 'easeOut' }}
                      className="flex"
                    >
                      <Moon className="w-5 h-5" />
                    </motion.span>
                  )}
                </AnimatePresence>
                <span className="sr-only">{targetLabel}</span>
              </motion.button>
              
            </div>
          </div>

          {/* Mobile Header */}
          <div className="md:hidden py-3">
            <div className="flex items-center justify-between mb-2 h-16">
              <div className="flex items-center gap-2 cursor-pointer h-full">
                <img
                  src={isDark ? "/logo1dark.png" : "/logo1light.png"}
                  alt="PrashnaSetu Logo"
                  className="h-[90%] w-auto object-contain"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              {/* Theme Toggle (Mobile) */}
              <motion.button
                whileTap={reduceMotion ? undefined : { scale: 0.95 }}
                onClick={() => setTheme(targetTheme)}
                aria-label={targetLabel}
                className={`px-3 py-1 rounded font-medium border flex items-center justify-center ${btnNeutral}`}
              >
                <AnimatePresence initial={false} mode="wait">
                  {targetTheme === 'solarizedDuo' ? (
                    <motion.span
                      key="sun"
                      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, rotate: 90 }}
                      transition={{ duration: reduceMotion ? 0 : 0.5, ease: 'easeOut' }}
                      className="flex"
                    >
                      <Sun className="w-4 h-4" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="moon"
                      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, rotate: 90 }}
                      transition={{ duration: reduceMotion ? 0 : 0.5, ease: 'easeOut' }}
                      className="flex"
                    >
                      <Moon className="w-4 h-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
                <span className="sr-only">{targetLabel}</span>
              </motion.button>
              
              
              {/* Student Corner removed (mobile) */}
              <Link to="/results">
                <button className={`px-3 py-1 rounded font-medium border flex items-center gap-1 ${tone.emerald}`}>
                  <BarChart3 className="w-4 h-4" />
                  View Results
                </button>
              </Link>
              <button
                onClick={handleScrollToVideo}
                className={`px-3 py-1 rounded font-medium border flex items-center gap-1 ${tone.indigo}`}
              >
                <PlayCircle className="w-4 h-4" />
                Video Guides
              </button>
              {/* Student Corner (Mobile) moved above */}
              <div className="relative"
  onMouseEnter={handleManualsEnter}
  onMouseLeave={handleManualsLeave}
>
  <button onClick={() => setManualsOpen((v) => !v)} aria-haspopup="menu" aria-expanded={manualsOpen} aria-controls="menu-manuals-mobile" className={`px-3 py-1 rounded font-medium border cursor-pointer select-none ${tone.amber}`}>User Manuals</button>
  <div id="menu-manuals-mobile" role="menu" aria-hidden={!manualsOpen} className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-50 ${menuPanel} ${manualsOpen ? 'block' : 'hidden'}`}>
    {manuals.map((m) => (
      <a key={m.label} href={m.href} target="_blank" rel="noopener noreferrer" role="menuitem" className={`flex items-center gap-2 px-3 py-1.5 ${menuItemBase}`}>
        {m.label === 'Admin Manual' && (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`h-4 w-4 ${iconIndigo}`}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 4.5v4.5c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V7.5L12 3z"/></svg>
        )}
        {m.label === 'Instructor Manual' && (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`h-4 w-4 ${iconIndigo}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 20a6 6 0 0 0-12 0" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
          </svg>
        )}
        {m.label === 'Student Manual' && (
          // Document Text outline (consistent with desktop and Student Corner)
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`h-4 w-4 ${iconIndigo}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5.25A2.25 2.25 0 0 1 5.25 3h8.69a2.25 2.25 0 0 1 1.59.659l3.06 3.06A2.25 2.25 0 0 1 19.25 8.31V18.75A2.25 2.25 0 0 1 17 21H5.25A2.25 2.25 0 0 1 3 18.75V5.25z"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 7.5h3.75M9 12h6M9 16.5h6"/>
          </svg>
        )}
        {m.label === 'Proctor Manual' && (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`h-4 w-4 ${iconIndigo}`}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-6 9.75-6 9.75 6 9.75 6-3.75 6-9.75 6-9.75-6-9.75-6z"/><circle cx="12" cy="12" r="3.75"/></svg>
        )}
        {m.label === 'Website Manual' && (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`h-4 w-4 ${iconIndigo}`}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9z"/><path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M12 3c2.5 3 2.5 15 0 18M7 6.5c3 1.5 7 1.5 10 0M7 17.5c3-1.5 7-1.5 10 0"/></svg>
        )}
        {m.label}
      </a>
    ))}
  </div>
</div>
              <Link to="/credits">
                <button className={`px-3 py-1 rounded font-medium border ${tone.green}`}>Contact Us</button>
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
          <h1 className={`text-4xl md:text-5xl font-extrabold tracking-tight ${themes[theme].headerText}`}>PrashnaSetu</h1>
          <h2 className={`text-lg md:text-xl font-semibold mt-2 ${themes[theme].headerText}`}>Think. Compete. Conquer.</h2>
          <p className={`mt-4 max-w-2xl mx-auto ${isDark ? 'text-white/80' : 'text-gray-800'}`}>
            PrashnaSetu is a modern, full-screen quiz app that presents randomized questions with images,
            and provides real-time monitoring to ensure academic integrity.
          </p>
        </div>

        {/* Two primary cards */}
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
          {/* Start Creating Quiz Card */}
          <div
            className={`${cardShell} backdrop-blur-xl rounded-2xl shadow-xl p-8 flex flex-col items-center text-center transition-all duration-500 ease-out hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] relative overflow-hidden`}
            style={{ transform: `translate3d(${mx * 14}px, ${my * 14}px, 0)` }}
          >
            <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full ${isDark ? 'bg-white/15' : 'bg-indigo-200/30'} blur-3xl`}></div>
            <div className={`absolute -bottom-10 -left-10 w-40 h-40 rounded-full ${isDark ? 'bg-white/10' : 'bg-blue-200/30'} blur-3xl`}></div>
            <h3 className={`text-xl md:text-2xl font-bold ${cardTextPrimary}`}>Create a Quiz</h3>
            <p className={`${cardTextSecondary} mt-2`}>Click "Create Quiz" to start building your quiz.</p>
            <div className="flex flex-wrap justify-center gap-3 mt-5">
              <Link to="/home">
                <button
                  className={`${isDark ? 'bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-600 focus-visible:ring-indigo-400/60' : 'bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 focus-visible:ring-indigo-300'} relative px-6 py-3 rounded-2xl text-white font-semibold shadow-lg focus:outline-none focus-visible:ring-2 transition-transform duration-300 ease-out hover:scale-105 active:scale-95`}
                >
                  <span className="flex items-center gap-2">
                    <PlusCircle className="w-5 h-5" />
                    Create Quiz
                  </span>
                </button>
              </Link>
              <button onClick={() => openVideo('/creating.mp4', 'Creating a Quiz')} className={videoBtnTone}>
                <PlayCircle className="w-5 h-5" />
                Video Guide
              </button>
            </div>
          </div>

          {/* Quiz Proctoring Software Card */}
          <div
            className={`${cardShell} backdrop-blur-xl rounded-2xl shadow-xl p-8 flex flex-col items-center text-center transition-all duration-500 ease-out hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] relative overflow-hidden`}
            style={{ transform: `translate3d(${mx * -14}px, ${my * -14}px, 0)` }}
          >
            <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full ${isDark ? 'bg-white/15' : 'bg-indigo-200/30'} blur-3xl`}></div>
            <div className={`absolute -bottom-10 -left-10 w-40 h-40 rounded-full ${isDark ? 'bg-white/10' : 'bg-blue-200/30'} blur-3xl`}></div>
            <h3 className={`text-xl md:text-2xl font-bold ${cardTextPrimary}`}>PrashnaSetu Software</h3>
            <p className={`${cardTextSecondary} mt-2`}>Download the PrashnaSetu Software:</p>
            <div className="flex flex-wrap justify-center gap-3 mt-5">
              <a
                href="https://drive.usercontent.google.com/download?id=1lAVc8ZsL0LxfM4O-S_4ESFfuhCsvJ7go&export=download"
                target="_blank"
                rel="noopener noreferrer"
                className={`${isDark ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 focus-visible:ring-emerald-400/60' : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 focus-visible:ring-emerald-300'} relative px-6 py-3 rounded-2xl text-white font-semibold shadow-lg focus:outline-none focus-visible:ring-2 transition-transform duration-300 ease-out hover:scale-105 active:scale-95`}
              >
                <span className="flex items-center gap-2">
                  <FileDown className="w-5 h-5" />
                  Download
                </span>
              </a>
              <button onClick={() => openVideo('/login.mp4', 'Login: A glance at the Dashboard')} className={videoBtnTone}>
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
            <h3 className={`text-3xl font-bold text-center mb-6 ${themes[theme].headerText}`}>Salient Features</h3>
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
                    <FeatureCard title={f.title} desc={f.desc} px={mx} py={my} icon={f.icon} onDark={isDark} />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
        

        {/* Video Gallery at the end */}
        <section id="video-gallery" className="w-full max-w-6xl mx-auto mt-12 md:mt-0 md:min-h-[calc(100vh-80px)] md:flex md:flex-col md:justify-center md:snap-center md:snap-always">
          <h3 className={`text-3xl font-bold text-center mb-6 ${themes[theme].headerText}`}>Video Guides</h3>
          <VideoGallery onDark={isDark} />
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
              className={`${cardShell} rounded-xl shadow-xl p-4 relative flex flex-col items-center w-[80vw] max-w-[900px] h-[80vh] max-h-[600px]`}
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
              <div className={`text-lg font-semibold mt-2 text-center ${cardTextPrimary}`}>
                {activeVideo.title}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Desktop */}
      <div className={`hidden md:block fixed bottom-0 left-0 w-full ${footerShell} py-3 text-center text-xs ${footerText} z-50 shadow-lg`}>
        <p>© Copyrighted by CAD-CS, BML Munjal University</p>
        <p className="flex items-center justify-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${iconIndigo}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5A2.25 2.25 0 0 1 19.5 19.5h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-.96 1.85l-7.29 5.063a2.25 2.25 0 0 1-2.52 0L2.46 8.843a2.25 2.25 0 0 1-.96-1.85V6.75"/></svg><a href="mailto:cadcs@bmu.edu.in" className="underline hover:opacity-80">cadcs@bmu.edu.in</a></p>
        </div>

      {/* Footer Mobile */}
      <div className={`md:hidden text-center text-xs ${footerText} mt-6 mb-2 ${footerShell} shadow`}>
        <p>© Copyrighted by CAD-CS, BML Munjal University</p>
        <p className="flex items-center justify-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${iconIndigo}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5A2.25 2.25 0 0 1 19.5 19.5h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-.96 1.85l-7.29 5.063a2.25 2.25 0 0 1-2.52 0L2.46 8.843a2.25 2.25 0 0 1-.96-1.85V6.75"/></svg><a href="mailto:cadcs@bmu.edu.in" className="underline hover:opacity-80">cadcs@bmu.edu.in</a></p>
        </div>
    </div>
  );
}
