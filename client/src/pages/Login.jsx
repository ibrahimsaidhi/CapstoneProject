import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/login.css';
import logo from "../images/parlons_logo.png";


function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const api = axios.create({
    baseURL: process.env.REACT_APP_PARLONS_URL,
    withCredentials: true,  
  });

  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    const userData = {
      username: username,
      password: password,
    };

    api.post('/auth/login', userData)
      .then((response) => {
        sessionStorage.setItem("name", response.data.userInfo.name);
        sessionStorage.setItem("profilePic", response.data.userInfo.picture);
        sessionStorage.setItem("token", response.data.token);
        setErrorMessage('');
        setSuccessMessage('Login successful!');
        setTimeout(() => navigate('/'), 1000);
      })
      .catch((error) => {
        setErrorMessage(error.response.data.error);
        setUsername('');
        setPassword('');
      });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    
    <div className="background">
      <div className="logo">
        <img className="parlons-image"
                        src={logo} 
                        alt={'parlons'} 
        />
      </div>
      <div className="loginSquare">
        <h1>Login</h1>
        <form className="loginForm" onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <br/>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <br/>
          <input 
            type="checkbox" 
            onChange={togglePasswordVisibility} 
            id="showPassword" 
            name="showPassword" 
            value="showPassword"
          />
          <label htmlFor="showPassword"> Show Password</label> <br/>
          <input type="submit" value="Login"/>
        </form>
        <p> No account? <Link to="/registration">Register here</Link> </p>
        <div class = "extraLinks">
          <Link to="/forgot-password">Forgot password?</Link>
          <Link to="/resend-activation">Resend activation email?</Link>
        </div>

        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      </div>
    </div>
  );
}

export default Login;