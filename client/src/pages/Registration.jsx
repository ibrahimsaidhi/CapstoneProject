import React, { useState } from "react";
import '../styles/Registration.css';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import logo from "../images/parlons_logo.png";

/**
 *  Potential TODO add field to re-enter password, and maybe add an icon to right side of password field to show passowrd 
 **/

const Registration = () => {
  const navigate = useNavigate();
  const [passwordType, setPasswordType] = useState("password");
  const [errorMessage, seterrorMessage] = useState("");
  const [formData, setFormData] = useState({username: "", email: "", name: "", password: "", picture: "/path/pic1"});
  
  //allows cookies to be saved to browser and sent in future request
  const api = axios.create({
    baseURL: process.env.REACT_APP_PARLONS_URL,
    withCredentials: true,  
  });
  
  //Handle input change for each field. Sets input text to appropriate property for formData
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
    seterrorMessage("");
  };

  /**
   * toggles type for password field, to hide or show password text
   */
  function showPassword() {
    if (passwordType === "password") {
      setPasswordType("text")
    } else {
      setPasswordType("password")
    }
  }

  /**
   * Handles submiting the form. Calls on /registation/create post method and moves user
   * to new page with thier user id if registartion is valid or alerts them if not
  **/
  const handleSubmit = (event) => 
  {
    event.preventDefault();

    // Make the POST request
    api.post('/auth/registration/', formData)
        .then((response) => {
          alert("Sign Up Is Successful. We've sent an email to you to verify you email address and to activate your account. The link in the email will expire in 24 hours");
          navigate('../login');
        })
        .catch((error) => {
          console.log(error);
          if (error.response.status === 400 || 500)
          {
            seterrorMessage(error.response.data.message);
          }
          else{
            seterrorMessage("Registration failed due to server error. Please try again.");
          }
        });
  };

  return <div className="background">
            <div className="logo">
              <img className="parlons-image"
                              src={logo} 
                              alt={'parlons'} 
              />
            </div>
            <div className="registrationSquare"> 
              <h1> Sign Up</h1> 
              <form className="registrationForm" onSubmit={handleSubmit}>
                <input type="text" id="name" name="name" placeholder="Name" onChange={handleChange} required/><br/>
                <input type="email" id="email" name="email" placeholder="Email" onChange={handleChange} required/><br/>
                <input type="text" id="username" name="username" placeholder="Username" onChange={handleChange} required/><br/>
                <input type={passwordType} id="password" name="password" placeholder="Password"   onChange={handleChange} required/><br/> 
                <input type="checkbox" onChange={() => showPassword()} id="showPassword" name="showPassword" value="showPassword"/>
                <label htmlFor="showPassword"> Show Password</label> <br/>
                {errorMessage && <p className="errorText">{errorMessage}</p>}
                <input type="submit" value="Sign Up"/>
              </form>
              <p> Already have an account? <Link to="../login" >Sign in now </Link> </p>
          </div>
        </div>;
      
  };
  
  export default Registration;