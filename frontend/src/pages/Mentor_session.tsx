import React, { useState, useEffect } from 'react';

interface MousePosition {
  x: number;
  y: number;
}

const Mentor_session = () => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [srn, setSrn] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!srn || !date || !notes) {
      alert('Please fill out all fields.');
      return;
    }

    // For now, just log the values. You can replace this with an API call.
    console.log('Submitted Session:', { srn, date, notes });
    setSubmitted(true);

    // Reset the form
    setSrn('');
    setDate('');
    setNotes('');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Background animations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute h-full w-full animate-wave"
            style={{
              backgroundImage:
                'linear-gradient(to right, purple 1px, transparent 1px), linear-gradient(to bottom, purple 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }}
          />
        </div>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-30 blur-xl animate-float"
            style={{
              width: `${Math.random() * 300 + 100}px`,
              height: `${Math.random() * 300 + 100}px`,
              background:
                'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(168, 85, 247, 0) 70%)',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-20 animate-pulse"
            style={{
              width: `${Math.random() * 300 + 100}px`,
              height: `${Math.random() * 300 + 100}px`,
              background:
                'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, rgba(168, 85, 247, 0) 70%)',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Mouse follower effect */}
      <div className="absolute inset-0">
        <div
          className="pointer-events-none fixed transition-transform duration-100 ease-out"
          style={{
            left: `${mousePosition.x}px`,
            top: `${mousePosition.y}px`,
            transform: 'translate(-50%, -50%)',
            width: '400px',
            height: '400px',
            background:
              'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, rgba(168, 85, 247, 0) 70%)',
          }}
        />
      </div>

      {/* Content area */}
      <div className={`relative z-10 flex min-h-screen flex-col items-center justify-center px-4 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <h1 className="text-white text-4xl font-bold mb-6">Mentor Session</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white bg-opacity-10 p-6 rounded-xl backdrop-blur-md w-full max-w-md"
        >
          <div className="mb-4">
            <label className="block text-white mb-1 font-medium">Student SRN</label>
            <input
              type="text"
              value={srn}
              onChange={(e) => setSrn(e.target.value)}
              placeholder="PESXUGXXCSXXX"
              className="w-full px-3 py-2 rounded bg-white bg-opacity-20 text-white placeholder-gray-300 focus:outline-none"
            />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-1 font-medium">Session Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded bg-white bg-opacity-20 text-white focus:outline-none"
            />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-1 font-medium">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write mentor notes here..."
              rows={4}
              className="w-full px-3 py-2 rounded bg-white bg-opacity-20 text-white placeholder-gray-300 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded transition"
          >
            Submit
          </button>
          {submitted && (
            <p className="text-green-300 text-sm mt-3">Session submitted successfully!</p>
          )}
        </form>
      </div>

      <style jsx>{`
        @keyframes wave {
          0% {
            background-position: 0 0;
          }
          50% {
            background-position: 25px 25px;
          }
          100% {
            background-position: 0 0;
          }
        }

        .animate-wave {
          animation: wave 8s infinite linear;
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(30px, -30px);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.4;
          }
        }

        .animate-float {
          animation: float 15s infinite ease-in-out;
        }

        .animate-pulse {
          animation: pulse 5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Mentor_session;
