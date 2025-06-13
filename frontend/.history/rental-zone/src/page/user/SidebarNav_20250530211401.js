import React from "react";
import { NavLink } from "react-router-dom";
import "./SidebarNav.css"; // Custom CSS

const SidebarNav = () => {
    return (
        <ul className="sidebar-nav">
            {/*<li className="sidebar-header">*/}
            {/*    Function Management*/}
            {/*</li>*/}
            <li className="sidebar-item">
                <NavLink
                    to="/profile"
                    className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
                >
                    <i className="bi bi-person align-middle me-2"></i>
                    <span className="align-middle">Profile</span>
                </NavLink>
            </li>
            <li className="sidebar-item">
                <NavLink
                    to="/room-hired"
                    className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
                >
                    <i className="bi bi-house-door align-middle me-2"></i>
                    <span className="align-middle">Rental History</span>
                </NavLink>
            </li>
            <li className="sidebar-item">
                <NavLink
                    to="/request-status"
                    className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
                >
                    <i className="bi bi-check-circle align-middle me-2"></i>
                    <span className="align-middle">Request Status</span>
                </NavLink>
            </li>
            <li className="sidebar-item">
                <NavLink
                    to="/follow-agents"
                    className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
                >
                    <i className="bi bi-people align-middle me-2"></i>
                    <span className="align-middle">Following Agents</span>
                </NavLink>
            </li>
            <li className="sidebar-item">
                <NavLink
                    to="/save-blog"
                    className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
                >
                    <i className="bi bi-bookmark align-middle me-2"></i>
                    <span className="align-middle">Saved Posts</span>
                </NavLink>
            </li>
            <li className="sidebar-item">
                <NavLink
                    to="/message"
                    className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
                >
                    <i className="bi bi-chat align-middle me-2"></i>
                    <span className="align-middle">Messages</span>
                </NavLink>
            </li>
            <li className="sidebar-item">
                <NavLink
                    to="/change-password"
                    className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
                >
                    <i className="bi bi-lock align-middle me-2"></i>
                    <span className="align-middle">Change Password</span>
                </NavLink>
            </li>
        </ul>
    );
};

export default SidebarNav;