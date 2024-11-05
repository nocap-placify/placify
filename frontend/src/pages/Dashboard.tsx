import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from "../components/card";
import Background from '../assets/backgroundblue.png';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { SiLeetcode, SiHackerrank } from 'react-icons/si';

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

export const Dashboard = () => {
  const location = useLocation();
  const studentName = location.state?.studentName || 'Unknown Student';
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  useEffect(() => {
    const img = new Image();
    img.src = Background;
    img.onload = () => setIsLoading(false);
  }, []);

  const handleCardClick = (type) => {
    if (type === 'GitHub') {
      setModalContent(<div>GitHub data fetched from the database...</div>);
    } else if (type === 'LeetCode') {
      setModalContent(<div>LeetCode statistics and activities fetched from the database...</div>);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
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
                  Hello, {studentName} – <br />Crafting Creative Code!
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
              <motion.div variants={item} onClick={() => handleCardClick('GitHub')}>
                <Card 
                  backgroundColor="rgba(255, 255, 255, 0.6)" 
                  borderColor="rgba(36, 41, 46, 1)" 
                  glowColor="rgba(36, 41, 46, 0.2)" 
                  title="GitHub" 
                  content="GitHub stats and activity" 
                  icon={<FaGithub size={48} />}
                />
              </motion.div>
              <motion.div variants={item} onClick={() => handleCardClick('LeetCode')}>
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
          </main>

          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-800 bg-opacity-90 flex items-center justify-center p-4"
            >
              <div className="bg-white text-black rounded-lg p-8 w-full max-w-4xl shadow-lg relative">
                <button 
                  onClick={closeModal} 
                  className="absolute top-2 right-4 text-xl bg-red-500 text-white px-2 py-1 rounded"
                >
                  ✖
                </button>
                <div>{modalContent}</div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
