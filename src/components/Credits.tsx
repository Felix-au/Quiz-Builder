import React, { useState } from 'react';
import { Home, Mail, Linkedin, Github, GraduationCap, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';

const profiles = [
  {
    photo: '/profiles/Kiran.jpg',
    name: 'Kiran Sharma',
    role: 'Principal Investigator',
    positions: [
      'Assistant Professor, SOET',
      'Head of Center for Advanced Data and Computational Science',
      'BML Munjal University'
    ],
    email1: 'cadcs@bmu.edu.in',
    linkedin: 'https://www.linkedin.com/in/kiran-sharma-754658180/',
    scholar: 'https://scholar.google.com/citations?hl=en&user=M3EsWaUAAAAJ',
    profileUrl: 'https://www.bmu.edu.in/faculty/dr-kiran-sharma/',
  },
  {
    photo: '/profiles/profile.jpg',
    name: 'Harshit Soni',
    role: 'Developer',
    positions: [
      'BTech CSE 2023-2027',
      'BML Munjal University'
    ],
    linkedin: 'https://www.linkedin.com/in/harshit-soni-781a77274/',
    github: 'https://github.com/Felix-au',
  },
];

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
    renderOverlay: ({ mx, my }) => (
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 20% 30%, rgba(38,139,210,0.15), transparent 40%), radial-gradient(circle at 80% 70%, rgba(203,75,22,0.15), transparent 40%)' }} />
    ),
  },
  gradientMeshPop: {
    name: 'Gradient Mesh Pop',
    rootBg: 'bg-black',
    header: 'bg-white/10 backdrop-blur-xl shadow-lg border-b border-white/20',
    headerText: 'text-white',
    renderOverlay: ({ mx, my }) => (
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 20% 30%, rgba(34,211,238,0.25), transparent 35%), radial-gradient(circle at 80% 20%, rgba(244,63,94,0.25), transparent 35%), radial-gradient(circle at 60% 80%, rgba(250,204,21,0.25), transparent 35%)' }} />
    ),
  },
};

const Credits: React.FC = () => {
  const [mx, setMx] = useState(0);
  const [my, setMy] = useState(0);
  const { theme, setTheme, reduceMotion } = useTheme();
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { innerWidth, innerHeight } = window;
    const nx = e.clientX / innerWidth - 0.5;
    const ny = e.clientY / innerHeight - 0.5;
    setMx(nx);
    setMy(ny);
  };

  const isDark = themes[theme].headerText.includes('white');
  const footerShell = isDark ? 'bg-slate-900/60 backdrop-blur-xl border-t border-white/15' : 'bg-white/70 backdrop-blur-xl border-t border-gray-200';
  const footerText = isDark ? 'text-white/80' : 'text-gray-700';
  const btnNeutral = isDark
    ? 'bg-white/10 text-white border-white/15 hover:bg-white/15 focus-visible:ring-white/20'
    : 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100 focus-visible:ring-gray-200';
  const targetTheme: ThemeKey = theme === 'solarizedDuo' ? 'gradientMeshPop' : 'solarizedDuo';
  const targetLabel = targetTheme === 'solarizedDuo' ? 'Switch to Solarized Duo' : 'Switch to Gradient Mesh Pop';

  return (
  <div onMouseMove={handleMouseMove} className={`relative min-h-screen flex flex-col overflow-x-hidden transition-colors duration-700 ${themes[theme].rootBg}`}>
    {/* Themed background layers (z-0) */}
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
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse_at_center, rgba(0,0,0,0.35), transparent_60%)' }}
        />
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
        <div className="hidden md:flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 cursor-pointer h-full">
            <img
              src={isDark ? "/logo1dark.png" : "/logo1light.png"}
              alt="PrashnaSetu Logo"
              className="h-[90%] w-auto object-contain"
            />
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/">
              <button className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow focus-visible:ring-2 border transition cursor-pointer select-none ${btnNeutral}`}>
                <Home className="h-5 w-5" />
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
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between py-3 h-16">
          <Link to="/" className="flex items-center gap-2 cursor-pointer h-full">
            <img
              src={isDark ? "/logo1dark.png" : "/logo1light.png"}
              alt="PrashnaSetu Logo"
              className="h-[90%] w-auto object-contain"
            />
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/">
              <button className={`px-3 py-1 rounded font-semibold border ${isDark ? 'bg-white/10 text-white border-white/15' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>Home</button>
            </Link>
            <motion.button
              whileTap={reduceMotion ? undefined : { scale: 0.95 }}
              onClick={() => setTheme(targetTheme)}
              aria-label={targetLabel}
              className={`px-3 py-1 rounded font-semibold border ${isDark ? 'bg-white/10 text-white border-white/15' : 'bg-gray-50 text-gray-800 border-gray-200'}`}
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
    {/* Main Content - Split Profile Cards */}
    <main className="flex-1 flex flex-col items-center px-4 pt-24 pb-24 min-h-[calc(100vh-80px)] justify-center">
      <section className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {profiles.map((profile, idx) => (
          <div
            key={profile.name || idx}
            className="h-full flex flex-col items-center rounded-2xl shadow-md px-8 pt-6 pb-8 min-h-[440px] md:min-h-[520px] border border-indigo-200/60 bg-gradient-to-br from-white/70 to-indigo-50/60 backdrop-blur-xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] ring-0 hover:ring-2 hover:ring-indigo-400/70 transition-all duration-500 ease-out"
            style={{ transform: `translate3d(${(idx % 2 === 0 ? 1 : -1) * mx * 12}px, ${(idx % 2 === 0 ? 1 : -1) * my * 12}px, 0)` }}
          >
            {profile.profileUrl ? (
              <a href={profile.profileUrl} target="_blank" rel="noopener noreferrer">
                <img src={profile.photo} alt={profile.name} className="h-40 w-40 md:h-48 md:w-48 rounded-full object-cover border-4 border-indigo-200 shadow mb-5 hover:opacity-95 transition" />
              </a>
            ) : (
              <img src={profile.photo} alt={profile.name} className="h-40 w-40 md:h-48 md:w-48 rounded-full object-cover border-4 border-indigo-200 shadow mb-5" />
            )}
            {profile.profileUrl ? (
              <a href={profile.profileUrl} target="_blank" rel="noopener noreferrer" className="text-2xl font-bold text-indigo-700 mb-1 hover:underline">
                {profile.name}
              </a>
            ) : (
              <h2 className="text-2xl font-bold text-indigo-700 mb-1">{profile.name}</h2>
            )}
            <div className="text-indigo-500 font-semibold mb-2">{profile.role}</div>
            <div className="flex flex-col gap-1 text-gray-700 text-center mb-3">
              {profile.positions.map((pos, i) => (
                <div key={i}>
                  {pos === 'BML Munjal University' ? (
                    <a href="https://www.bmu.edu.in/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-700">
                      BML Munjal University
                    </a>
                  ) : (
                    pos
                  )}
                </div>
              ))}
            </div>
            {profile.email1 && (
              <div className="flex flex-col gap-1 w-full items-center mb-2">
                <a href={`mailto:${profile.email1}`} className="flex items-center gap-2 text-sm text-blue-700 underline hover:text-blue-900">
                  <Mail className="h-5 w-5 text-indigo-500" />
                  {profile.email1}
                </a>
              </div>
            )}
            <div className="flex gap-4 mt-2">
              {profile.linkedin && (
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-700 hover:text-blue-900 text-sm">
                  <Linkedin className="h-5 w-5" />
                  LinkedIn
                </a>
              )}
              {profile.scholar ? (
                <a href={profile.scholar} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-800 hover:text-black text-sm">
                  <GraduationCap className="h-5 w-5" />
                  Google Scholar
                </a>
              ) : (
                profile.github && (
                  <a href={profile.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-800 hover:text-black text-sm">
                    <Github className="h-5 w-5" />
                    GitHub
                  </a>
                )
              )}
            </div>
          </div>
        ))}
      </section>
    </main>
    {/* Copyright Footer - Desktop */}
    <div className={`hidden md:block fixed bottom-0 left-0 w-full ${footerShell} py-3 text-center text-xs ${footerText} z-50`}>
      <p>© Copyrighted by CAD-CS, BML Munjal University</p>
      <p className="flex items-center justify-center gap-2"><Mail className="h-4 w-4 text-indigo-500" /><a href="mailto:cadcs@bmu.edu.in" className="underline hover:text-blue-700">cadcs@bmu.edu.in</a></p>
    </div>
    {/* Copyright Footer - Mobile */}
    <div className={`md:hidden text-center text-xs py-4 ${footerShell} ${footerText}`}>
      <p>© Copyrighted by CAD-CS, BML Munjal University</p>
      <p className="flex items-center justify-center gap-2"><Mail className="h-4 w-4 text-indigo-500" /><a href="mailto:cadcs@bmu.edu.in" className="underline hover:text-blue-700">cadcs@bmu.edu.in</a></p>
    </div>
  </div>
  );
};

export default Credits;