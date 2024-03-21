import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/ResendActivation.css';

function ResendActivation() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const api = axios.create({
    baseURL: process.env.REACT_APP_PARLONS_URL,
    withCredentials: true,  
  });

  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrorMessage('');
    const userData = {
      username: username,
      password: password,
      email:email,
    };

    api.post('/auth/resend-activation', userData)
      .then((response) => {
        alert("Re-send is successful. We've sent a new email to you to verify you email address and to activate your account. The link in the email will expire in 24 hours");
        navigate('../login');
      })
      .catch((error) => {
        setErrorMessage(error.response.data.error);
        setUsername('');
        setPassword('');
        setEmail('');
      });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="background">
      <div className="resendSquare">
        <h1>Activation Code Request</h1>
        <p>If you did not receive an e-mail to activate your account or your link expired, enter your username, password and email address here to receive a new activation link</p>
        <form className="resendForm" onSubmit={handleSubmit}>
            <input
            type="email"
            value={email}
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <br/>
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
          <input type="submit" value="Submit"/>
        </form>
        <p> Already have an active account? <Link to="../login" >Sign in now </Link> </p>
        
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      </div>
    </div>
  );
}

export default ResendActivation;