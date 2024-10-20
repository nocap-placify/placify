import React, { useState, useRef, useEffect } from 'react';
import backgroundImage from '../assets/Background.svg';
import welcomeCard from '../assets/welcome_card.svg';
import Welcome from '../assets/Welcome.png';

export const Landing = () => {
    const [isInputActive, setIsInputActive] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isInputValid, setIsInputValid] = useState(true);
    const [showWrongAnimation, setShowWrongAnimation] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [scale, setScale] = useState(1);

    const validateInput = (value: string) => {
        const regex = /^PES[1-2]UG[0-9]{2}(CS|EC)[0-9]{3}$/;
        return regex.test(value);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase();
        setInputValue(value);
    };

    const handleSubmit = () => {
        if (validateInput(inputValue)) {
            console.log('Valid SRN submitted:', inputValue);
            setIsInputValid(true);
            // Add your submit logic here
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
        const handleResize = () => {
            const scaleX = window.innerWidth / 600;
            const scaleY = window.innerHeight / 400;
            setScale(Math.min(scaleX, scaleY, 1));
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial call

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="landing-container" style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '100vh',
            width: '100vw',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
        }}>
            <div className="welcome-card-container" style={{
                width: '600px',
                height: '400px',
                transform: `scale(${scale})`,
                transformOrigin: 'center center',
            }}>
                <div className="welcome-card" style={{
                    backgroundImage: `url(${welcomeCard})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '20px',
                    boxSizing: 'border-box',
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '90%',
                        maxWidth: '450px',
                        height: '100%',
                        justifyContent: 'space-between',
                        paddingTop: '80px',
                        paddingBottom: '60px',
                    }}>
                        <img src={Welcome} alt="Welcome" style={{ 
                            maxWidth: '100%', 
                            height: 'auto',
                            maxHeight: '120px' 
                        }} />
                        <div className="input-container" style={{
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: isInputActive 
                                ? 'rgba(70, 70, 70, 0.30)'
                                : (isInputValid ? 'rgba(70, 70, 70, 0.15)' : 'rgba(255, 100, 100, 0.2)'),
                            borderRadius: '30px',
                            padding: '5px',
                            width: '100%',
                            marginTop: '20px',
                            boxShadow: isInputActive 
                                ? '0 10px 25px rgba(0, 0, 0, 0.2), 0 0 5px rgba(255, 255, 255, 0.2)'
                                : '0 5px 15px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.3s ease',
                            outline: isInputActive 
                                ? '2px solid rgba(255, 255, 255, 0.5)'
                                : (isInputValid ? '2px solid rgba(255, 255, 255, 0.35)' : '2px solid rgba(255, 100, 100, 0.5)'),
                            animation: showWrongAnimation ? 'subtleShake 0.4s ease' : 'none',
                        }}>
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Enter your SRN"
                                value={inputValue}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                style={{
                                    flex: 1,
                                    border: 'none',
                                    background: 'transparent',
                                    color: 'white',
                                    fontSize: '18px',
                                    outline: 'none',
                                    padding: '14px 18px',
                                }}
                                onFocus={() => setIsInputActive(true)}
                                onBlur={() => setIsInputActive(false)}
                            />
                            <button
                                onClick={handleSubmit}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    border: 'none',
                                    color: '#fff',
                                    fontSize: '30px',
                                    cursor: 'pointer',
                                    padding: '10px 20px',
                                    borderRadius: '30px',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '55px',
                                    marginLeft: '20px',
                                }}
                            >
                                <span>→</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <style>
                {`
                body, html {
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                }
                .landing-container {
                    position: fixed;
                    top: 0;
                    left: 0;
                }
                ::placeholder {
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 18px;
                    transition: color 0.3s ease;
                }
                input:focus::placeholder {
                    color: rgba(255, 255, 255, 0);
                }
                @keyframes shake {
                    0%, 100% { transform: translate(0, 0); }
                    10%, 30%, 50%, 70%, 90% { transform: translate(-1px, -1px); }
                    20%, 40%, 60%, 80% { transform: translate(1px, 1px); }
                }
                @keyframes subtleShake {
                    0%, 100% { transform: translate(0, 0); }
                    10%, 30%, 50%, 70%, 90% { transform: translate(-1px, 0); }
                    20%, 40%, 60%, 80% { transform: translate(1px, 0); }
                    15%, 35%, 55%, 75%, 95% { transform: translate(-0.5px, 0); }
                    25%, 45%, 65%, 85% { transform: translate(0.5px, 0); }
                }
                `}
            </style>
        </div>
    );
};
