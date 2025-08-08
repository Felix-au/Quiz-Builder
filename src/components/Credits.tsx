import React from 'react';
import { Link } from 'react-router-dom';

const profiles = [
  {
    photo: '/profiles/profile1.png',
    name: 'Kiran Sharma',
    role: 'Team Lead',
    positions: [
      'Assistant Professor, SOET',
      'Head of Center for Advanced Data and Computational Science',
      'BML Munjal University'
    ],
    email1: 'kiran.sharma@bmu.edu.in',
    email2: 'cadcs@bmu.edu.in',
    linkedin: 'https://www.linkedin.com/in/kiran-sharma-754658180/',
    github: 'https://github.com/SharmaKiran',
  },
  {
    photo: '/profiles/profile2.png',
    name: 'Harshit Soni',
    role: 'Developer',
    positions: [
      'BTech CSE 2023-2027',
      'BML Munjal University'
    ],
    email1: 'harshit.soni.23cse@bmu.edu.in',
    email2: 'mailtoh.soni@gmail.com',
    linkedin: 'https://www.linkedin.com/in/harshit-soni-781a77274/',
    github: 'https://github.com/Felix-au',
  },
];

const Credits: React.FC = () => (
  <div className="relative min-h-screen flex flex-col overflow-x-hidden bg-gradient-to-br from-blue-100 via-indigo-100 to-blue-300">
    {/* Background overlay for extra depth */}
    <div className="pointer-events-none select-none fixed inset-0 -z-10 bg-gradient-to-br from-blue-200 via-indigo-100 to-blue-400"></div>
    {/* Header (same as HomePage, but with Home button) */}
    <div className="bg-gradient-to-r from-blue-200 via-indigo-100 to-blue-300/90 backdrop-blur-md shadow-lg border-b fixed top-0 left-0 w-full z-40 transition-all duration-300">
      <div className="container flex flex-col justify-center px-4">
        <div className="hidden md:flex items-center justify-between h-20">
          <div className="flex items-center gap-3 cursor-pointer">
            <img src="/logo2.png" alt="PrashnaSetu Logo" className="h-12 w-12 object-contain" />
            <div className="flex flex-col justify-center">
              <h1 className="text-lg font-semibold leading-tight text-black">PrashnaSetu</h1>
              <span className="text-xs text-black leading-tight">Think. Compete. Conquer.</span>
            </div>
          </div>
          <Link to="/">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-semibold shadow hover:bg-indigo-100 focus:ring-2 focus:ring-indigo-300 transition border border-indigo-100 cursor-pointer select-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" /></svg>
              Home
            </button>
          </Link>
        </div>
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between py-3">
          <div className="flex items-center gap-2 cursor-pointer">
            <img src="/logo2.png" alt="PrashnaSetu Logo" className="h-8 w-8 object-contain" />
            <div className="flex flex-col">
              <h1 className="text-sm font-semibold leading-tight text-black">PrashnaSetu</h1>
              <span className="text-xs text-black leading-tight">Think. Compete. Conquer.</span>
            </div>
          </div>
          <Link to="/">
            <button className="flex items-center gap-2 px-3 py-1 rounded bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">Home</button>
          </Link>
        </div>
      </div>
    </div>
    {/* Main Content - Split Profile Cards */}
    <main className="flex-1 flex flex-col items-center justify-center px-4 pt-36 pb-8">
      <section className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/60 backdrop-blur-lg rounded-2xl shadow-2xl p-10 border border-white/40">
        {profiles.map((profile, idx) => (
          <div
            key={profile.email1}
            className="flex flex-col items-center bg-white/80 rounded-xl shadow-md p-10 min-h-[440px] md:min-h-[520px] border border-indigo-100 hover:shadow-xl transition-all duration-200"
          >
            <img src={profile.photo} alt={profile.name} className="h-40 w-40 md:h-48 md:w-48 rounded-full object-cover border-4 border-indigo-200 shadow mb-5" />
            <h2 className="text-2xl font-bold text-indigo-700 mb-1">{profile.name}</h2>
            <div className="text-indigo-500 font-semibold mb-2">{profile.role}</div>
            <div className="flex flex-col gap-1 text-gray-700 text-center mb-3">
              {profile.positions.map((pos, i) => (
                <div key={i}>{pos}</div>
              ))}
            </div>
            <div className="flex flex-col gap-1 w-full items-center mb-2">
              <a href={`mailto:${profile.email1}`} className="flex items-center gap-2 text-sm text-blue-700 underline hover:text-blue-900">
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5A2.25 2.25 0 0 1 19.5 19.5h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-.96 1.85l-7.29 5.063a2.25 2.25 0 0 1-2.52 0L2.46 8.843a2.25 2.25 0 0 1-.96-1.85V6.75"/></svg>
  {profile.email1}
</a>
              <a href={`mailto:${profile.email2}`} className="flex items-center gap-2 text-sm text-blue-700 underline hover:text-blue-900">
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5A2.25 2.25 0 0 1 19.5 19.5h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-.96 1.85l-7.29 5.063a2.25 2.25 0 0 1-2.52 0L2.46 8.843a2.25 2.25 0 0 1-.96-1.85V6.75"/></svg>
  {profile.email2}
</a>
            </div>
            <div className="flex gap-4 mt-2">
              {profile.linkedin && (
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-700 hover:text-blue-900 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm15.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.757 1.379-1.557 2.841-1.557 3.04 0 3.603 2.002 3.603 4.604v5.586zm-11-10h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75z"/></svg>
                  LinkedIn
                </a>
              )}
              {profile.github && (
                <a href={profile.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-800 hover:text-black text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.084-.729.084-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.334-5.466-5.93 0-1.31.47-2.38 1.236-3.22-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.242 2.873.119 3.176.77.84 1.235 1.91 1.235 3.22 0 4.609-2.803 5.624-5.475 5.921.43.371.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.694.825.576 4.765-1.587 8.199-6.084 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  GitHub
                </a>
              )}
            </div>
          </div>
        ))}
      </section>
    </main>
    {/* Copyright Footer - Desktop */}
    <div className="hidden md:block fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 py-3 text-center text-xs text-gray-600 z-50">
    <p>© Copyrighted by CAD-CS, BML Munjal University</p>
    <p className="flex items-center justify-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5A2.25 2.25 0 0 1 19.5 19.5h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-.96 1.85l-7.29 5.063a2.25 2.25 0 0 1-2.52 0L2.46 8.843a2.25 2.25 0 0 1-.96-1.85V6.75"/></svg><a href="mailto:cadcs@bmu.edu.in" className="underline hover:text-blue-700">cadcs@bmu.edu.in</a></p>
    </div>
    {/* Copyright Footer - Mobile */}
    <div className="md:hidden text-center text-xs text-gray-600 py-4 bg-white border-t border-gray-200">
    <p>© Copyrighted by CAD-CS, BML Munjal University</p>
    <p className="flex items-center justify-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5A2.25 2.25 0 0 1 19.5 19.5h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-.96 1.85l-7.29 5.063a2.25 2.25 0 0 1-2.52 0L2.46 8.843a2.25 2.25 0 0 1-.96-1.85V6.75"/></svg><a href="mailto:cadcs@bmu.edu.in" className="underline hover:text-blue-700">cadcs@bmu.edu.in</a></p>
    </div>
  </div>
);

export default Credits;