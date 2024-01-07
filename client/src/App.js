import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/loginPage/Login'; 
import RegisterPage from './pages/registerPage/Register'; 
import HomePage from './pages/homePage/Home'; 

function App() {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<HomePage />} />
        </Routes>
      </Router>
    );
  }
  

export default App;