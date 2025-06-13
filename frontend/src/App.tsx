import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { MentorLogin } from './pages/MentorLogin';
import Mentor_session from './pages/Mentor_session';
import MainPage from './pages/MainPage'; // ✅ Import the new MainPage

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/mentor-login" element={<MentorLogin />} />
        <Route path="/mentor-session" element={<Mentor_session />} />
        <Route path="/landing" element={<Landing />} />
        {/* <Route path="/main" element={<MainPage />} /> ✅ New route added */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
