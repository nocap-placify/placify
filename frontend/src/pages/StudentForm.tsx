import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Background animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-10 animate-wave bg-[length:50px_50px] bg-grid" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="absolute rounded-full opacity-30 blur-xl animate-float" style={{
            width: `${Math.random() * 300 + 100}px`,
            height: `${Math.random() * 300 + 100}px`,
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(168, 85, 247, 0) 70%)',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
          }} />
        ))}
        {[...Array(10)].map((_, i) => (
          <div key={i} className="absolute rounded-full opacity-20 animate-pulse" style={{
            width: `${Math.random() * 300 + 100}px`,
            height: `${Math.random() * 300 + 100}px`,
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, rgba(168, 85, 247, 0) 70%)',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
          }} />
        ))}
      </div>

      {/* Mouse follower glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="fixed transition-transform duration-100 ease-out"
          style={{
            left: `${mousePosition.x}px`,
            top: `${mousePosition.y}px`,
            transform: 'translate(-50%, -50%)',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, rgba(168, 85, 247, 0) 70%)',
          }} />
      </div>

      {/* Form */}
      <div className={`relative z-10 flex min-h-screen flex-col items-center justify-center px-4 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <h1 className="text-white text-4xl font-bold mb-6">Student Registration</h1>

        <form onSubmit={handleFormSubmit} className="bg-white bg-opacity-10 p-6 rounded-xl backdrop-blur-md w-full max-w-xl space-y-4">
          {submitted && (
            <div className="text-green-300 font-medium text-center">✅ Form submitted successfully!</div>
          )}

          {[
            { label: 'Name', state: formName, setState: setFormName, type: 'text', error: inputErrors.formName },
            { label: 'SRN', state: formSrn, setState: (v: any) => setFormsrn(v.toUpperCase()), type: 'text', error: inputErrors.formSrn },
            { label: 'Semester', state: formsem, setState: setFormsem, type: 'text', error: inputErrors.formsem },
            { label: 'GitHub Link', state: formGithubLink, setState: setFormG_profile, type: 'text', error: inputErrors.formGithubLink },
            { label: 'LeetCode Link', state: formLeetcodeLink, setState: setFormL_profile, type: 'text', error: inputErrors.formLeetcodeLink },
            { label: 'Mentor Name', state: formMentorName, setState: setFormMentorName, type: 'text', error: inputErrors.formMentorName },
            { label: 'LinkedIn Link', state: formLinkedinLink, setState: setFormLinkedin, type: 'text', error: inputErrors.formLinkedinLink },
            { label: 'CGPA', state: formCgpa, setState: setFormcgpa, type: 'text', error: inputErrors.formCgpa },
            { label: 'Age', state: formAge, setState: setFormage, type: 'number', error: inputErrors.formAge },
            { label: 'Phone Number', state: formPhoneNo, setState: setFormPh_no, type: 'text', error: inputErrors.formPhoneNo },
            { label: 'Degree', state: formDegree, setState: setFormDegree, type: 'text', error: inputErrors.formDegree },
            { label: 'Stream', state: formStream, setState: setFormStream, type: 'text', error: inputErrors.formStream },
            { label: 'Gender', state: formGender, setState: setFormGender, type: 'text', error: inputErrors.formGender },
            { label: 'Email', state: formEmail, setState: setFormEmail, type: 'email', error: inputErrors.formEmail },
            { label: 'Resume Link', state: formResume, setState: setFormResume, type: 'text', error: inputErrors.formResume },
          ].map(({ label, state, setState, type, error }, i) => (
            <div key={i}>
              <label className="block text-white mb-1 font-medium">{label}</label>
              <input
                type={type}
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder={label}
                className={`w-full px-3 py-2 rounded bg-white bg-opacity-20 text-white placeholder-gray-300 focus:outline-none ${error ? 'border border-red-400' : ''}`}
              />
            </div>
          ))}

          <button type="submit" className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded transition">
            Submit
          </button>
        </form>
      </div>

      <style jsx>{`
        .animate-wave {
          animation: wave 8s infinite linear;
          background-image:
            linear-gradient(to right, purple 1px, transparent 1px),
            linear-gradient(to bottom, purple 1px, transparent 1px);
        }
        @keyframes wave {
          0% { background-position: 0 0; }
          50% { background-position: 25px 25px; }
          100% { background-position: 0 0; }
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, -30px); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.2); opacity: 0.4; }
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

export default StudentFormPage;
