import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { MentorLogin} from './pages/MentorLogin';
import Mentor_session from './pages/Mentor_session';
import {StudentLogin} from './pages/StudentLogin';
import StudentFormPage from './pages/StudentForm';
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/mentor-session" element={<Mentor_session />} />
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/mentor-login" element={<MentorLogin />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/student-form" element={<StudentFormPage />} />




      </Routes>
    </Router>
  );
};

export default App;
