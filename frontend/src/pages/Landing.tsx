import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import * as forge from 'node-forge'
import user from '../assets/user.svg';

interface MousePosition {
    x: number;
    y: number;
}

export const Landing = () => {
    const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(false);
    const [isInputActive, setIsInputActive] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [passwordValue, setPasswordValue] = useState('');
    const [isInputValid, setIsInputValid] = useState(true);
    const [showShakeAnimation, setShowShakeAnimation] = useState(false);
    const [showWrongAnimation, setShowWrongAnimation] = useState(false);
    const [scale, setScale] = useState(1);
    const [studentName, setStudentName] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formName, setFormName] = useState('');
    const [formSrn, setFormsrn] = useState('');
    const [formsem, setFormsem] = useState('');
    const [formGithubLink, setFormG_profile] = useState('');
    const [formLeetcodeLink, setFormL_profile] = useState('');
    const [formMentorName, setFormMentorName] = useState('');
    const [formLinkedinLink, setFormLinkedin] = useState('');
    const [formCgpa, setFormcgpa] = useState('');
    const [formAge, setFormage] = useState('');
    const [formPhoneNo, setFormPh_no] = useState('');
    const [formDegree, setFormDegree] = useState('');
    const [formStream, setFormStream] = useState('');
    const [formGender, setFormGender] = useState('');

    const [formEmail, setFormEmail] = useState('');
    const navigate = useNavigate();

    const inputRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const validateInput = (value: string) => /^PES[1-2]UG[0-9]{2}(CS|EC)[0-9]{3}$/.test(value);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase();
        setInputValue(value);
    };
    const [inputErrors, setInputErrors] = useState({
        formName: false,
        formSrn: false,
        formsem: false,
        formGithubLink: false,
        formLeetcodeLink: false,
        formMentorName: false,
        formLinkedinLink: false,
        formCgpa: false,
        formAge: false,
        formPhoneNo: false,
        formDegree: false,
        formStream: false,
        formGender: false,
        formEmail: false,
    });
    const handleFormSubmit = () => {
        // Validate each field
        const errors = {
            formName: formName === '',
            formSrn: formSrn === '',
            formsem: formsem === '',
            formGithubLink: formGithubLink === '',
            formLeetcodeLink: formLeetcodeLink === '',
            formMentorName: formMentorName === '',
            formLinkedinLink: formLinkedinLink === '',
            formCgpa: formCgpa === '',
            formAge: formAge === '',
            formPhoneNo: formPhoneNo === '',
            formDegree: formDegree === '',
            formStream: formStream === '',
            formGender: formGender === '',
            formEmail: formEmail === '',
        };

        setInputErrors(errors);

        const hasErrors = Object.values(errors).some(error => error);
        if (hasErrors) return;

        console.log("Form submitted successfully");

        setIsFormOpen(false); // Close the form after successful submission
    };
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordValue(e.target.value);
    };

    const getEncryptedAESKey = async (): Promise<{ encryptedAESKey: string, aesKey: Uint8Array }> => {
        const response = await fetch("http://100.102.21.101:8000/getPublicKey");
        const publicKeyPem = await response.text();

        const rsaPublicKey = forge.pki.publicKeyFromPem(publicKeyPem);
        const aesKey = forge.random.getBytesSync(16); // 128-bit AES key

        const encryptedAESKey = rsaPublicKey.encrypt(aesKey, "RSA-OAEP");
        return {
            encryptedAESKey: forge.util.encode64(encryptedAESKey),
            aesKey: forge.util.createBuffer(aesKey).toHex(),
        };
    };

    const handleSubmit = async () => {
        if (validateInput(inputValue)) {
            setIsInputValid(true);
            setShowShakeAnimation(false);
            try {
                const { encryptedAESKey, aesKey } = await getEncryptedAESKey();

            // AES encrypt the password
            const aesCipher = forge.cipher.createCipher("AES-CFB", aesKey);
            const iv = forge.random.getBytesSync(16);
            aesCipher.start({ iv });
            aesCipher.update(forge.util.createBuffer(passwordValue));
            aesCipher.finish();

            const encryptedPassword = forge.util.encode64(passwordValue);
            console.log(encryptedPassword)
            const response = await axios.get(`http://100.102.21.101:8000/student?srn=${inputValue}&password=${encryptedPassword}`, {
            });
                const studentName = response.data;
                console.log(studentName)
                if (!studentName) {
                    setShowShakeAnimation(true);
                    setTimeout(() => setShowShakeAnimation(false), 400);
                    return;
                }
                setStudentName(studentName);
                navigate('/dashboard', { state: { studentName, srn: inputValue } });
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
            {/* Button to open the form */}
           

            {/* Form Modal */}
            {isFormOpen && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-6 text-center text-gray-700">Student Details</h2>

            <div className="space-y-4">
                <input type="text" placeholder="Name" value={formName} onChange={(e) => setFormName(e.target.value)} className={`w-full p-3 border rounded-lg ${inputErrors.formName ? 'border-red-500' : 'border-gray-300'}`} />
                <input type="text" placeholder="SRN" value={formSrn} onChange={(e) => setFormsrn(e.target.value)} className={`w-full p-3 border rounded-lg ${inputErrors.formSrn ? 'border-red-500' : 'border-gray-300'}`} />
                <input type="text" placeholder="Semester" value={formsem} onChange={(e) => setFormsem(e.target.value)} className={`w-full p-3 border rounded-lg ${inputErrors.formsem ? 'border-red-500' : 'border-gray-300'}`} />
                <input type="text" placeholder="GitHub Link" value={formGithubLink} onChange={(e) => setFormG_profile(e.target.value)} className={`w-full p-3 border rounded-lg ${inputErrors.formGithubLink ? 'border-red-500' : 'border-gray-300'}`} />
                <input type="text" placeholder="LeetCode Link" value={formLeetcodeLink} onChange={(e) => setFormL_profile(e.target.value)} className={`w-full p-3 border rounded-lg ${inputErrors.formLeetcodeLink ? 'border-red-500' : 'border-gray-300'}`} />
                <input type="text" placeholder="Mentor Name" value={formMentorName} onChange={(e) => setFormMentorName(e.target.value)} className={`w-full p-3 border rounded-lg ${inputErrors.formMentorName ? 'border-red-500' : 'border-gray-300'}`} />
                <input type="text" placeholder="LinkedIn Link" value={formLinkedinLink} onChange={(e) => setFormLinkedin(e.target.value)} className={`w-full p-3 border rounded-lg ${inputErrors.formLinkedinLink ? 'border-red-500' : 'border-gray-300'}`} />
                <input type="text" placeholder="CGPA" value={formCgpa} onChange={(e) => setFormcgpa(e.target.value)} className={`w-full p-3 border rounded-lg ${inputErrors.formCgpa ? 'border-red-500' : 'border-gray-300'}`} />
                <input type="number" placeholder="Age" value={formAge} onChange={(e) => setFormage(e.target.value)} className={`w-full p-3 border rounded-lg ${inputErrors.formAge ? 'border-red-500' : 'border-gray-300'}`} />
                <input type="text" placeholder="Phone No" value={formPhoneNo} onChange={(e) => setFormPh_no(e.target.value)} className={`w-full p-3 border rounded-lg ${inputErrors.formPhoneNo ? 'border-red-500' : 'border-gray-300'}`} />
                <input type="text" placeholder="Degree" value={formDegree} onChange={(e) => setFormDegree(e.target.value)} className={`w-full p-3 border rounded-lg ${inputErrors.formDegree ? 'border-red-500' : 'border-gray-300'}`} />
                <input type="text" placeholder="Stream" value={formStream} onChange={(e) => setFormStream(e.target.value)} className={`w-full p-3 border rounded-lg ${inputErrors.formStream ? 'border-red-500' : 'border-gray-300'}`} />
                <input type="text" placeholder="Gender" value={formGender} onChange={(e) => setFormGender(e.target.value)} className={`w-full p-3 border rounded-lg ${inputErrors.formGender ? 'border-red-500' : 'border-gray-300'}`} />
                <input type="email" placeholder="Email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} className={`w-full p-3 border rounded-lg ${inputErrors.formEmail ? 'border-red-500' : 'border-gray-300'}`} />
            </div>

            <div className="flex items-center justify-between mt-6">
                <button
                    onClick={handleFormSubmit}
                    className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition duration-200"
                >
                    Submit
                </button>
                <button
                    onClick={() => setIsFormOpen(false)}
                    className="w-full bg-gray-300 text-gray-700 p-3 rounded-lg hover:bg-gray-400 transition duration-200 ml-4"
                >
                    Close
                </button>
            </div>
        </div>
    </div>
)}

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

            <div className={`absolute inset-0 ${isInputActive ? 'backdrop-blur-lg' : ''}`}>
                <div
                    className="pointer-events-none fixed transition-transform duration-100 ease-out"
                    style={{
                        left: `${mousePosition.x}px`,
                        top: `${mousePosition.y}px`,
                        transform: 'translate(-50%, -50%)',
                        width: '400px',
                        height: '400px',
                        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, rgba(168, 85, 247, 0) 70%)',
                    }}
                />

                <div className={`relative z-10 flex min-h-screen flex-col items-center justify-center px-4 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="absolute top-4 right-4 w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center z-30 hover:bg-purple-600 transition-colors duration-300 shadow-lg"
                >
                    <img
                        src={user}
                        alt="User"
                        className="w-8 h-8 rounded-full" // Icon size within the circular button
                    />
                </button>
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
                            onFocus={() => setIsInputActive(true)}
                            onBlur={() => setIsInputActive(false)}
                            className={`w-full p-4 rounded-full bg-white bg-opacity-20 text-white text-lg pl-5 pr-16 focus:outline-none ${showShakeAnimation ? 'shake' : ''}`}
                            placeholder="Enter your SRN"
                            style={{
                                border: showShakeAnimation || !isInputValid ? '1px solid red' : '1px solid rgba(255, 255, 255, 0.5)',
                                transition: 'border-color 0.3s ease',
                            }}
                        />
                       
                    </div>
                    <div className="mt-4 relative w-80">
                    <input
                        type="password"
                        ref={passwordRef}
                        value={passwordValue}
                        onChange={handlePasswordChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsInputActive(true)}
                        onBlur={() => setIsInputActive(false)}
                        className={`w-full p-4 rounded-full bg-white bg-opacity-20 text-white text-lg pl-5 pr-16 focus:outline-none`}
                        placeholder="Enter your password"
                        style={{
                            border: '1px solid rgba(255, 255, 255, 0.5)',
                            transition: 'border-color 0.3s ease',
                        }}
                    />
                    <button
                        onClick={handleSubmit}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white bg-purple-600 hover:bg-purple-700 p-2 rounded-full shadow-lg transition duration-300 ease-in-out"
                        style={{
                            width: '40px',
                            height: '40px',
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
                </div>
                <style jsx>{`
    .shake {
        animation: shake 0.4s ease;
    }
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

    @keyframes slide {
        0% {
            transform: translateX(-100%) rotate(-45deg);
        }
        100% {
            transform: translateX(100%) rotate(-45deg);
        }
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
                0%, 100% { transform: scale(1); opacity: 0.2; }
                50% { transform: scale(1.2); opacity: 0.4; }
            }

    @keyframes glow {
        0% {
            text-shadow: 0 0 20px rgba(168, 85, 247, 0);
        }
        50% {
            text-shadow: 0 0 20px rgba(168, 85, 247, 0.5);
        }
        100% {
            text-shadow: 0 0 20px rgba(168, 85, 247, 0);
        }
    }

    .animate-glow {
        animation: glow 3s infinite;
    }

    .animate-slideIn {
        animation: slideIn 1s forwards;
        opacity: 0;
        transform: translateY(20px);
    }

    @keyframes slideIn {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .animate-fadeIn {
        animation: fadeIn 1s forwards;
        opacity: 0;
    }

    @keyframes fadeIn {
        to {
            opacity: 1;
        }
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
        width: 6ch;
        border-right: 3px solid rgba(168, 85, 247, 0.8);
        animation: typing 1s steps(8, end), blink 0.4s step-end infinite;
    }

    @keyframes typing {
        from { width: 0; }
        to { width: 7ch; }
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
                {/* Footer */}
                <footer
                    className="absolute bottom-0 w-full text-center text-gray-500 text-sm mb-4"
                    style={{
                        opacity: 0.7,
                    }}
                >
                    Made with <span className="text-pink-500">🩵</span> by <a href="https://github.com/nocap-placify" className="underline">nocap-placify</a>.
                </footer>
            </div>
        </div>
    );
};