import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Typewriter } from 'react-simple-typewriter';

interface MousePosition {
  x: number;
  y: number;
}

const StudentFormPage = () => {
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
  const [formResume, setFormResume] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

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
    formResume: false,
  });

  const navigate = useNavigate();

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

  const validateSrn = (srn: string) =>
    /^PES[1-2]UG[0-9]{2}(CS|EC)[0-9]{3}$/i.test(srn);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateCgpa = (cgpa: string) => {
    const val = parseFloat(cgpa);
    return !isNaN(val) && val >= 1 && val <= 10;
  };

  const validateSemester = (sem: string) => {
    const num = parseInt(sem);
    return !isNaN(num) && num >= 1 && num <= 8;
  };

  const validatePhone = (phone: string) =>
    /^[0-9]{10}$/.test(phone);

  const handleBackToHome = () => {
      navigate('/student-login');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = {
      formName: formName.trim() === '',
      formSrn: !validateSrn(formSrn),
      formsem: !validateSemester(formsem),
      formGithubLink: formGithubLink.trim() === '',
      formLeetcodeLink: formLeetcodeLink.trim() === '',
      formMentorName: formMentorName.trim() === '',
      formLinkedinLink: formLinkedinLink.trim() === '',
      formCgpa: !validateCgpa(formCgpa),
      formAge: formAge === '' || parseInt(formAge) <= 0,
      formPhoneNo: !validatePhone(formPhoneNo),
      formDegree: formDegree.trim() === '',
      formStream: formStream.trim() === '',
      formGender: formGender.trim() === '',
      formEmail: !validateEmail(formEmail),
      formResume: formResume.trim() === '',
    };

    setInputErrors(errors);

    if (Object.values(errors).some(Boolean)) return;

    const apiUrl = `http://100.102.21.101:8000/insertStudent?name=${encodeURIComponent(formName)}&srn=${encodeURIComponent(formSrn)}&cgpa=${encodeURIComponent(formCgpa)}&sem=${encodeURIComponent(formsem)}&age=${encodeURIComponent(formAge)}&email=${encodeURIComponent(formEmail)}&phone_num=${encodeURIComponent(formPhoneNo)}&degree=${encodeURIComponent(formDegree)}&stream=${encodeURIComponent(formStream)}&gender=${encodeURIComponent(formGender)}&git_link=${encodeURIComponent(formGithubLink)}&leet_link=${encodeURIComponent(formLeetcodeLink)}&men_name=${encodeURIComponent(formMentorName)}&resume=${encodeURIComponent(formResume)}&linkedin_link=${encodeURIComponent(formLinkedinLink)}`;

    try {
      await axios.get(apiUrl);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      alert("Submission failed.");
    }
  };

  const formFields = [
    { 
      section: "Personal Information",
      fields: [
        { label: 'Full Name', state: formName, setState: setFormName, type: 'text', error: inputErrors.formName, icon: '👤', placeholder: 'Enter your full name' },
        { label: 'Email Address', state: formEmail, setState: setFormEmail, type: 'email', error: inputErrors.formEmail, icon: '📧', placeholder: 'your.email@example.com' },
        { label: 'Phone Number', state: formPhoneNo, setState: setFormPh_no, type: 'text', error: inputErrors.formPhoneNo, icon: '📱', placeholder: '10-digit phone number' },
        { label: 'Age', state: formAge, setState: setFormage, type: 'number', error: inputErrors.formAge, icon: '🎂', placeholder: 'Your age' },
        { label: 'Gender', state: formGender, setState: setFormGender, type: 'text', error: inputErrors.formGender, icon: '⚧', placeholder: 'Male/Female/Other' },
      ]
    },
    {
      section: "Academic Details",
      fields: [
        { label: 'SRN', state: formSrn, setState: (v: any) => setFormsrn(v.toUpperCase()), type: 'text', error: inputErrors.formSrn, icon: '🎓', placeholder: 'PES1UG20CS001' },
        { label: 'Semester', state: formsem, setState: setFormsem, type: 'text', error: inputErrors.formsem, icon: '📚', placeholder: '1-8' },
        { label: 'CGPA', state: formCgpa, setState: setFormcgpa, type: 'text', error: inputErrors.formCgpa, icon: '📊', placeholder: '1.0 - 10.0' },
        { label: 'Degree', state: formDegree, setState: setFormDegree, type: 'text', error: inputErrors.formDegree, icon: '🎯', placeholder: 'B.Tech, B.E, etc.' },
        { label: 'Stream', state: formStream, setState: setFormStream, type: 'text', error: inputErrors.formStream, icon: '🔬', placeholder: 'Computer Science, Electronics, etc.' },
        { label: 'Mentor Name', state: formMentorName, setState: setFormMentorName, type: 'text', error: inputErrors.formMentorName, icon: '👨‍🏫', placeholder: 'Your assigned mentor' },
      ]
    },
    {
      section: "Professional Links",
      fields: [
        { label: 'GitHub Profile', state: formGithubLink, setState: setFormG_profile, type: 'url', error: inputErrors.formGithubLink, icon: '💻', placeholder: 'https://github.com/username' },
        { label: 'LeetCode Profile', state: formLeetcodeLink, setState: setFormL_profile, type: 'url', error: inputErrors.formLeetcodeLink, icon: '🧩', placeholder: 'https://leetcode.com/username' },
        { label: 'LinkedIn Profile', state: formLinkedinLink, setState: setFormLinkedin, type: 'url', error: inputErrors.formLinkedinLink, icon: '💼', placeholder: 'https://linkedin.com/in/username' },
        { label: 'Resume Link', state: formResume, setState: setFormResume, type: 'url', error: inputErrors.formResume, icon: '📄', placeholder: 'Link to your resume (Drive, Dropbox, etc.)' },
      ]
    }
  ];

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

      {/* Form */}
      <div className={`relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            <Typewriter
              words={['Student Registration']}
              loop={1}
              cursor
              cursorStyle="|"
              typeSpeed={120}
              deleteSpeed={50}
              delaySpeed={1000}
            />
          </h1>
          <p className="text-gray-300 text-lg">Complete your profile to get started</p>
        </div>

        {/* Success Message */}
        {submitted && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/20 border border-green-400/30 backdrop-blur-sm">
            <div className="flex items-center justify-center text-green-300 font-medium">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Form submitted successfully!
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="w-full max-w-4xl">
          <form onSubmit={handleFormSubmit} className="space-y-8">
            {formFields.map((section, sectionIndex) => (
              <div key={sectionIndex} className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
                {/* Section Header */}
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-white mb-2 flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm mr-3">
                      {sectionIndex + 1}
                    </div>
                    {section.section}
                  </h2>
                  <div className="w-full h-px bg-gradient-to-r from-purple-500/50 to-transparent"></div>
                </div>

                {/* Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {section.fields.map((field, fieldIndex) => (
                    <div key={fieldIndex} className={`${field.label === 'Resume Link' ? 'md:col-span-2' : ''}`}>
                      <label className="block text-white/90 mb-2 font-medium text-sm flex items-center">
                        <span className="mr-2 text-lg">{field.icon}</span>
                        {field.label}
                        {field.error && <span className="ml-2 text-red-400 text-xs">(Required)</span>}
                      </label>
                      <div className="relative">
                        <input
                          type={field.type}
                          value={field.state}
                          onChange={(e) => field.setState(e.target.value)}
                          placeholder={field.placeholder}
                          className={`w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 border transition-all duration-300 focus:outline-none focus:ring-2 focus:scale-[1.02] ${
                            field.error 
                              ? 'border-red-400/50 focus:border-red-400 focus:ring-red-400/30' 
                              : 'border-white/20 focus:border-purple-400 focus:ring-purple-400/30 hover:border-white/30'
                          }`}
                        />
                        {field.error && (
                          <div className="absolute -bottom-1 right-3 w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <button 
                type="submit" 
                className="px-12 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-purple-400/30 active:scale-95"
              >
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                  </svg>
                  Submit Registration
                </span>
              </button>
            </div>
          </form>
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

export default StudentFormPage;