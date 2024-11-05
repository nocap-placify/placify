import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from "../components/card";
import Background from '../assets/backgroundblue.png';
import { FaGithub } from 'react-icons/fa';
import { SiLeetcode } from 'react-icons/si';

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

  useEffect(() => {
    const img = new Image();
    img.src = Background;
    img.onload = () => setIsLoading(false);
  }, []);
  
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

  const fetchResumeData = async (srn) => {
    try {
      const response = await axios.get(`http://100.102.21.101:8000/getResume?srn=${srn}`);
      setResumeData(response.data); // Assuming API returns { resumeText: "Resume content here" }
    } catch (error) {
      console.error("Error fetching resume data:", error);
      setResumeData("Error loading resume data. Please try again later.");
    }
    setShowModal(true);
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
              LeetCode:<a
              
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
    }
  };

  const handleResumeClick = async () => {
    if (!studentSRN) {
      console.error("SRN is undefined");
      return;
    }
    setModalContent(
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
    await fetchResumeData(studentSRN);
    setModalContent(
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Resume</h2>
        <p className="text-gray-600 whitespace-pre-wrap">{resumeData}</p>
      </div>
    );
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
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <img className="w-20 h-20 rounded-full mr-4" src="https://avatar.iran.liara.run/public/36" alt="David's avatar" />
                <h1 className="text-4xl font-bold text-amber-100">
                  Hello, {studentName}  – <br />Crafting Creative Code!
                </h1>
              </div>
              <p className="text-amber-200 max-w-2xl mx-auto">
                As a creative developer, I blend code and design to build unique, user-centric experiences. Let's turn your ideas into a dynamic and engaging digital reality!
              </p>
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