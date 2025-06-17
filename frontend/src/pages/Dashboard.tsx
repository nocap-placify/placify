import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation ,useNavigate} from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from "../components/card";
import Background from '../assets/backgroundblue.png';
import trash from '../assets/garbag.png';
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
import { ReactComponent as LeaderboardIcon } from '../assets/leaderboard-svgrepo-com.svg';
import { FaBookOpen } from 'react-icons/fa';
import { FaRegFileAlt } from 'react-icons/fa';
import ChatbotModal from '../components/ChatbotModal';


interface MousePosition {
  x: number;
  y: number;
}
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
interface Student {
  srn: string;
  name: string;
}
export const Dashboard = () => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [scale, setScale] = useState(1);
  const location = useLocation();
  const navigate = useNavigate(); // Initialize navigate function
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
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [cgpaStats, setCgpaStats] = useState(null);
  const [leetcodeStats, setLeetcodeStats] = useState(null);
  const [redButtonResponse, setRedButtonResponse] = useState<string | null>(null);
  const [confirmationModal, setConfirmationModal] = useState(false); // New state for confirmation modal

  const [selectedStats, setSelectedStats] = useState('cgpa');
  const [cgpaData, setCgpaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  // State to track footer visibility
  const [showFooter, setShowFooter] = useState(true);
  // const [showModal, setShowModal] = useState(false);
  // const [modalContent, setModalContent] = useState(null);

  useEffect(() => {
    // Log whenever selectedStats is updated
    console.log('Selected Stats changed:', selectedStats);
    window.setSelectedStats = setSelectedStats; // Expose setSelectedStats function to global scope
  }, [selectedStats]);

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
  const handleRedButtonClick = () => {
    setConfirmationModal(true); // Open the confirmation modal
  };
  const confirmDelete = async () => {
    setRedButtonResponse("Loading...");
    setConfirmationModal(false); // Close confirmation modal

    try {
      const response = await axios.get(`http://100.102.21.101:8000/deleteStudent?srn=${studentSRN}`);
      if (response.status === 200) {
        console.log("Student deleted successfully!");
      
        setTimeout(() => navigate("/"), 2000); // Redirect to landing page after 2 seconds
      } else {
        setRedButtonResponse("Failed to delete student.");
      }
    } catch (error) {
      console.error("Error during API call:", error);
      setRedButtonResponse("Error occurred. Please try again.");
    }
  };
  const closeConfirmationModal = () => {
    setConfirmationModal(false); // Close the modal without deleting
  };



  // const handleLinkedInClick = () => {
  //   if (linkedinUrl) {
  //     window.open(linkedinUrl, "_blank"); // Open LinkedIn URL in a new tab
  //   } else {
  //     console.error("LinkedIn URL not available");
  //   }
  // };
  // Function to fetch CGPA rank data
const fetchCgpaStats = async (srn) => {
  try {
    const response = await axios.get(`http://100.102.21.101:8000/getCGPAStatistics?srn=${srn}`);
    console.log("CGPA Stats Response:", response.data);  // Log the respons
    setCgpaStats(response.data);


    return response.data;
  } catch (error) {
    console.error('Error fetching CGPA stats:', error);
    return null;
  }
};

// Function to fetch LeetCode rank data
const fetchLeetcodeStats = async (srn) => {
  try {
    const response = await axios.get(`http://100.102.21.101:8000/getLeetCodeStatistics?srn=${srn}`);
    console.log("leetcode Stats Response:", response.data);  // Log the respons
    setLeetcodeStats(response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching LeetCode stats:', error);
    return null;
  }
};
const handleChatbotClick = () => {
  setShowFooter(false);
  setShowModal(true);
  setModalContent(<ChatbotModal srn={studentSRN} />);
};


const [modalText, setModalText] = useState("");
const handleStatsCardClick = async (srn) => {
  openModalWithLoading();

  try {
    const cgpaData = await fetchCgpaStats(srn);
    const leetcodeData = await fetchLeetcodeStats(srn);

    if (cgpaData && leetcodeData) {
      const cgpaLeaderboard = cgpaData.leaderboard || [];
      const cgpaRelativeRank = cgpaData.relative_rank;
      const leetcodeLeaderboard = leetcodeData.leaderboard || [];
      const leetcodeRelativeRank = leetcodeData.relative_rank;

      let selectedStats = 'cgpa';

      const handleStatToggle = () => {
        selectedStats = selectedStats === 'cgpa' ? 'leetcode' : 'cgpa';
        renderModalContent();
      };

      const renderModalContent = () => {
        setModalContent(
          <div className="p-6 bg-white rounded-lg shadow-lg relative" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute top-2 right-2 text-gray-700"
              onClick={() => {
                console.log("Close button clicked");
                closeModal();
              }}
            />

            <h2 className="text-2xl font-bold text-gray-800 mb-4">Stats</h2>

            {/* Toggle Switch */}
            <div className="flex items-center mb-6">
              <div
                className="relative inline-flex items-center cursor-pointer w-16 h-8 bg-gray-200 rounded-full"
                onClick={handleStatToggle}
                aria-label="Toggle between CGPA and LeetCode stats"
              >
                <span
                  className={`absolute w-8 h-8 bg-purple-500 rounded-full shadow-md transform transition-transform ${
                    selectedStats === 'cgpa' ? 'translate-x-0' : 'translate-x-8'
                  }`}
                ></span>
              </div>
            </div>

            {/* Conditionally render CGPA stats */}
            {selectedStats === 'cgpa' && (
              <>
                <div className="text-lg font-semibold text-gray-700 mb-4">CGPA Rank Stats:</div>
                <ul className="space-y-2 mb-4">
                  {cgpaLeaderboard.map((entry, index) => (
                    <li key={index} className="text-gray-600">
                      <span className="font-medium">Name:</span> {entry.name},
                      <span className="font-medium"> CGPA:</span> {entry.cgpa},
                      <span className="font-medium"> Rank:</span> {entry.rank}
                    </li>
                  ))}
                </ul>
                <div className="text-gray-800 font-semibold mb-4">
                  CGPA Relative Rank: {cgpaRelativeRank}
                </div>
              </>
            )}

            {/* Conditionally render Leetcode stats */}
            {selectedStats === 'leetcode' && (
              <>
                <div className="text-lg font-semibold text-gray-700 mb-4">LeetCode Rank Stats:</div>
                <ul className="space-y-2">
                  {leetcodeLeaderboard.map((entry, index) => (
                    <li key={index} className="text-gray-600">
                      <span className="font-medium">Name:</span> {entry.name},
                      <span className="font-medium"> Rank:</span> {entry.rank}
                    </li>
                  ))}
                </ul>
                <div className="text-gray-800 font-semibold">
                  LeetCode Relative Rank: {leetcodeRelativeRank}
                </div>
              </>
            )}
          </div>
        );
      };

      renderModalContent();
    } else {
      setModalContent(
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-red-600">Error loading stats data</h2>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      );
    }
  } catch (error) {
    console.error("Error fetching stats:", error);
    setModalContent(
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-red-600">Error loading stats data</h2>
        <p className="text-gray-600">Please try again later.</p>
      </div>
    );
  }
};



// Open modal with loading spinner
const openModalWithLoading = () => {
  setShowModal(true); // Open the modal
  setModalContent(
    <div className="flex justify-center items-center min-h-[200px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
    </div>
  );
};

// Close modal

// Handle the button click (CGPA or LeetCode)
const handleStatButtonClick = (stat, cgpaLeaderboard, cgpaRelativeRank, leetcodeLeaderboard, leetcodeRelativeRank) => {
  // Close the modal and reload it with new stats
  setShowModal(false);

  setTimeout(() => {
    setSelectedStats(stat); // Update the selected stats
    openModalWithLoading(); // Reopen the modal with loading spinner

    // Update the modal content based on selected stats
    setModalContent(
      <div
        className="p-6 bg-white rounded-lg shadow-lg relative"
        onClick={(e) => e.stopPropagation()} // Prevent click event from closing modal
      >
        {/* Close Button */}
        <button
          className="absolute top-2 right-2 text-gray-700 hover:text-gray-900"
          onClick={() => closeModal()}
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Stats</h2>

        {/* Toggle Buttons for CGPA and LeetCode */}
        <div className="flex space-x-4 mb-4">
          <button
            className={`px-4 py-2 rounded ${
              stat === 'cgpa' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-800'
            }`}
            onClick={() => handleStatButtonClick('cgpa', cgpaLeaderboard, cgpaRelativeRank, leetcodeLeaderboard, leetcodeRelativeRank)}
          >
            CGPA
          </button>
          <button
            className={`px-4 py-2 rounded ${
              stat === 'leetcode' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-800'
            }`}
            onClick={() => handleStatButtonClick('leetcode', cgpaLeaderboard, cgpaRelativeRank, leetcodeLeaderboard, leetcodeRelativeRank)}
          >
            LeetCode
          </button>
        </div>

        {/* CGPA Stats */}
        {stat === 'cgpa' && (
          <>
            <div className="text-lg font-semibold text-gray-700 mb-4">CGPA Rank Stats:</div>
            <ul className="space-y-2 mb-4">
              {cgpaLeaderboard.map((entry, index) => (
                <li key={index} className="text-gray-600">
                  <span className="font-medium">Name:</span> {entry.name},
                  <span className="font-medium"> CGPA:</span> {entry.cgpa},
                  <span className="font-medium"> Rank:</span> {entry.rank}
                </li>
              ))}
            </ul>
            <div className="text-gray-800 font-semibold mb-4">
              CGPA Relative Rank: {cgpaRelativeRank}
            </div>
          </>
        )}

        {/* LeetCode Stats */}
        {stat === 'leetcode' && (
          <>
            <div className="text-lg font-semibold text-gray-700 mb-4">LeetCode Rank Stats:</div>
            <ul className="space-y-2">
              {leetcodeLeaderboard.map((entry, index) => (
                <li key={index} className="text-gray-600">
                  <span className="font-medium">Name:</span> {entry.name},
                  <span className="font-medium"> Rank:</span> {entry.rank}
                </li>
              ))}
            </ul>
            <div className="text-gray-800 font-semibold">
              LeetCode Relative Rank: {leetcodeRelativeRank}
            </div>
          </>
        )}
      </div>
    );
  }, 0); // Slight delay to ensure modal closes before reopening
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
    setIsResumeOpen(prev => !prev);
    setShowFooter(false); // Show footer depending on modal state
    setShowModal(true); // Open the modal
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
        setModalContent(
            <div className="p-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-xl font-bold text-red-600">Error loading resume data</h2>
                <p className="text-gray-600">Please try again later.</p>
            </div>
        );
    }
};

const handleResumeClick2 = () => {
  window.open('http://localhost:8000/fe.html', '_blank');
};

  const closeModal = () => {
    setShowFooter(true);
    setShowModal(false);
    setModalContent(null);
  };

  return(
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


        <AnimatePresence>
        <motion.div
          className="absolute top-4 right-4"
          variants={item}
          initial="hidden"
          animate="visible"
          exit="hidden"
          style={{ zIndex: 1000 }}
        >
          <button
            onClick={handleRedButtonClick}
            className="bg-red-500 hover:bg-red-600 transition duration-300 rounded-full p-3"
            style={{ position: 'relative', zIndex: 1000 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>

          {/* Display the response or loading message */}
          {redButtonResponse && (
            <motion.div
              className="mt-4 text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p>{redButtonResponse}</p>
            </motion.div>
          )}
        </motion.div>

        {/* Confirmation Modal */}
        {confirmationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-800 bg-opacity-90 flex items-center justify-center p-4"
            style={{ zIndex: 1050 }}
          >
            <div className="bg-white text-black rounded-lg w-full max-w-md p-6 shadow-lg relative">
              <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
              <p>Are you sure you want to delete this student?</p>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  Yes
                </button>
                <button
                  onClick={closeConfirmationModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-full hover:bg-gray-400"
                >
                  No
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>



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
            //backgroundImage: `url(${Background})`,
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
          <main className="flex-grow flex flex-col items-center justify-center w-full max-w-5xl">
  <div className="text-center mb-8"> {/* Increased the bottom margin here */}
    <div className="flex items-center justify-center mb-6"> {/* Increased space below the avatar and name */}
      <img className="w-20 h-20 rounded-full mr-4" src="https://avatar.iran.liara.run/public/36" alt="User's avatar" />
      <h1 className="text-4xl font-bold text-amber-100">{studentName}</h1>
    </div>
    <div className="text-amber-200 max-w-2xl mx-auto mt-6"> {/* Added margin-top to the info section */}
      {studentInfo && (
        <div className="text-amber-200 max-w-2xl mx-auto text-center space-y-6"> {/* Increased vertical space between info items */}
          <div className="flex flex-wrap justify-center gap-6"> {/* Added more gap between items */}
            <p className="flex items-center space-x-2">
            <MdEmail className="mr-0.5" size={21} /> <span>Email:</span>
  <a href={`mailto:${studentInfo.email}`} className="underline hover:text-blue-700">
    {studentInfo.email}
  </a>

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
  <div className="flex flex-col gap-y-3.5 w-full ">  {/* Parent container with vertical gap */}

  {/* Row 1: GitHub and LeetCode and linkedIN*/}
  <motion.div
    className="grid grid-cols-3 gap-4 w-full"
    variants={container}
    initial="hidden"
    animate="visible"
  >
    <motion.div
    variants={item} onClick={() => handleCardClick('GitHub', studentSRN)}>
      <Card
        backgroundColor="rgba(255, 255, 255, 0.6)"
        borderColor="rgba(36, 41, 46, 1)"
        glowColor="rgba(36, 41, 46, 0.2)"
        title="GitHub"
        content="GitHub stats and activity "
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

    <motion.div variants={item} onClick={handleLinkedInClick}>
      <Card
        backgroundColor="#ADD8E6"
        borderColor="#005983"
        glowColor="rgba(0, 119, 181, 0.2)"
        title="LinkedIn"
        content="LinkedIn page "
        icon={<FaLinkedin size={48} />}
      />
    </motion.div>


  </motion.div>


  {/* Row 2: Mentor Session and stats */}
  <motion.div
    className="grid grid-cols-2  gap-x-6 w-full  "
    variants={container}
    initial="hidden"
    animate="visible"
  >
    <motion.div
     className="w-[350px] h-[120px] mx-auto  -mr-1"
    variants={item} onClick={() => handleCardClick('MentorSession', studentSRN)}>
      <Card
        backgroundColor="#BFEE90"  // Green background for Mentor Session card
        borderColor="rgba(34, 139, 34, 1)"
        glowColor="rgba(34, 139, 34, 0.2)"
        title="Mentor Session"
        content="View session details"
        icon={<FaChalkboardTeacher size={48} />}
      />
    </motion.div>

    <motion.div
    className="w-[350px] h-[120px] mx-auto -ml-1 "  // Set width to 345px and center it
      variants={item}
      onClick={() => handleStatsCardClick(studentSRN)}
    >
      <Card
        backgroundColor="#FFFFCC"  // Light yellow background for the Stats card
        borderColor="rgba(218, 165, 32, 1)"
        glowColor="rgba(218, 165, 32, 0.2)"
        title="Stats"
        content="Rank Stats"
        icon={<GiCoinsPile size={48} />}  // Icon for Stats card
      />
    </motion.div>



  </motion.div>



  {/* Row 3: resume */}
  <motion.div
    className="grid grid-cols-1 gap-4 w-full justify-items-center"
    variants={container}
    initial="hidden"
    animate="visible"
  >
    <motion.div
    className="w-[350px] h-[115px] mx-auto"  // Set width to 345px and center it
      variants={item}
      onClick={() => handleResumeClick(studentSRN)}
    >
      <Card
        backgroundColor="#FFE4E1"  // Pastel pink background
        borderColor="rgba(255, 192, 203, 1)"  // Pastel pink border color
        glowColor="rgba(255, 192, 203, 0.4)"  // Pastel pink glow color
        title="Resume"
        content="View resume"
        icon={<FaRegFileAlt size={48} />}  // Icon for Stats card
      />
    </motion.div>


  </motion.div>


</div>
          </main>

       {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-800 bg-opacity-90 flex items-center justify-center p-4"
            >
              <div
  className="rounded-2xl w-full max-w-4xl relative overflow-hidden backdrop-blur-md border border-white/10"
  style={{
    background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  }}
>

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
    <AnimatePresence>
  <motion.div
    className="fixed bottom-6 right-6 z-50"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.3 }}
  >
    <button
      onClick={handleChatbotClick}
      className="relative px-6 py-3 rounded-full bg-white text-blue-800 font-semibold text-sm z-10 overflow-hidden border-2 border-blue-400 shadow-md transition duration-300 hover:shadow-blue-400/70"
      style={{
        boxShadow: '0 0 20px rgba(59,130,246,0.4), 0 0 40px rgba(59,130,246,0.3)',
      }}
    >
      <span className="z-10 relative">💬 Chatbot Assistant</span>
      <span
        className="absolute inset-0 rounded-full opacity-30 blur-xl"
        style={{
          background: 'radial-gradient(circle at center, rgba(59,130,246,0.4), transparent 70%)',
        }}
      />
    </button>
  </motion.div>
</AnimatePresence>


  {showFooter && (
        <footer
          className="absolute bottom-0 w-full text-center text-gray-500 text-sm mb-4"
          style={{
            opacity: 0.7,
          }}
        >
          Made with <span className="text-pink-500">🩵</span> by{' '}
          <a href="https://github.com/nocap-placify" className="underline">
            nocap-placify
          </a>.
        </footer>
      )}


        <style jsx>{`
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
            .w-16.h-8 {
            width: 64px;
            height: 32px;
          }

          .w-8.h-8 {
            width: 32px;
            height: 32px;
          }

          .transition-transform {
            transition: transform 0.3s ease;
          }

          .bg-purple-500 {
            background-color: #6b46c1;
          }
        `}</style>
    </div>
  );
};
