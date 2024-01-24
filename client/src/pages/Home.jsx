import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Navbar, NavbarBrand, NavbarItem, NavbarMenuToggle } from '@nextui-org/react';
import '../styles/home.css';

function Home() {
  
  const [fullName, setFullName] = useState('');
  useEffect (()=>{setFullName(sessionStorage.getItem("name"))});

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