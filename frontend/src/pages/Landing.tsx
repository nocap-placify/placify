import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


interface MousePosition {
    x: number;
    y: number;
}

export const Landing = () => {
    const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(false);
    const [isInputActive, setIsInputActive] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isInputValid, setIsInputValid] = useState(true);
    const [showWrongAnimation, setShowWrongAnimation] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [scale, setScale] = useState(1);
    const [studentName, setStudentName] = useState('');
    const navigate = useNavigate();

    const validateInput = (value: string) => {
        const regex = /^PES[1-2]UG[0-9]{2}(CS|EC)[0-9]{3}$/;
        return regex.test(value);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase();
        setInputValue(value);
    };

    const handleSubmit = async () => {
        if (validateInput(inputValue)) {
            console.log('Valid SRN submitted:', inputValue);
            setIsInputValid(true);
            setShowWrongAnimation(false);
            try {
                const response = await axios.get(`http://100.102.21.101:8000/student?srn=${inputValue}`);
                const studentName = response.data;
                setStudentName(studentName);
                navigate('/dashboard', { state: { studentName, srn: inputValue } });
            } catch (error: any) {
                console.error('Error fetching student name:', error);
                setStudentName('');
                if (error.response && error.response.status === 404) {
                    alert('Student not found');
                } else {
                    alert('An unexpected error occurred');
                }
            }
        } else {
            setIsInputValid(false);
            setShowWrongAnimation(true);
            setTimeout(() => {
                setShowWrongAnimation(false);
                setIsInputValid(true);
            }, 400);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    useEffect(() => {
        setIsVisible(true);
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
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
            <div className="absolute inset-0 overflow-hidden">
                {/* Background animations */}
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
            </div>

            <div className="pointer-events-none fixed transition-transform duration-100 ease-out"
                style={{
                    left: `${mousePosition.x}px`,
                    top: `${mousePosition.y}px`,
                    transform: 'translate(-50%, -50%)',
                    width: '400px',
                    height: '400px',
                    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, rgba(168, 85, 247, 0) 70%)',
                }}
            />

            <div
                className={`relative z-10 flex min-h-screen flex-col items-center justify-center px-4 transition-opacity duration-1000 ${
                    isVisible ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                    transform: 'translateY(-50px)', // Move it up a bit
                }}
            >
                <h1
                    className="typewriter font-bold text-white"
                    style={{
                        fontSize: '3.5rem',
                        transform: 'translateY(-60px)',
                    }}
                >Placify</h1>

                {/* Input with Arrow Button */}
                <div className="mt-8 relative w-80">
                    <input
                        type="text"
                        ref={inputRef}
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsInputActive(true)} // Add onFocus handler
                        onBlur={() => setIsInputActive(false)} // Add onBlur handler
                        className="w-full p-4 rounded-full bg-white bg-opacity-20 text-white text-lg pl-5 pr-16 focus:outline-none"
                        placeholder="Enter your SRN"
                        style={{
                            border: isInputValid ? '1px solid rgba(255, 255, 255, 0.5)' : '1px solid red',
                            transition: 'border-color 0.3s ease',
                        }}
                    />

                    {/* Arrow Button */}
                    <button
                        onClick={handleSubmit}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white bg-purple-600 hover:bg-purple-700 p-2 rounded-full shadow-lg transition duration-300 ease-in-out"
                        style={{
                            width: '40px',
                            height: '40px',
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 12h14M12 5l7 7-7 7"
                            />
                        </svg>
                    </button>
                </div>

                {/* Background with blur effect */}
                <div
                    className={`absolute inset-0 transition-all duration-500 ${
                        isInputActive ? 'backdrop-blur-lg' : '' // Apply the blur effect on input focus
                    }`}
                    style={{
                        zIndex: -1, // Ensure this div stays behind the content
                        backgroundImage: 'url("/path/to/your/background-image.jpg")', // Optional: Add your background
                        backgroundSize: 'cover',
                    }}
                />
            </div>

            <style jsx>{`
                .typewriter {
                    overflow: hidden;
                    white-space: nowrap;
                    width: 6ch; /* Exact width for "Welcome" */
                    border-right: 3px solid rgba(168, 85, 247, 0.8);
                    animation: typing 1s steps(8, end), blink 0.4s step-end infinite;
                }

                @keyframes typing {
                    from { width: 0; }
                    to { width: 7ch; } /* Ends at the last character */
                }

                @keyframes blink {
                    50% { border-color: transparent; }
                }

                /* Other animations */
                @keyframes wave {
                    0% { transform: perspective(1000px) rotateX(45deg) translateY(0); }
                    100% { transform: perspective(1000px) rotateX(45deg) translateY(50px); }
                }

                .animate-wave {
                    animation: wave 8s infinite linear;
                }
                
                .animate-float {
                    animation: float 15s infinite ease-in-out;
                }

                .animate-pulse {
                    animation: pulse 5s infinite ease-in-out;
                }

                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 0.2; }
                    50% { transform: scale(1.2); opacity: 0.4; }
                }
            `}</style>
        </div>
    );
};
