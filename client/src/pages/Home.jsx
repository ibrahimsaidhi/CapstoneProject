import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Navbar, NavbarBrand, NavbarItem } from '@nextui-org/react';
import axios from 'axios';
import '../styles/home.css';

function Home() {

  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');


  const api = axios.create({
    baseURL: "http://localhost:5000/api",
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


  return (
    <>
      <Navbar className="navbar">
        <NavbarBrand>Messaging App</NavbarBrand>
        <br/>
        <h3>Hello, {fullName}!</h3>
        <br/>
        <NavbarItem>
          <NavLink to="/allchats" activeClassName="active">Chats</NavLink>
          &nbsp; &nbsp;
          <NavLink to="/contacts" activeClassName="active">Contacts</NavLink>
          &nbsp; &nbsp;
          <button onClick={handleLogout}>Logout</button>
        </NavbarItem>
      </Navbar>
      <br/>
      <div className="content">
        <Outlet />
      </div>
    </>
  );
}

export default Home;