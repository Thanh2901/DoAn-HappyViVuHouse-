import React from "react";
import { NavLink } from 'react-router-dom';
import { translate } from "../../utils/i18n/translate";

const SidebarNav = () => {
  return (
    <ul className="sidebar-nav">
      <li className="sidebar-item">
        <NavLink to="/rentaler" className="sidebar-link">
          <i className="bi bi-speedometer2 align-middle me-2"></i>
          <span className="align-middle">
            {translate("rentaler:sidebar:dashboard")}
          </span>
        </NavLink>
      </li>
      <li className="sidebar-item">
        <NavLink to="/rentaler/room-management" className="sidebar-link">
          <i className="bi bi-house-door align-middle me-2"></i>
          <span className="align-middle">
            {translate("rentaler:sidebar:rental_rooms_management")}
          </span>
        </NavLink>
      </li>
      <li className="sidebar-item">
        <NavLink to="/rentaler/maintenance-management" className="sidebar-link">
          <i className="bi bi-tools align-middle me-2"></i>
          <span className="align-middle">
            {translate("rentaler:sidebar:maintenance_management")}
          </span>
        </NavLink>
      </li>
      <li className="sidebar-item">
        <NavLink to="/rentaler/contract-management" className="sidebar-link">
          <i className="bi bi-file-earmark-text align-middle me-2"></i>
          <span className="align-middle">
            {translate("rentaler:sidebar:contracts_management")}
          </span>
        </NavLink>
      </li>
      <li className="sidebar-item">
        <NavLink to="/rentaler/request-management" className="sidebar-link">
          <i className="bi bi-inbox align-middle me-2"></i>
          <span className="align-middle">
            {translate("rentaler:sidebar:requests_management")}
          </span>
        </NavLink>
      </li>
      <li className="sidebar-item">
        <NavLink to="/rentaler/electric_water-management" className="sidebar-link">
          <i className="bi bi-lightning-charge align-middle me-2"></i>
          <span className="align-middle">
            {translate("rentaler:sidebar:electric_and_water_management")}
          </span>
        </NavLink>
      </li>
      <li className="sidebar-item">
        <NavLink to="/rentaler/playback" className="sidebar-link">
          <i className="bi bi-play-circle align-middle me-2"></i>
          <span className="align-middle">
            {translate("rentaler:sidebar:playback")}
          </span>
        </NavLink>
      </li>
      <li className="sidebar-item">
        <NavLink to="/rentaler/camera-management" className="sidebar-link">
          <i className="bi bi-camera-video align-middle me-2"></i>
          <span className="align-middle">
            {translate("rentaler:sidebar:camera_management")}
          </span>
        </NavLink>
      </li>
    </ul>
  )
}

export default SidebarNav;