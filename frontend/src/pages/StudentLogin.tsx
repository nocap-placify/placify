import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Typewriter } from 'react-simple-typewriter';
import * as forge from 'node-forge';

interface MousePosition {
    x: number;
    y: number;
}

export const StudentLogin = () => {
    const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
    const [isInputActive, setIsInputActive] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [passwordValue, setPasswordValue] = useState('');
    const [isInputValid, setIsInputValid] = useState(true);
    const [showShakeAnimation, setShowShakeAnimation] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [scale, setScale] = useState(1);
    const [hoveredButton, setHoveredButton] = useState(false);
    const navigate = useNavigate();

    const inputRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    const validateInput = (value: string) => /^PES[1-2]UG[0-9]{2}(CS|EC)[0-9]{3}$/.test(value);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase();
        setInputValue(value);
        setIsInputValid(true); // Reset validation state when user types
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordValue(e.target.value);
    };

    const handleSubmit = async () => {
        if (validateInput(inputValue)) {
            setIsInputValid(true);
            setShowShakeAnimation(false);
            try {
                const encryptedPassword = forge.util.encode64(passwordValue);
                const response = await axios.get(`http://100.102.21.101:8000/student?srn=${inputValue}&password=${encryptedPassword}`);
                const studentName = response.data;
                if (!studentName) {
                    setShowShakeAnimation(true);
                    setTimeout(() => setShowShakeAnimation(false), 400);
                    return;
                }
                navigate('/student-form', { state: { studentName, srn: inputValue } });
            } catch (error: any) {
                setShowShakeAnimation(true);
                setTimeout(() => setShowShakeAnimation(false), 400);
            }
        } else {
            setIsInputValid(false);
            setShowShakeAnimation(true);
            setTimeout(() => setShowShakeAnimation(false), 400);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSubmit();
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    useEffect(() => {
        setIsVisible(true);
        const handleMouseMove = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
        const handleResize = () => {
            const scaleX = window.innerWidth / 600;
            const scaleY = window.innerHeight / 400;
            setScale(Math.min(scaleX, scaleY, 1));
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
    <div className="relative min-h-screen overflow-hidden bg-black">
            {/* Enhanced Background Animation */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Animated Grid */}
                <div className="absolute inset-0 opacity-20">
                    <div
                        className="absolute h-full w-full animate-wave"
                        style={{
                            backgroundImage: 'linear-gradient(to right, rgba(168, 85, 247, 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(168, 85, 247, 0.3) 1px, transparent 1px)',
                            backgroundSize: '60px 60px',
                        }}
                    />
                </div>
                
                {/* Floating Orbs */}
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

                {/* Shooting Stars */}
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

            {/* Enhanced Mouse Follower */}
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

            {/* Back Button */}
            <button
                onClick={handleBackToHome}
                className="absolute top-6 left-6 z-20 p-3 rounded-xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 text-white hover:border-purple-500/50 hover:bg-gray-700/40 transition-all duration-300 group"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform duration-300">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </button>

            {/* Main Content */}
            <div className={`relative z-10 flex min-h-screen flex-col items-center justify-center px-4 transition-all duration-1500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                
                {/* Header Section */}
                <div className="text-center space-y-6 mb-12">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                        
                        <h1 className="text-6xl md:text-7xl font-bold text-white">
                    <Typewriter
                    words={['Student Login']}
                    loop={1}
                    cursor
                    cursorStyle="|"
                    typeSpeed={120}
                    deleteSpeed={50}
                    delaySpeed={1000}
                    />
                </h1>
                    </div>
                    <p className="text-lg text-gray-300 max-w-md mx-auto">
                        Access your academic portal with your SRN
                    </p>
                    <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
                </div>

                {/* Login Card */}
                <div className="group relative overflow-hidden rounded-2xl p-1 transition-all duration-500 hover:scale-105 max-w-md w-full">
                    {/* Animated Border */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Card Content */}
                    <div className="relative bg-gray-900/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 group-hover:border-transparent transition-all duration-300">
                        <div className="space-y-6">
                            {/* SRN Input */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Student Registration Number</label>
                                <input
                                    type="text"
                                    ref={inputRef}
                                    value={inputValue}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyDown}
                                    onFocus={() => setIsInputActive(true)}
                                    onBlur={() => setIsInputActive(false)}
                                    className={`w-full p-4 rounded-xl bg-gray-800/50 backdrop-blur-sm text-white text-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400 ${
                                        showShakeAnimation ? 'shake' : ''
                                    } ${
                                        !isInputValid ? 'border-red-500 focus:ring-red-500' : 'border-gray-600/50 hover:border-gray-500/50'
                                    }`}
                                    placeholder="PESXUGXXCSXXX"
                                />
                                {!isInputValid && (
                                    <p className="text-red-400 text-sm mt-2">Please enter a valid SRN format</p>
                                )}
                            </div>

                            {/* Password Input */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                                <input
                                    type="password"
                                    ref={passwordRef}
                                    value={passwordValue}
                                    onChange={handlePasswordChange}
                                    onKeyDown={handleKeyDown}
                                    onFocus={() => setIsInputActive(true)}
                                    onBlur={() => setIsInputActive(false)}
                                    className="w-full p-4 rounded-xl bg-gray-800/50 backdrop-blur-sm text-white text-lg border border-gray-600/50 hover:border-gray-500/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
                                    placeholder="Enter your password"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
                                onMouseEnter={() => setHoveredButton(true)}
                                onMouseLeave={() => setHoveredButton(false)}
                                className={`w-full py-4 px-6 rounded-xl font-medium transition-all duration-300 transform hover:scale-105
                                    bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 
                                    text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/25
                                    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 
                                    flex items-center justify-center space-x-2 group`}
                            >
                                <span>Sign In</span>
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor" 
                                    className={`w-5 h-5 transition-transform duration-300 ${hoveredButton ? 'translate-x-1' : ''}`}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                
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

            {/* Enhanced CSS Animations */}
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
                
                @keyframes shake {
                    0% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    50% { transform: translateX(5px); }
                    75% { transform: translateX(-5px); }
                    100% { transform: translateX(0); }
                }
                
                @keyframes typing {
                    from { width: 0; }
                    to { width: 14ch; }
                }
                
                @keyframes blink {
                    50% { border-color: transparent; }
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
                
                .shake {
                    animation: shake 0.4s ease;
                }
                
                .typewriter {
                    overflow: hidden;
                    white-space: nowrap;
                    width: 14ch;
                    border-right: 3px solid rgba(168, 85, 247, 0.8);
                    animation: typing 1.5s steps(14, end), blink 0.4s step-end infinite;
                }
                
                /* Glassmorphism effect */
                .backdrop-blur-sm {
                    backdrop-filter: blur(4px);
                }
                
                /* Custom scrollbar */
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