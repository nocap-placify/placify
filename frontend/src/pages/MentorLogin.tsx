import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import user from '../assets/user.svg';

export const MentorLogin = () => {
    const [mentorId, setMentorId] = useState('');
    const [password, setPassword] = useState('');
    const [isInputActive, setIsInputActive] = useState(false);
    const [showShakeAnimation, setShowShakeAnimation] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [scale, setScale] = useState(1);
    const inputRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const handleSubmit = async () => {
        if (!mentorId.trim()) {
            setShowShakeAnimation(true);
            setTimeout(() => setShowShakeAnimation(false), 400);
            return;
        }

        try {
            // Example API call for mentor authentication
            const encryptedPassword = btoa(password); // Simplified encoding
            const response = await axios.get(`http://100.102.21.101:8000/mentorLogin?mentorId=${mentorId}&password=${encryptedPassword}`);
            const mentorName = response.data;

            if (!mentorName) {
                setShowShakeAnimation(true);
                setTimeout(() => setShowShakeAnimation(false), 400);
                return;
            }

            navigate('/mentor-session', { state: { mentorId, mentorName } });
        } catch (error) {
            setShowShakeAnimation(true);
            setTimeout(() => setShowShakeAnimation(false), 400);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    useEffect(() => {
        setIsVisible(true);
        const handleResize = () => {
            const scaleX = window.innerWidth / 600;
            const scaleY = window.innerHeight / 400;
            setScale(Math.min(scaleX, scaleY, 1));
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="relative min-h-screen overflow-hidden bg-black">
            {/* Background animation layers */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute h-full w-full animate-wave"
                    style={{
                        backgroundImage: 'linear-gradient(to right, purple 1px, transparent 1px), linear-gradient(to bottom, purple 1px, transparent 1px)',
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
                        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(168, 85, 247, 0) 70%)',
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
                        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, rgba(168, 85, 247, 0) 70%)',
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 5}s`,
                    }}
                />
            ))}

            <div className={`absolute inset-0 ${isInputActive ? 'backdrop-blur-lg' : ''}`}>
                <div className={`relative z-10 flex min-h-screen flex-col items-center justify-center px-4 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
 
                    <h1 className="typewriter font-bold text-white" style={{ fontSize: '3.5rem', transform: 'translateY(-60px)' }}>Mentor Login</h1>

                    {/* Mentor ID Input */}
                    <div className="mt-8 relative w-80">
                        <input
                            type="text"
                            ref={inputRef}
                            value={mentorId}
                            onChange={(e) => setMentorId(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setIsInputActive(true)}
                            onBlur={() => setIsInputActive(false)}
                            className={`w-full p-4 rounded-full bg-white bg-opacity-20 text-white text-lg pl-5 pr-16 focus:outline-none ${showShakeAnimation ? 'shake' : ''}`}
                            placeholder="Enter your Mentor ID"
                            style={{
                                border: showShakeAnimation ? '1px solid red' : '1px solid rgba(255, 255, 255, 0.5)',
                                transition: 'border-color 0.3s ease',
                            }}
                        />
                    </div>

                    {/* Optional: Password Input */}
                    <div className="mt-4 relative w-80">
                        <input
                            type="password"
                            ref={passwordRef}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setIsInputActive(true)}
                            onBlur={() => setIsInputActive(false)}
                            className="w-full p-4 rounded-full bg-white bg-opacity-20 text-white text-lg pl-5 pr-16 focus:outline-none"
                            placeholder="Enter your password"
                            style={{
                                border: '1px solid rgba(255, 255, 255, 0.5)',
                                transition: 'border-color 0.3s ease',
                            }}
                        />
                        <button
                            onClick={handleSubmit}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white bg-purple-600 hover:bg-purple-700 p-2 rounded-full shadow-lg transition duration-300 ease-in-out"
                            style={{ width: '40px', height: '40px' }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Footer */}
                    <footer className="absolute bottom-0 w-full text-center text-gray-500 text-sm mb-4" style={{ opacity: 0.7 }}>
                        Made with <span className="text-pink-500">🩵</span> by <a href="https://github.com/nocap-placify" className="underline">nocap-placify</a>.
                    </footer>
                </div>
            </div>

            {/* Animations */}
            <style jsx>{`
                .shake {
                    animation: shake 0.4s ease;
                }

                @keyframes wave {
                    0%, 100% { background-position: 0 0; }
                    50% { background-position: 25px 25px; }
                }

                .animate-wave {
                    animation: wave 8s infinite linear;
                }

                @keyframes float {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(30px, -30px); }
                }

                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 0.2; }
                    50% { transform: scale(1.2); opacity: 0.4; }
                }

                @keyframes shake {
                    0% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    50% { transform: translateX(5px); }
                    75% { transform: translateX(-5px); }
                    100% { transform: translateX(0); }
                }

                .typewriter {
                    overflow: hidden;
                    white-space: nowrap;
                    width: 12ch;
                    border-right: 3px solid rgba(168, 85, 247, 0.8);
                    animation: typing 1s steps(12, end), blink 0.4s step-end infinite;
                }

                @keyframes typing {
                    from { width: 0; }
                    to { width: 12ch; }
                }

                @keyframes blink {
                    50% { border-color: transparent; }
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

export default MentorLogin;
