import React from "react";
import { NavLink } from 'react-router-dom';

const SidebarNav = () => {
  return (
    <ul className="sidebar-nav">
      <li className="sidebar-item">
        <NavLink to="/admin" className="sidebar-link">
          <i className="bi bi-speedometer2 align-middle me-2"></i>
          <span className="align-middle">Dashboard</span>
        </NavLink>
      </li>
      <li className="sidebar-item">
        <NavLink to="/admin/account-management" className="sidebar-link">
          <i className="bi bi-people align-middle me-2"></i>
          <span className="align-middle">Account Management</span>
        </NavLink>
      </li>
      <li className="sidebar-item">
        <NavLink to="/admin/room-management" className="sidebar-link">
          <i className="bi bi-house-door align-middle me-2"></i>
          <span className="align-middle">Room Management</span>
        </NavLink>
      </li>
      <li className="sidebar-item">
        <NavLink to="/admin/room-management" className="sidebar-link">
          <i className="bi bi-house-door align-middle me-2"></i>
          <span className="align-middle">Room Management</span>
        </NavLink>
      </li>
    </ul>
  )
}

export default SidebarNav;