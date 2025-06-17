import React, { useState, useEffect } from 'react';
import { Typewriter } from 'react-simple-typewriter';

interface MousePosition {
  x: number;
  y: number;
}

const Mentor_session = () => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [srn, setSrn] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const steps = [
    { title: "Student Info", subtitle: "Let's start with the basics", field: "srn" },
    { title: "Session Date", subtitle: "When did this happen?", field: "date" },
    { title: "Session Notes", subtitle: "Tell us about the session", field: "notes" },
    { title: "Review", subtitle: "Everything looks good?", field: "review" }
  ];

  useEffect(() => {
    setIsVisible(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleNext = () => {
    if (currentStep === 0 && !srn) {
      alert('Please enter the Student SRN');
      return;
    }
    if (currentStep === 1 && !date) {
      alert('Please select a date');
      return;
    }
    if (currentStep === 2 && !notes) {
      alert('Please add some notes');
      return;
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log('Submitted Session:', { srn, date, notes });
    setSubmitted(true);
    setTimeout(() => {
      setSrn('');
      setDate('');
      setNotes('');
      setCurrentStep(0);
      setSubmitted(false);
    }, 3000);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">Student Information</h3>
              <p className="text-gray-400">Enter the student's registration number</p>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={srn}
                onChange={(e) => setSrn(e.target.value)}
                placeholder="PESXUGXXCSXXX"
                className="w-full px-6 py-4 text-xl text-center rounded-2xl bg-white/10 border-2 border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:bg-white/15 transition-all duration-300 backdrop-blur-sm"
              />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4M3 12h18m-9 5a3 3 0 106 0v1H6v-1a3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">Session Date</h3>
              <p className="text-gray-400">When did this mentoring session take place?</p>
            </div>
            <div className="space-y-4">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-6 py-4 text-xl text-center rounded-2xl bg-white/10 border-2 border-white/20 text-white focus:outline-none focus:border-green-500/50 focus:bg-white/15 transition-all duration-300 backdrop-blur-sm"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">Session Notes</h3>
              <p className="text-gray-400">Document the key points and outcomes</p>
            </div>
            <div className="space-y-4">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="• Key discussion points&#10;• Progress updates&#10;• Action items&#10;• Recommendations..."
                rows={8}
                className="w-full px-6 py-4 rounded-2xl bg-white/10 border-2 border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50 focus:bg-white/15 transition-all duration-300 backdrop-blur-sm resize-none"
              />
              <div className="text-right text-sm text-gray-500">
                {notes.length} characters
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">Review & Submit</h3>
              <p className="text-gray-400">Please review your session details</p>
            </div>
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">Student SRN:</span>
                  <span className="text-white font-mono">{srn}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">Date:</span>
                  <span className="text-white">{date}</span>
                </div>
                <div className="py-2">
                  <span className="text-gray-400 block mb-2">Notes:</span>
                  <div className="text-white text-sm bg-white/5 rounded-lg p-3 max-h-32 overflow-y-auto">
                    {notes}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Background - keeping your original */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute h-full w-full animate-wave"
            style={{
              backgroundImage: 'linear-gradient(to right, rgba(168, 85, 247, 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(168, 85, 247, 0.3) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>
        
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-40 blur-xl animate-float"
            style={{
              width: `${Math.random() * 200 + 100}px`,
              height: `${Math.random() * 200 + 100}px`,
              background: `radial-gradient(circle, ${
                ['rgba(59, 130, 246, 0.4)', 'rgba(168, 85, 247, 0.4)', 'rgba(16, 185, 129, 0.4)', 'rgba(245, 101, 101, 0.4)'][i % 4]
              } 0%, transparent 70%)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
            }}
          />
        ))}

        {[...Array(3)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full animate-shooting-star opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 50}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: '3s',
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0">
        <div
          className="pointer-events-none fixed transition-all duration-300 ease-out"
          style={{
            left: `${mousePosition.x}px`,
            top: `${mousePosition.y}px`,
            transform: 'translate(-50%, -50%)',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, rgba(59, 130, 246, 0.1) 50%, transparent 70%)',
            filter: 'blur(1px)',
          }}
        />
      </div>

      <div className={`relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        {/* Header */}
        <div className="text-center space-y-6 mb-12">
          <h1 className="text-6xl md:text-7xl font-bold text-white">
            <Typewriter
              words={['Mentor Session']}
              loop={1}
              cursor
              cursorStyle="|"
              typeSpeed={120}
              deleteSpeed={50}
              delaySpeed={1000}
            />
          </h1>
          <p className="text-lg text-gray-300 max-w-md mx-auto">
            Step-by-step session documentation
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4 mb-12">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                index <= currentStep 
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white scale-110' 
                  : 'bg-white/20 text-gray-400'
              }`}>
                {index < currentStep ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-sm font-bold">{index + 1}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-1 mx-2 transition-all duration-300 ${
                  index < currentStep ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-white/20'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Main Card */}
        <div className="w-full max-w-lg">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-3xl blur opacity-25 animate-pulse"></div>
            
            <div className="relative bg-gray-900/60 backdrop-blur-xl border border-white/20 rounded-3xl p-8 min-h-[500px] flex flex-col justify-between shadow-2xl">
              {/* Step Content */}
              <div className="flex-1">
                {renderStepContent()}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/10">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="px-6 py-3 rounded-xl bg-white/10 text-white font-medium transition-all duration-300 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                >
                  ← Previous
                </button>

                {currentStep === steps.length - 1 ? (
                  <button
                    onClick={handleSubmit}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold transition-all duration-300 hover:from-purple-500 hover:to-blue-500 hover:scale-105 active:scale-95 shadow-lg"
                  >
                    Submit Session
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold transition-all duration-300 hover:from-purple-500 hover:to-blue-500 hover:scale-105 active:scale-95 shadow-lg"
                  >
                    Next →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {submitted && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-gray-900/90 backdrop-blur-xl border border-green-500/30 rounded-3xl p-8 max-w-md mx-4 text-center">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Success!</h3>
              <p className="text-gray-300 mb-6">Your mentoring session has been successfully recorded and saved.</p>
              <div className="text-sm text-gray-400">Redirecting in a moment...</div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 w-full text-center text-gray-400 text-sm mb-4 z-10">
        <div className="backdrop-blur-sm bg-gray-900/20 rounded-lg mx-auto inline-block px-4 py-2">
          Made with <span className="text-pink-500">🩵</span> by{' '}
          <a 
            href="https://github.com/nocap-placify" 
            className="text-purple-400 hover:text-purple-300 underline transition-colors duration-300"
          >
            nocap-placify
          </a>
        </div>
      </footer>

      <style jsx>{`
        @keyframes wave {
          0% { background-position: 0 0; }
          50% { background-position: 30px 30px; }
          100% { background-position: 0 0; }
        }
        
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }
        
        @keyframes shooting-star {
          0% { transform: translateX(-100px) translateY(0px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(300px) translateY(-200px); opacity: 0; }
        }
        
        .animate-wave {
          animation: wave 12s infinite linear;
        }
        
        .animate-float {
          animation: float 20s infinite ease-in-out;
        }
        
        .animate-shooting-star {
          animation: shooting-star 3s infinite linear;
        }
        
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.3);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.5);
        }
      `}</style>
    </div>
  );
};

export default Mentor_session;