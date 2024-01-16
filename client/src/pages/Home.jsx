import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Navbar, NavbarBrand, NavbarItem } from '@nextui-org/react';
import '../styles/home.css';

function Home() {

  return (
    <>
      <Navbar className="navbar">
        <NavbarBrand>Messaging App</NavbarBrand>
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