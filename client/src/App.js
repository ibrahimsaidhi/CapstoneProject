import React from 'react';
import io from "socket.io-client";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/Login'; 
import AllChatsPage from "./pages/AllChats";
import RegisterPage from './pages/Registration'; 
import HomePage from './pages/Home'; 
import Chat from './pages/Chat';
import ContactsPage from './pages/Contacts';
import ActivatePage from './pages/Activate';
import ResendActivationPage from './pages/ResendActivation';
import ForgotPassword from "./pages/ForgotPassword";
import Profile from './pages/Profile';

const socket = io("http://localhost:5000")

function App() {
    return (
      <Router>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/activate" element={<ActivatePage />} />
          <Route path="/resend-activation" element={<ResendActivationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registration" element={<RegisterPage />} />
          <Route path="/" element={<HomePage />}>
            <Route path="/allchats" element={<AllChatsPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="/chat" element={<Chat socket={socket} />} />
        </Routes>
      </Router>
    );
  }
  

export default App;