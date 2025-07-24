import React from 'react';

const Credits: React.FC = () => (
  <div className="min-h-screen bg-background">
    {/* Desktop Layout - Split Screen */}
    <div className="hidden md:flex flex-col min-h-screen">
      <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-screen-xl grid grid-cols-2 shadow-xl rounded-lg overflow-hidden bg-white">
          {/* Left Branding Section */}
          <div className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-200 to-gray-400 text-gray-900 p-8 h-full min-h-screen w-full">
            <div className="text-center max-w-xs mx-auto">
              <img src="/logo23.png" alt="PrashnaSetu Logo" className="mx-auto h-56 w-56 object-contain" />
              <p className="text-base opacity-80 -mt-2 leading-tight">PrashnaSetu is a modern, full-screen quiz app that presents randomized questions with images, and provides real-time monitoring to ensure academic integrity.</p>
            </div>
          </div>
          {/* Right Info Section */}
          <div className="flex items-center justify-center bg-background p-8">
            <div className="w-full max-w-md">
              <h1 className="text-2xl font-bold mb-4">Developer Info & Credits</h1>
              <div className="mb-6">
                <p className="mb-2">Developed under the institute:</p>
                <div className="font-semibold">Advanced Data and Computational Science (CAD-CS)</div>
              </div>
              <div className="mb-6">
                <div className="font-bold">Kiran Sharma</div>
                <div>Assistant Professor,<br />School of Engineering & Technology</div>
                <div>Head of CAD CS</div>
                <div>Email: <a href="mailto:kiran.sharma@bmu.edu.in" className="text-blue-600 underline">kiran.sharma@bmu.edu.in</a></div>
              </div>
              <div className="mb-6">
                <div className="font-bold">by Harshit Soni</div>
                <div>Email: <a href="mailto:kharshit.soni.23cse@bmu.edu.in" className="text-blue-600 underline">kharshit.soni.23cse@bmu.edu.in</a></div>
                <div>GitHub: <a href="https://github.com/Felix-au" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">https://github.com/Felix-au</a></div>
              </div>
              <div className="text-xs text-gray-400 mt-8">&copy; {new Date().getFullYear()} CAD-CS, BML Munjal University</div>
            </div>
          </div>
        </div>
      </div>
      {/* Copyright Footer Full-width - Desktop */}
      <div className="hidden md:block fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 py-3 text-center text-xs text-gray-600 z-50">
        <p>© Copyrighted by CAD-CS, BML Munjal University</p>
        <p><a href="mailto:cadcs@bmu.edu.in" className="underline hover:text-blue-700">cadcs@bmu.edu.in</a></p>
      </div>
    </div>
    {/* Mobile Layout - Stacked */}
    <div className="md:hidden">
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-200 to-gray-400 text-gray-900 p-8 relative">
        <div className="text-center max-w-xs mx-auto">
          <img src="/logo23.png" alt="PrashnaSetu Logo" className="mx-auto h-48 w-48 object-contain" />
          <p className="text-sm opacity-80 -mt-2 leading-tight">PrashnaSetu is a modern, full-screen quiz app that presents randomized questions with images, and provides real-time monitoring to ensure academic integrity.</p>
        </div>
      </div>
      <div className="min-h-screen bg-background flex flex-col justify-center p-4">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            <h1 className="text-2xl font-bold mb-4">Developer Info & Credits</h1>
            <div className="mb-6">
              <p className="mb-2">Developed under the institute:</p>
              <div className="font-semibold">Advanced Data and Computational Science (CAD-CS)</div>
            </div>
            <div className="mb-6">
              <div className="font-bold">Kiran Sharma</div>
              <div>Assistant Professor,<br />School of Engineering & Technology</div>
              <div>Head of CAD CS</div>
              <div>Email: <a href="mailto:kiran.sharma@bmu.edu.in" className="text-blue-600 underline">kiran.sharma@bmu.edu.in</a></div>
            </div>
            <div className="mb-6">
              <div className="font-bold">by Harshit Soni</div>
              <div>Email: <a href="mailto:kharshit.soni.23cse@bmu.edu.in" className="text-blue-600 underline">kharshit.soni.23cse@bmu.edu.in</a></div>
              <div>GitHub: <a href="https://github.com/Felix-au" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">https://github.com/Felix-au</a></div>
            </div>
            <div className="text-xs text-gray-400 mt-8">&copy; {new Date().getFullYear()} CAD-CS, BML Munjal University</div>
          </div>
        </div>
        {/* Copyright Footer - Mobile */}
        <div className="text-center text-xs text-gray-600 py-4">
          <p>© Copyrighted by CAD-CS, BML Munjal University</p>
          <p><a href="mailto:cadcs@bmu.edu.in" className="underline hover:text-blue-700">cadcs@bmu.edu.in</a></p>
        </div>
      </div>
    </div>
  </div>
);

export default Credits; 