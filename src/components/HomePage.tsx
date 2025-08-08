import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import VideoGallery from "./VideoGallery";

const faqs = [
  { q: "What is PrashnaSetu?", a: "A modern quiz platform for competitive learning and exam practice." },
  { q: "How do I login?", a: "Click the Login button and sign in with your credentials." },
  { q: "Can I import/export quizzes?", a: "Yes, you can import and export quizzes using ZIP files." },
  { q: "Who can create quizzes?", a: "Admins, Instructors, and authorized users can create quizzes." },
  { q: "Are there user manuals?", a: "Yes, find manuals for Students, Admins, Instructors, and Proctors." },
  { q: "Is my data secure?", a: "Yes, your data is securely stored and accessible only to you." },
  { q: "How do I contact support?", a: "Email us at prashnasetu@gmail.com." },
  { q: "Does it support images?", a: "Yes, you can add images to your quiz questions." },
  { q: "Can I use it for exams?", a: "Absolutely! It is built for competitions and exams." },
  { q: "Is it free?", a: "Yes, PrashnaSetu is free for all users." }
];

const manuals = [
  { label: "Student Manual", href: "/manuals/PrashnaSetu-Application-User-Guide_Student.pdf" },
  { label: "Admin Manual", href: "/manuals/PrashnaSetu-Application-User-Guide_Admin.pdf" },
  { label: "Instructor Manual", href: "/manuals/PrashnaSetu-Application-User-Guide_Instructor.pdf" },
  { label: "Proctor Manual", href: "/manuals/PrashnaSetu-Application-User-Guide_Proctor.pdf" },
  { label: "Website Manual", href: "/manuals/website.pdf" },
];

const downloads = [
  { label: "Faculty Zip", href: "/zip/student.pdf" },
  { label: "Result Zip", href: "/zip/admin.pdf" },
];

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

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden bg-gradient-to-br from-blue-100 via-indigo-100 to-blue-300">
  {/* Main bluish gradient background applied to whole page */}
  {/* Optionally keep a subtle overlay for depth, but remove color blobs for a cleaner look */}
  <div className="pointer-events-none select-none fixed inset-0 -z-10 bg-gradient-to-br from-blue-200 via-indigo-100 to-blue-400"></div>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-200 via-indigo-100 to-blue-300/90 backdrop-blur-md shadow-lg border-b fixed top-0 left-0 w-full z-40 transition-all duration-300">
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
              <div className="relative"
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
              <div className="relative"
  onMouseEnter={handleManualsEnter}
  onMouseLeave={handleManualsLeave}
>
  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 text-amber-800 font-semibold shadow hover:bg-amber-100 focus:ring-2 focus:ring-amber-300 transition border border-amber-100 cursor-pointer select-none">
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h9" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 3.5l2 2-8.5 8.5H8.5v-2l8.5-8.5z" /></svg>
  Manuals
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
  Credits & Contact
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
              <div className="relative"
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
              <div className="relative"
  onMouseEnter={handleManualsEnter}
  onMouseLeave={handleManualsLeave}
>
  <button className="px-3 py-1 rounded bg-gray-100 text-black font-medium border border-gray-200 cursor-pointer select-none">Manuals</button>
  <div className={`absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-indigo-100 z-50 ${manualsOpen ? 'block' : 'hidden'}`}>
    {manuals.map((m) => (
      <a key={m.label} href={m.href} target="_blank" rel="noopener noreferrer" className="block px-3 py-1 text-black hover:bg-gray-100 rounded">{m.label}</a>
    ))}
  </div>
</div>
              <Link to="/credits">
                <button className="px-3 py-1 rounded bg-green-100 text-green-700 font-medium border border-green-200">Credits & Contact</button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-36 pb-8">
  {/* App Info Section */}
  <section className="w-full max-w-2xl mx-auto bg-white/60 backdrop-blur-lg rounded-2xl shadow-2xl p-10 mb-10 flex flex-col items-center text-center border border-white/40">
    <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">PrashnaSetu</h1>
    <h2 className="text-lg md:text-xl font-semibold text-black mb-3">Think. Compete. Conquer.</h2>
    <p className="text-gray-700 mb-6">PrashnaSetu is a modern, full-screen quiz app that presents randomized questions with images, and provides real-time monitoring to ensure academic integrity.</p>
    <Link to="/home">
      <button className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-600 text-white font-semibold shadow-lg hover:from-indigo-600 hover:to-blue-700 focus:ring-2 focus:ring-indigo-300 transition text-lg">
  Start Creating Quiz
</button>
    </Link>
  </section>
  {/* Video Gallery */}
  <VideoGallery />
  {/* FAQ Accordion */}
  <FAQAccordion data={faqs} />
</main>

      {/* Footer Desktop */}
      <div className="hidden md:block fixed bottom-0 left-0 w-full bg-gradient-to-r from-blue-200 via-indigo-100 to-blue-300/90 border-t border-indigo-100 py-3 text-center text-xs text-gray-700 z-50 shadow-lg">
        <p>© Copyrighted by CAD-CS, BML Munjal University</p>
        <p className="flex items-center justify-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5A2.25 2.25 0 0 1 19.5 19.5h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-.96 1.85l-7.29 5.063a2.25 2.25 0 0 1-2.52 0L2.46 8.843a2.25 2.25 0 0 1-.96-1.85V6.75"/></svg><a href="mailto:cadcs@bmu.edu.in" className="underline hover:text-blue-700">cadcs@bmu.edu.in</a></p>
        </div>

      {/* Footer Mobile */}
      <div className="md:hidden text-center text-xs text-gray-700 mt-6 mb-2 bg-gradient-to-r from-blue-200 via-indigo-100 to-blue-300/90 py-3 border-t border-indigo-100 shadow">
        <p>© Copyrighted by CAD-CS, BML Munjal University</p>
        <p className="flex items-center justify-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5A2.25 2.25 0 0 1 19.5 19.5h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-.96 1.85l-7.29 5.063a2.25 2.25 0 0 1-2.52 0L2.46 8.843a2.25 2.25 0 0 1-.96-1.85V6.75"/></svg><a href="mailto:cadcs@bmu.edu.in" className="underline hover:text-blue-700">cadcs@bmu.edu.in</a></p>
        </div>
    </div>
  );
}
