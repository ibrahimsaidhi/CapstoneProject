import React, { useState } from "react";
import '../styles/Registration.css';
import { useNavigate } from 'react-router-dom';

/**
 * TODO need to display password requirement, make display look better, potentialy add
 * field to renter password
 **/

const Registration = () => {
  const navigate = useNavigate();
  const [passwordType, setPasswordType] = useState("password");
  const [formData, setFormData] = useState({username: "", email: "", name: "", password: "", picture: "/path/pic1"});
  
  //Handle input change for each field. Sets input text to appropriate property for formData
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
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
  const handleSubmit = async (event) => 
  {
    event.preventDefault();
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    };

    try {
      
      const response = await fetch('http://localhost:5000/api/auth/registration/', requestOptions);
      const data = await response.json();
      
      if (response.ok) {
        navigate('../allchats', { state: data.userId });
      }
      else
      {
        alert("Registration failed. " +data.message);
      }
    } 
    catch (error) {
      alert("Registration failed due to server error");
      console.log(error);
    }
    
  };

  return <div className="background">
      <div className="registrationSquare"> 
      <form onSubmit={handleSubmit}>

      <label htmlFor="name">Name:</label><br/>
      <input type="text" id="name" name="name" placeholder="Name" onChange={handleChange} required/><br/>
      
      <label htmlFor="email">Email:</label><br/>
      <input type="email" id="email" name="email" placeholder="Email" onChange={handleChange} required/><br/>

      <label htmlFor="username">Username:</label><br/>
      <input type="text" id="username" name="username" placeholder="Username" onChange={handleChange} required/><br/>

      <label htmlFor="password">Password:</label><br/>
      <input type={passwordType} id="password" name="password" placeholder="Password"   onChange={handleChange} required/><br/>

      <input type="checkbox" onChange={() => showPassword()} id="showPassword" name="showPassword" value="showPassword"/>
      <label htmlFor="showPassword"> Show Password</label><br></br>

      <input type="submit" value="Submit"/>
      <button type="button" onClick={function() {navigate('/login')}}>Login</button> 
    </form>
    </div>
    </div>;
      
  };
  
  export default Registration;