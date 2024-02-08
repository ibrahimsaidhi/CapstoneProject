import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Navbar, NavbarBrand, NavbarItem } from '@nextui-org/react';
import axios from 'axios';
import '../styles/home.css';

function Home() {

  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState('');
  useEffect (()=>{setFullName(sessionStorage.getItem("name"))});

  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true,  
  });

const handleLogout = () => {
  api.post('/auth/logout')
    .then(response => {
      alert(response.data.message); 
      sessionStorage.removeItem("name");
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