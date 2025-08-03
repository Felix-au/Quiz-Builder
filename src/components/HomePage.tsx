import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const faqs = [
  {
    q: "What is PrashnaSetu?",
    a: "A modern quiz platform for competitive learning and exam practice."
  },
  {
    q: "How do I login?",
    a: "Click the Login button and sign in with your credentials."
  },
  {
    q: "Can I import/export quizzes?",
    a: "Yes, you can import and export quizzes using ZIP files."
  },
  {
    q: "Who can create quizzes?",
    a: "Admins, Instructors, and authorized users can create quizzes."
  },
  {
    q: "Are there user manuals?",
    a: "Yes, find manuals for Students, Admins, Instructors, and Proctors."
  },
  {
    q: "Is my data secure?",
    a: "Yes, your data is securely stored and accessible only to you."
  },
  {
    q: "How do I contact support?",
    a: "Email us at prashnasetu@gmail.com."
  },
  {
    q: "Does it support images?",
    a: "Yes, you can add images to your quiz questions."
  },
  {
    q: "Can I use it for exams?",
    a: "Absolutely! It is built for competitions and exams."
  },
  {
    q: "Is it free?",
    a: "Yes, PrashnaSetu is free for all users."
  }
];

const manuals = [
  { label: "Student Manual", href: "/manuals/student.pdf" },
  { label: "Admin Manual", href: "/manuals/admin.pdf" },
  { label: "Instructor Manual", href: "/manuals/instructor.pdf" },
  { label: "Proctor Manual", href: "/manuals/proctor.pdf" },
];
const downloads = [
  { label: "Faculty Zip", href: "/zip/student.pdf" },
  { label: "Result Zip", href: "/zip/admin.pdf" },
  { label: "Faculty Zip BMU", href: "/zip/instructor.pdf" },
  { label: "Result Zip BMU", href: "/zip/proctor.pdf" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 via-white to-indigo-100">
      <div className="w-full flex justify-end items-center pt-6 pr-8">
        <Link to="/login">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow-md hover:bg-indigo-700 transition"
          >
            Login
          </motion.button>
        </Link>
      </div>
      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-6 pb-8">
        <motion.img
          src="/logo2.png"
          alt="PrashnaSetu Logo"
          className="mb-4"
          style={{ maxWidth: '200px', height: 'auto' }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: "backOut" }}
        />
        <motion.h1
          className="text-4xl md:text-5xl font-bold text-indigo-700 mb-2 tracking-tight drop-shadow"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
        >
          PrashnaSetu
        </motion.h1>
        <motion.h2
          className="text-lg md:text-2xl text-indigo-500 mb-6 font-medium"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
        >
          Think. Compete. Conquer.
        </motion.h2>
        <motion.div
          className="flex flex-wrap gap-4 mb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="relative">
            <motion.div whileHover={{ scale: 1.04 }}>
              <details className="group">
                <summary className="px-4 py-2 rounded-lg bg-blue-100 text-indigo-700 font-medium shadow hover:bg-blue-200 transition border border-indigo-200 cursor-pointer select-none">
                  Downloads
                </summary>
                <div className="absolute z-10 mt-2 w-48 bg-white rounded-lg shadow-lg border border-indigo-100 group-open:block hidden">
                  {downloads.map((m) => (
                    <a
                      key={m.label}
                      href={m.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 text-indigo-700 hover:bg-indigo-50 rounded"
                    >
                      {m.label}
                    </a>
                  ))}
                </div>
              </details>
            </motion.div>
          </div>
          <a href="/credits">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-lg bg-green-100 text-green-700 font-medium shadow hover:bg-green-200 transition border border-green-200"
            >
              Developer Info
            </motion.button>
          </a>
          <div className="relative">
            <motion.div whileHover={{ scale: 1.04 }}>
              <details className="group">
                <summary className="px-4 py-2 rounded-lg bg-blue-100 text-indigo-700 font-medium shadow hover:bg-blue-200 transition border border-indigo-200 cursor-pointer select-none">
                  Manuals
                </summary>
                <div className="absolute z-10 mt-2 w-48 bg-white rounded-lg shadow-lg border border-indigo-100 group-open:block hidden">
                  {manuals.map((m) => (
                    <a
                      key={m.label}
                      href={m.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 text-indigo-700 hover:bg-indigo-50 rounded"
                    >
                      {m.label}
                    </a>
                  ))}
                </div>
              </details>
            </motion.div>
          </div>
        </motion.div>
        <motion.section
          className="w-full max-w-2xl mx-auto bg-white bg-opacity-80 rounded-xl shadow-lg p-6 mb-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.7 }}
        >
          <h3 className="text-xl font-semibold text-indigo-700 mb-4">FAQs</h3>
          <div className="space-y-3">
            {faqs.map((f, i) => (
                <motion.div
                  key={f.q}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.07, duration: 0.4 }}
                >
                  <details className="rounded-lg px-4 py-2 bg-indigo-50 hover:bg-indigo-100 transition group mb-2" key={f.q}>
                    <summary className="font-medium text-indigo-800 cursor-pointer select-none">
                      Q{i + 1}: {f.q}
                    </summary>
                    <div className="text-indigo-600 text-sm pl-2 mt-1">
                      {f.a}
                    </div>
                  </details>
                </motion.div>
              ))}
          </div>
        </motion.section>
      </main>
      <footer className="w-full text-center py-4 bg-indigo-50 border-t border-indigo-100 text-sm text-indigo-500 fixed bottom-0 left-0 z-50">
        <div className="hidden md:block fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 py-3 text-center text-xs text-gray-600 z-50">
          <p>© Copyrighted by CAD-CS, BML Munjal University</p>
          <p>📧 <a href="mailto:cadcs@bmu.edu.in" className="underline hover:text-blue-700">cadcs@bmu.edu.in</a></p>
        </div></footer>
    </div>
  );
}
