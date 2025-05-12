import React from "react";
import { Link, NavLink } from 'react-router-dom';

const SidebarNav = () => {
  return (
    <ul className="sidebar-nav">
      {/*<li className="sidebar-header">*/}
      {/*  Quản lí chức năng*/}
      {/*</li>*/}
      <li className="sidebar-item">
        <NavLink to="/rentaler" className="sidebar-link">
          <i className="align-middle" data-feather="sliders"></i> <span className="align-middle">Statistics</span>
        </NavLink>
      </li>
      <li className="sidebar-item">
        <NavLink to="/rentaler/room-management" className="sidebar-link">
          <i className="align-middle" data-feather="sliders"></i> <span className="align-middle">Rental rooms management</span>
        </NavLink>
      </li>
      <li className="sidebar-item">
        <NavLink to="/rentaler/maintenance-management" className="sidebar-link">
          <i className="align-middle" data-feather="sliders"></i> <span className="align-middle">Maintenance management</span>
        </NavLink>
      </li>
      <li className="sidebar-item">
        <NavLink to="/rentaler/contract-management" className="sidebar-link">
          <i className="align-middle" data-feather="sliders"></i> <span className="">Contracts management</span>
        </NavLink>
      </li>
      <li className="sidebar-item">
        <NavLink to="/rentaler/request-management" className="sidebar-link">
          <i className="align-middle" data-feather="sliders"></i> <span className="align-middle">Requests management</span>
        </NavLink>
      </li>
      <li className="sidebar-item">
        <NavLink to="/rentaler/electric_water-management" className="sidebar-link">
          <i className="align-middle" data-feather="sliders"></i> <span className="align-middle"> Electric and water management</span>
        </NavLink>
      </li>
    </ul>
  )
}

export default SidebarNav;