import React, { useState } from "react";
import "./NavaAdmin.css"

const Nav = (props) => {
    const { currentUser, onLogout } = props;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
        // Toggle a class on the document body to control sidebar visibility
        document.body.classList.toggle("sidebar-toggled");
        // This assumes you have a sidebar element with id="sidebar"
        document.getElementById("sidebar")?.classList.toggle("toggled");
    };

    return (
        <nav className="navbar navbar-expand navbar-light navbar-bg">
            <a
                className={`sidebar-toggle js-sidebar-toggle ${sidebarOpen ? 'active' : ''}`}
                onClick={toggleSidebar}
            >
                <i className="hamburger align-self-center"></i>
            </a>

            <div className="navbar-collapse collapse">
                <ul className="navbar-nav navbar-align">
                    <li className="nav-item dropdown">
                        <a className="nav-icon dropdown-toggle d-inline-block d-sm-none" href="#" data-bs-toggle="dropdown">
                            <i className="align-middle" data-feather="settings"></i>
                        </a>

                        <a className="nav-link dropdown-toggle d-none d-sm-inline-block" href="#" data-bs-toggle="dropdown">
                            <img src={require("../../assets/img/logo_brand.jpg")} className="avatar img-fluid rounded me-1" alt="Logo" />
                            <span className="text-dark">{currentUser === null ? "" : currentUser.name}</span>
                        </a>
                        <div className="dropdown-menu dropdown-menu-end">
                            <div className="dropdown-divider"></div>
                            <a className="dropdown-item" onClick={onLogout}>Logout</a>
                        </div>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Nav;