import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from "../components/card";
import Background from '../assets/backgroundblue.png';
import { FaGithub } from 'react-icons/fa';
import { SiLeetcode } from 'react-icons/si';
import { FaChalkboardTeacher } from 'react-icons/fa';
import { FaLinkedin } from 'react-icons/fa';
import { FaUserCircle } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { FaMale, FaFemale } from 'react-icons/fa';
import { FaGraduationCap } from 'react-icons/fa';
import { GiCoinsPile, GiRank1 } from 'react-icons/gi';
import { BsFillCalendarFill } from 'react-icons/bs';
const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

interface LeetcodeData {
  leetcode_id: string;
  ranking: number;
  easy_solved: number;
  medium_solved: number;
  hard_solved: number;
  total_solved: number;
}
// Define types for GitHub data
interface Repository {
  repo_id: string;
  repo_name: string;
  language: string;
  description: string;
}

interface GitHubData {
  github_id: string;
  repositories: Repository[];
}
interface MentorSession {
  date: string;
  advice: string;
}

interface LinkedInData {
  Linkedin: string; // Define the expected structure of LinkedIn data here
}


export const Dashboard = () => {
  const location = useLocation();
  const { studentName, srn: studentSRN } = location.state || {};
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const [githubData, setGithubData] = useState<GitHubData | null>(null);
  const [leetcodeData, setLeetcodeData] = useState<LeetcodeData | null>(null);
  const [resumeData, setResumeData] = useState<string | null>(null); // New state for resume
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [isLeetcodeLoading, setIsLeetcodeLoading] = useState(false);
  const [isMentorSessionLoading, setIsMentorSessionLoading] = useState(false);
  const [studentInfo, setStudentInfo] = useState(null);
  const [linkedinUrl, setLinkedinUrl] = useState(null);




  useEffect(() => {
    const img = new Image();
    img.src = Background;
    img.onload = () => setIsLoading(false);
  }, []);
  
  useEffect(() => {
    const fetchStudentInfo = async () => {
      try {
        const infoResponse = await axios.get(`http://100.102.21.101:8000/getInfo?srn=${studentSRN}`);
        setStudentInfo(infoResponse.data);

        const linkedinResponse = await axios.get(`http://100.102.21.101:8000/getLinkedin?srn=${studentSRN}`);
        console.log(linkedinResponse)
        setLinkedinUrl(linkedinResponse.data); // Fetch LinkedIn URL as per the interface
        console.log(linkedinUrl)
      } catch (error) {
        console.error('Error fetching student info or LinkedIn URL:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentInfo();
  }, [studentSRN]);

  const handleLinkedInClick = () => {
    if (linkedinUrl?.linkedin) {
      window.open(linkedinUrl.linkedin, "_blank");
    } else {
      console.error("LinkedIn URL not available");
    }
  };
  const fetchData = async (srn: string) => {
    setIsGithubLoading(true);
    try {
      const response = await axios.get(`http://100.102.21.101:8000/getGithub?srn=${srn}`);
      setGithubData(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    } finally {
      setIsGithubLoading(false);
    }
  };


  const fetchLeetcodeData = async (srn: string) => {
    setIsLeetcodeLoading(true);
    try {
      const response = await axios.get(`http://100.102.21.101:8000/getLeetcode?srn=${srn}`);
      setLeetcodeData(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching LeetCode data:', error);
      return null;
    } finally {
      setIsLeetcodeLoading(false);
    }
  };
  const fetchMentorSessionData = async (srn: string) => {
    setIsMentorSessionLoading(true);
    try {
      const response = await axios.get(`http://100.102.21.101:8000/getMentorSessions?srn=${srn}`);
      return response.data.sessions; // Assuming the data is returned as an array of sessions
    } catch (error) {
      console.error('Error fetching MentorSessions data:', error);
      return null;
    } finally {
      setIsMentorSessionLoading(false);
    }
  };
  // const handleLinkedInClick = () => {
  //   if (linkedinUrl) {
  //     window.open(linkedinUrl, "_blank"); // Open LinkedIn URL in a new tab
  //   } else {
  //     console.error("LinkedIn URL not available");
  //   }
  // };

  

  const handleCardClick = async (type: string, srn: string) => {
    if (!srn) {
      console.error('SRN is undefined');
      return;
    }
  
    setShowModal(true);
  
    if (type === 'GitHub') {
      setModalContent(
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      );
  
      const data = await fetchData(srn);
  
      if (data) {
        const githubProfileUrl = data.github_id;
        const githubUsername = githubProfileUrl.split('/').pop();
  
        setModalContent(
          <div className="flex flex-col h-full max-h-[70vh]">
            <div className="p-6 bg-white rounded-t-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center sticky top-0">
                <FaGithub className="mr-2 text-gray-800" />
                GitHub:
                <a
                  href={githubProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline ml-2 transition duration-300"
                  title="View GitHub Profile"
                >
                  {githubUsername}
                </a>
              </h2>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Repositories:</h3>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <ul className="space-y-4">
                {data.repositories.map(repo => (
                  <li key={repo.repo_id} className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition duration-300">
                    <h4 className="text-lg font-bold text-gray-800">
                      <a
                        href={`${data.github_id}/${repo.repo_name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {repo.repo_name}
                      </a>
                    </h4>
                    <p className="text-gray-600">{repo.description}</p>
                    <span className="inline-block mt-2 text-sm font-medium text-gray-500">Language: {repo.language}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      } else {
        setModalContent(
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-red-600">Error loading GitHub data</h2>
            <p className="text-gray-600">Please try again later.</p>
          </div>
        );
      }
    } else if (type === 'LeetCode') {
      setModalContent(
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
        </div>
      );
  
      const data = await fetchLeetcodeData(srn);
  
      if (data) {
        const leetcodeProfileUrl = `https://leetcode.com/${data.leetcode_id}`;
        const leetcodeUsername = data.leetcode_id.split('/').pop();
  
        setModalContent(
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <SiLeetcode className="mr-2 text-yellow-500" />
              LeetCode:
              <a
                href={leetcodeProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-2 transition duration-300"
                title="View LeetCode Profile"
              >
                {leetcodeUsername}
              </a>
            </h2>
            <div className="text-lg font-semibold text-gray-700 mb-4">
              Ranking: <span className="font-bold text-gray-800">{data.ranking}</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Problems Solved:</h3>
            <ul className="space-y-2">
              <li className="text-gray-600">
                <span className="font-medium">Easy:</span> {data.easy_solved}
              </li>
              <li className="text-gray-600">
                <span className="font-medium">Medium:</span> {data.medium_solved}
              </li>
              <li className="text-gray-600">
                <span className="font-medium">Hard:</span> {data.hard_solved}
              </li>
              <li className="text-gray-800 font-bold mt-2">
                Total Solved: {data.total_solved}
              </li>
            </ul>
          </div>
        );
      } else {
        setModalContent(
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-red-600">Error loading LeetCode data</h2>
            <p className="text-gray-600">Please try again later.</p>
          </div>
        );
      }
    }  else if (type === 'MentorSession') {
  setModalContent(
    <div className="flex justify-center items-center min-h-[200px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
    </div>
  );

  const data = await fetchMentorSessionData(srn);

  if (data && data.length > 0) {
    setModalContent(
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
        <FaChalkboardTeacher className="mr-2 text-gray-800" size={24} /> {/* Icon added here */}
        Mentor Sessions
      </h2>
        <ul className="space-y-4">
          {data.map((session, index) => (
            <li key={index} className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition duration-300">
              <h3 className="text-lg font-bold text-gray-800">Date: {session.date}</h3>
              <p className="text-gray-600">{session.advice}</p>
            </li>
          ))}
        </ul>
      </div>
    );
  } else {
    setModalContent(
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-red-600">No mentor sessions found</h2>
        <p className="text-gray-600">Please check back later for updated mentor session information.</p>
      </div>
    );
  }
}
  };


  const handleResumeClick = async () => {
    setShowModal(true);
    setModalContent(
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );

    try {
      const response = await fetch(`http://100.102.21.101:8000/getResume?srn=${studentSRN}`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setResumeData(url);

      setModalContent(
        <div className="p-6 bg-white rounded-lg shadow-lg flex flex-col items-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Resume</h2>
          <div className="w-full h-[600px] overflow-y-auto">
            <iframe
              src={url}
              frameBorder="0"
              title="Resume"
              className="w-full h-full"
            />
          </div>
        </div>
      );
    } catch (error) {
      console.error("Error fetching resume data:", error);
      setResumeData("Error loading resume data. Please try again later.");
      setModalContent(
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-red-600">Error loading resume data</h2>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      );
    }
  };
  


  const closeModal = () => {
    setShowModal(false);
    setModalContent(null);
  };

  return (
    
    <AnimatePresence>
      {isLoading ? (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black flex items-center justify-center"
        >
          <div className="text-white text-2xl">Loading...</div>
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="landing-container"
          style={{
            backgroundImage: `url(${Background})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '100vh',
            width: '100vw',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          <main className="flex-grow flex flex-col items-center justify-center w-full max-w-2xl">
  <div className="text-center mb-16"> {/* Increased the bottom margin here */}
    <div className="flex items-center justify-center mb-8"> {/* Increased space below the avatar and name */}
      <img className="w-20 h-20 rounded-full mr-4" src="https://avatar.iran.liara.run/public/36" alt="User's avatar" />
      <h1 className="text-4xl font-bold text-amber-100">{studentName}</h1>
    </div>
    <div className="text-amber-200 max-w-2xl mx-auto mt-8"> {/* Added margin-top to the info section */}
      {studentInfo && (
        <div className="text-amber-200 max-w-2xl mx-auto text-center space-y-6"> {/* Increased vertical space between info items */}
          <div className="flex flex-wrap justify-center gap-6"> {/* Added more gap between items */}
            <p className="flex items-center space-x-2">
              <MdEmail className="mr-0.5" size={21} /> <span>Email:</span> <span>{studentInfo.email}</span>
            </p>
            <p className="flex items-center space-x-2">
              {studentInfo.gender === 'Male' ? (
                <FaMale className="mr-0.5" size={21} />
              ) : (
                <FaFemale className="mr-0.5" size={21} />
              )}
              <span>Gender:</span> <span>{studentInfo.gender}</span>
            </p>
            <p className="flex items-center space-x-2">
              <FaGraduationCap className="mr-0.5" size={21} /> <span>Degree:</span> <span>{studentInfo.degree}</span>
            </p>
            <p className="flex items-center space-x-2">
              <BsFillCalendarFill className="mr-0.5" size={21} /> <span>Semester:</span> <span>{studentInfo.sem}</span>
            </p>
            <p className="flex items-center space-x-2">
              <FaUserCircle className="mr-0.5" size={21} /> <span>Age:</span> <span>{studentInfo.age}</span>
            </p>
            <p className="flex items-center space-x-2">
              <GiRank1 className="mr-0.5" size={21} /> <span>CGPA:</span> <span>{studentInfo.cgpa}</span>
            </p>
            <p className="flex items-center space-x-2">
              <FaGraduationCap className="mr-0.5" size={21} /> <span>Stream:</span> <span>{studentInfo.stream}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  </div>
            <motion.div 
              className="grid grid-cols-2 gap-4 w-full"
              variants={container}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={item} onClick={() => handleCardClick('GitHub', studentSRN)}>
                <Card 
                  backgroundColor="rgba(255, 255, 255, 0.6)" 
                  borderColor="rgba(36, 41, 46, 1)" 
                  glowColor="rgba(36, 41, 46, 0.2)" 
                  title="GitHub" 
                  content="GitHub stats and activity" 
                  icon={<FaGithub size={48} />}
                />
              </motion.div>
              <motion.div variants={item} onClick={() => handleCardClick('LeetCode', studentSRN)}>
                <Card 
                  backgroundColor="rgba(255, 255, 255, 0.6)" 
                  borderColor="rgba(255, 161, 22, 1)" 
                  glowColor="rgba(255, 161, 22, 0.2)" 
                  title="LeetCode" 
                  content="LeetCode statistics" 
                  icon={<SiLeetcode size={48} />}
                />
              </motion.div>
              {/* New Mentor Session Card */}
  <motion.div variants={item} onClick={() => handleCardClick('MentorSession', studentSRN)}>
    <Card 
      backgroundColor="#BFEE90"  // Green background for Mentor Session card
      borderColor="rgba(34, 139, 34, 1)" 
      glowColor="rgba(34, 139, 34, 0.2)" 
      title="Mentor Session" 
      content="View session details" 
      icon={<FaChalkboardTeacher size={48} />}  // Replace with a relevant icon if needed
    />
  </motion.div>
  {/* LinkedIn Card */}
  <motion.div variants={item} onClick={handleLinkedInClick}>
                <Card 
                  backgroundColor="#ADD8E6"  
                  borderColor="#005983"  
                  glowColor="rgba(0, 119, 181, 0.2)"  
                  title="LinkedIn" 
                  content="LinkedIn page" 
                  icon={<FaLinkedin size={48} />}  
                />
              </motion.div>
  
            </motion.div>
            <button 
              onClick={handleResumeClick}
              className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
            >
              View Resume
            </button>
          </main>

          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-800 bg-opacity-90 flex items-center justify-center p-4"
            >
              <div className="bg-white text-black rounded-lg w-full max-w-4xl shadow-lg relative">
                <button 
                  onClick={closeModal} 
                  className="absolute top-2 right-4 text-xl bg-red-500 text-white px-2 py-1 rounded z-50"
                >
                  ✖
                </button>
                <div className="max-h-[80vh]">
                  {modalContent}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};