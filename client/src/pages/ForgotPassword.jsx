import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import '../styles/ForgotPassword.css';

function ForgotPassword() {

    const [queryParameters] = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [code, setCode] = useState('');
  
  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true,  
  });

  const navigate = useNavigate();

  React.useEffect(() => 
    {
        setCode(queryParameters.get("code"));
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

  const handleSubmit = (event) => 
  {
    event.preventDefault();
    setErrorMessage('');

    if (!code)
    {
      const userData = {
        email: email,
      };

      api.post('/auth/forgot-password', userData)
      .then((response) => {
        setSuccessMessage('An email has been sent to reset your password');
        setTimeout(() => navigate('/'), 1000);
      })
      .catch((error) => {
        setErrorMessage(error.response.data.error);
      });

    }
    else
    {
      if (password === confirmPassword)
      {
        const userData = {
          password: password,
          code:code,
        };
  
        api.post('/auth/change-forgotten-password', userData)
        .then((response) => {
          setSuccessMessage('Your password has been reset succesfully');
          setTimeout(() => navigate('/login'), 1000);
        })
        .catch((error) => {
          console.log(error);
          if (error.response.status === 400 || 500)
          {
            setErrorMessage(error.response.data.message);
          }
          else{
            setErrorMessage("Password change failed due to server error. Please try again.");
          }
        });
      }
      else
      {
        setErrorMessage("Both passwords should be the same");
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="background">
      <div className="forgotPasswordSquare">
        <h1>Forgot Your Password?</h1>
        {!code && <p>Please enter the email you used to sign in to Parlons</p>}
        {code && <p>Please enter your new password below</p>}
        <form className="forgotPasswordForm" onSubmit={handleSubmit}>
        {!code &&
          <><input
              type="email"
              value={email}
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
              required />
            <br />
            <input type="submit" value="Submit" /></>
        }
        {code &&
          <><input
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
                required />
              <br />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                placeholder="Confirm Password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                required />
              <br />
              <input
                type="checkbox"
                onChange={togglePasswordVisibility}
                id="showPassword"
                name="showPassword"
                value="showPassword" />
              <label htmlFor="showPassword"> Show Password</label>
              <br />
              <input type="submit" value="Submit" /></>
        }
        </form>
        <p> Remember Your Password? <Link to="../login" >Sign in now </Link> </p>
        
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      </div>
    </div>
  );
}

export default ForgotPassword;