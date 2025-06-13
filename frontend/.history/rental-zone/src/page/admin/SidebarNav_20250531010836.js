import React from "react";
import { NavLink } from 'react-router-dom';

const SidebarNav = () => {
  return (
    <ul className="sidebar-nav">
      <li className="sidebar-item">
        <NavLink to="/admin" className="sidebar-link">
          <i className="align-middle" data-feather="sliders"></i> <span className="align-middle">Dashboard</span>
        </NavLink>
      </li>
      <li className="sidebar-item">
        <NavLink to="/admin/account-management" className="sidebar-link">
          <i className="align-middle" data-feather="users"></i> <span className="align-middle">Account Management</span>
        </NavLink>
      </li>
      <li className="sidebar-item">
        <NavLink to="/admin/room-management" className="sidebar-link">
          <i className="align-middle" data-feather="home"></i> <span className="align-middle">Room Management</span>
        </NavLink>
      </li>
    </ul>
  )
}

export default SidebarNav;