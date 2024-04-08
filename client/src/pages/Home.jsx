import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Navbar, NavbarBrand, NavbarItem } from '@nextui-org/react';
import axios from 'axios';
import '../styles/home.css';
import logo from "../images/parlons_logo.png";

function Home() {

  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [isChildRouteActive, setIsChildRouteActive] = useState(false);



  const api = axios.create({
    baseURL: process.env.REACT_APP_PARLONS_URL,
    withCredentials: true,  
  });


  useEffect(() => {
    // Check if token is present in session storage
    const token = sessionStorage.getItem("token");
    if (!token) {
      // If token is not present, redirect to login page
      console.log("No token. Redirecting to login");
      navigate('/login');
    } else {
      api.post('/auth/refreshAccessToken')
        .then(response => {
          setFullName(sessionStorage.getItem("name"));
        })
        .catch(error => {
          // If token verification fails, remove token and redirect to login page
          console.error('Token verification failed:', error);
          alert(error);
          sessionStorage.removeItem("token");
          navigate('/login');
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps  
  }, [navigate]);



  const handleLogout = () => {
    api.post('/auth/logout')
      .then(response => {
        alert(response.data.message); 
        sessionStorage.removeItem("name");
        sessionStorage.removeItem("token");
        setTimeout(() => navigate('/login'), 1000);
      })
      .catch(error => {
        console.error('Logout failed:', error);
      });
  };

  // Function to update state when a child route is clicked
  const handleNavLinkClick = () => {
    setIsChildRouteActive(true);
  };


  return (
    <>
      <Navbar >
        <NavbarItem className="navbar">
        <NavbarBrand><img className="parlons-image"
                      src={logo} 
                      alt={'parlons'} 
                    /></NavbarBrand>
          <br/>
          <h3 className="name">Hello, {fullName}!</h3>
          <br/>
          <div className="right-bar">
            <NavLink className="chats" to="/chatblock" activeClassName="active" onClick={handleNavLinkClick}>
            <svg  xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="chats-icon" viewBox="0 0 16 16">
                                <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
            </svg>
            </NavLink>
            &nbsp; &nbsp;
            <NavLink className="contacts" to="/contacts" activeClassName="active" onClick={handleNavLinkClick}>
            <svg  xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="contacts-icon" viewBox="0 0 16 16">
              <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/>
            </svg>
            </NavLink>
            &nbsp; &nbsp;
            <NavLink className="profile" to="/profile" activeClassName="active" onClick={handleNavLinkClick}>
              {/* <img className="parlons-image"
                        src={} 
                        alt={'parlons'} 
                      /> */}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="profile-icon" viewBox="0 0 16 16">
                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm12 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1v-1c0-1-1-4-6-4s-6 3-6 4v1a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z"/>
              </svg>
            </NavLink>
            &nbsp; &nbsp;
            <button onClick={handleLogout}>Logout</button>
          </div>
        </NavbarItem>
      </Navbar>
      <br/>
      <div className="content">
        {/* Render welcome message if no child route is active */}
        {!isChildRouteActive && (
          <div className="welcome-message">
            <h2>Welcome to Parlons!</h2>
            <p>Select the chat or contact icon to get started.</p>
          </div>
        )}

        {/* Outlet for rendering child routes */}
        <Outlet context={[setIsChildRouteActive]} />
      </div>
    </>
  );
}

export default Home;