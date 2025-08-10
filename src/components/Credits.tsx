import React, { useState } from 'react';
import { Home, Mail, Linkedin, Github, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    photo: '/profiles/profile2.jpg',
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

const Credits: React.FC = () => {
  const [mx, setMx] = useState(0);
  const [my, setMy] = useState(0);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { innerWidth, innerHeight } = window;
    const nx = e.clientX / innerWidth - 0.5;
    const ny = e.clientY / innerHeight - 0.5;
    setMx(nx);
    setMy(ny);
  };

  return (
  <div onMouseMove={handleMouseMove} className="relative min-h-screen flex flex-col overflow-x-hidden bg-gradient-to-br from-slate-800 via-indigo-900 to-blue-950">
    {/* Aurora background with parallax blobs */}
    <div className="pointer-events-none select-none fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-indigo-900 to-blue-950"></div>
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_rgba(79,70,229,0.45),_transparent_60%)]"></div>
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute -top-16 -left-16 w-80 h-80 bg-indigo-500/40 rounded-full blur-3xl" style={{ transform: `translate3d(${mx * 40}px, ${my * 40}px, 0)`, transition: 'transform 0.25s ease-out' }}></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/45 rounded-full blur-3xl" style={{ transform: `translate3d(${mx * -48}px, ${my * -48}px, 0)`, transition: 'transform 0.25s ease-out' }}></div>
    </div>
    {/* Header (lighter) */}
    <div className="bg-gradient-to-r from-blue-200 via-indigo-100 to-blue-300/90 backdrop-blur-md shadow-lg border-b fixed top-0 left-0 w-full z-40 transition-all duration-300">
      <div className="container flex flex-col justify-center px-4">
        <div className="hidden md:flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 cursor-pointer">
            <img src="/logo2.png" alt="PrashnaSetu Logo" className="h-12 w-12 object-contain" />
            <div className="flex flex-col justify-center">
              <h1 className="text-lg font-semibold leading-tight text-black">PrashnaSetu</h1>
              <span className="text-xs text-black leading-tight">Think. Compete. Conquer.</span>
            </div>
          </Link>
          <Link to="/">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-semibold shadow hover:bg-indigo-100 focus:ring-2 focus:ring-indigo-300 transition border border-indigo-100 cursor-pointer select-none">
              <Home className="h-5 w-5" />
              Home
            </button>
          </Link>
        </div>
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between py-3">
          <Link to="/" className="flex items-center gap-2 cursor-pointer">
            <img src="/logo2.png" alt="PrashnaSetu Logo" className="h-8 w-8 object-contain" />
            <div className="flex flex-col">
              <h1 className="text-sm font-semibold leading-tight text-black">PrashnaSetu</h1>
              <span className="text-xs text-black leading-tight">Think. Compete. Conquer.</span>
            </div>
          </Link>
          <Link to="/">
            <button className="flex items-center gap-2 px-3 py-1 rounded bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">Home</button>
          </Link>
        </div>
      </div>
    </div>
    {/* Main Content - Split Profile Cards */}
    <main className="flex-1 flex flex-col items-center justify-center px-4 pt-36 pb-8">
      <section className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {profiles.map((profile, idx) => (
          <div
            key={profile.name || idx}
            className="h-full flex flex-col items-center rounded-2xl shadow-md p-10 min-h-[440px] md:min-h-[520px] border border-indigo-200/60 bg-gradient-to-br from-white/70 to-indigo-50/60 backdrop-blur-xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] ring-0 hover:ring-2 hover:ring-indigo-400/70 transition-all duration-500 ease-out"
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
    <div className="hidden md:block fixed bottom-0 left-0 w-full bg-gradient-to-r from-blue-200/70 via-indigo-200/60 to-blue-300/70 backdrop-blur-md border-t border-indigo-200/60 py-3 text-center text-xs text-black z-50">
    <p>© Copyrighted by CAD-CS, BML Munjal University</p>
    <p className="flex items-center justify-center gap-2"><Mail className="h-4 w-4 text-indigo-500" /><a href="mailto:cadcs@bmu.edu.in" className="underline hover:text-blue-700">cadcs@bmu.edu.in</a></p>
    </div>
    {/* Copyright Footer - Mobile */}
    <div className="md:hidden text-center text-xs text-black py-4 bg-gradient-to-r from-blue-200/70 via-indigo-200/60 to-blue-300/70 backdrop-blur-md border-t border-indigo-200/60">
    <p>© Copyrighted by CAD-CS, BML Munjal University</p>
    <p className="flex items-center justify-center gap-2"><Mail className="h-4 w-4 text-indigo-500" /><a href="mailto:cadcs@bmu.edu.in" className="underline hover:text-blue-700">cadcs@bmu.edu.in</a></p>
    </div>
  </div>
  );
};

export default Credits;