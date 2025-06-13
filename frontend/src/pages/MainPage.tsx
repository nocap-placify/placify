import React, { useState, useEffect } from 'react';
import { Typewriter } from 'react-simple-typewriter';
import { useNavigate } from 'react-router-dom'; // ⬅️ Import this

const MainPage = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(false);
    const [hoveredButton, setHoveredButton] = useState<string | null>(null);
    
    const navigate = useNavigate(); // ⬅️ Add this

    useEffect(() => {
        setIsVisible(true);
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleNavigation = (path: string) => {
        navigate(path); // ⬅️ Now it actually navigates
    };

    const buttons = [
        {
            id: 'student',
            label: 'Sign in as Student',
            path: '/student-login', // ⬅️ Goes to student-login
            icon: '🎓',
            gradient: 'from-blue-500 to-purple-600',
            hoverGradient: 'from-blue-400 to-purple-500',
            description: 'Access your academic portal'
        },
        {
            id: 'recruiter',
            label: 'Sign in as Recruiter',
            path: '/landing', // ⬅️ Goes to landing
            icon: '💼',
            gradient: 'from-emerald-500 to-teal-600',
            hoverGradient: 'from-emerald-400 to-teal-500',
            description: 'Find talented candidates'
        },
        {
            id: 'mentor',
            label: 'Sign in as Mentor',
            path: '/mentor-login', // ⬅️ Goes to mentor-login
            icon: '👨‍🏫',
            gradient: 'from-orange-500 to-red-600',
            hoverGradient: 'from-orange-400 to-red-500',
            description: 'Guide the next generation'
        }
    ];


    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-black to-purple-900">
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

            {/* Main Content */}
            <div className={`relative z-10 flex min-h-screen flex-col items-center justify-center px-4 transition-all duration-1500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                
                {/* Header Section */}
                <div className="text-center space-y-6">
                <h1 className="text-6xl md:text-7xl font-bold text-white">
                    <Typewriter
                    words={['Placify']}
                    loop={1}
                    cursor
                    cursorStyle="|"
                    typeSpeed={120}
                    deleteSpeed={50}
                    delaySpeed={1000}
                    />
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                    Your gateway to academic and professional excellence
                </p>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
                <p>

                </p>
                </div>


                {/* Button Cards */}
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl w-full mb-16">
                    {buttons.map((button, index) => (
                        <div
                            key={button.id}
                            className={`group relative overflow-hidden rounded-2xl p-1 transition-all duration-500 hover:scale-105 ${
                                hoveredButton === button.id ? 'shadow-2xl shadow-purple-500/25' : ''
                            }`}
                            style={{
                                animationDelay: `${index * 200}ms`,
                            }}
                            onMouseEnter={() => setHoveredButton(button.id)}
                            onMouseLeave={() => setHoveredButton(null)}
                        >
                            {/* Animated Border */}
                            <div className={`absolute inset-0 bg-gradient-to-r ${button.gradient} rounded-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-300`}></div>
                            <div className={`absolute inset-0 bg-gradient-to-r ${button.hoverGradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                            
                            {/* Card Content */}
                            <div className="relative bg-gray-900/90 backdrop-blur-sm rounded-2xl p-6 h-full border border-gray-700/50 group-hover:border-transparent transition-all duration-300">
                                <div className="flex flex-col items-center justify-center text-center space-y-3 h-full min-h-[220px]">
                                    <div className="text-4xl mb-2 transform group-hover:scale-110 transition-transform duration-300">
                                        {button.icon}
                                    </div>
                                    <h3 className="text-xl font-semibold text-white group-hover:text-gray-100 transition-colors duration-300">
                                        {button.label}
                                    </h3>
                                    <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300 flex-grow flex items-center">
                                        {button.description}
                                    </p>
                                    <button
                                        onClick={() => handleNavigation(button.path)}
                                        className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-300 transform group-hover:translate-y-0 translate-y-1
                                            bg-gradient-to-r ${button.gradient} hover:${button.hoverGradient} 
                                            text-white shadow-lg hover:shadow-xl group-hover:shadow-2xl
                                            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 mt-auto`}
                                    >
                                        Get Started
                                        <span className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300 inline-block">→</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Features Section */}
                <div className="flex justify-center items-center w-full max-w-4xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                        {['🛡️ Trusted & Secure', '🤖 Powered by AI', '📈 Holistic Overview'].map((feature, index) => (
                            <div
                                key={index}
                                className="text-center p-4 rounded-xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 hover:border-purple-500/50 transition-all duration-300"
                                style={{ animationDelay: `${1000 + index * 100}ms` }}
                            >
                                <p className="text-gray-300 text-sm">{feature}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Enhanced CSS Animations */}
            <style jsx>{`
                @keyframes wave {
                    0% { background-position: 0 0; }
                    50% { background-position: 30px 30px; }
                    100% { background-position: 0 0; }
                }
                
                @keyframes gradient-x {
                    0%, 100% { background-size: 200% 200%; background-position: left center; }
                    50% { background-size: 200% 200%; background-position: right center; }
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
                
                .animate-gradient-x {
                    animation: gradient-x 3s ease infinite;
                }
                
                .animate-float {
                    animation: float 20s infinite ease-in-out;
                }
                
                .animate-shooting-star {
                    animation: shooting-star 3s infinite linear;
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

export default MainPage;