import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/Login'; 
import AllChatsPage from "./pages/AllChats";
import RegisterPage from './pages/Registration'; 
import HomePage from './pages/Home'; 

function App() {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registration" element={<RegisterPage />} />
          <Route path="/allchats" element={<AllChatsPage />} />
          <Route path="/" element={<HomePage />} />
        </Routes>
      </Router>
    );
  }
  

export default App;