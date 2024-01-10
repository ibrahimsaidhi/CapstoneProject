import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/Login'; 
import RegisterPage from './pages/Registration'; 
import HomePage from './pages/Home'; 
import ChatsPage from "./pages/Chats";

function App() {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/chats" element={<ChatsPage />} />
          <Route path="/" element={<HomePage />} />
        </Routes>
      </Router>
    );
  }
  

export default App;