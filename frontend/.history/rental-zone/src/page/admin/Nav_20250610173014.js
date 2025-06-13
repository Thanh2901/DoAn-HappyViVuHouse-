import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import "./NavAdmin.css"; // Đổi tên file CSS để nhất quán

// Component con cho Dropdown Menu
const UserDropdown = ({ currentUser, onLogout }) => {
  if (!currentUser) {
    return <div className="nav-link text-muted">No user logged in</div>;
  }

  return (
    <li className="nav-item dropdown">
      <a
        className="nav-link dropdown-toggle d-none d-sm-inline-block"
        href="#"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        aria-label="User settings"
      >
        <img
          src={currentUser.avatar || "../../assets/img/default-avatar.jpg"}
          className="avatar img-fluid rounded me-1"
          alt={currentUser.name || "User"}
        />
        <span className="text-dark">{currentUser.name}</span>
      </a>
      <a
        className="nav-icon dropdown-toggle d-inline-block d-sm-none"
        href="#"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        aria-label="User settings (mobile)"
      >
        <i className="align-middle" data-feather="settings"></i>
      </a>
      <div className="dropdown-menu dropdown-menu-end">
        <div className="dropdown-divider"></div>
        <button className="dropdown-item" onClick={onLogout}>
          Logout
        </button>
      </div>
    </li>
  );
};

// Component chính
const Nav = ({ currentUser, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sử dụng useCallback để tối ưu hóa hiệu suất
  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  return (
    <nav className="navbar navbar-expand navbar-light navbar-bg">
      <button
        className={`sidebar-toggle js-sidebar-toggle ${sidebarOpen ? "active" : ""}`}
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <i className="hamburger align-self-center"></i>
      </button>

      <div className={`navbar-collapse collapse ${sidebarOpen ? "show" : ""}`}>
        <ul className="navbar-nav navbar-align">
          <UserDropdown currentUser={currentUser} onLogout={onLogout} />
        </ul>
      </div>
    </nav>
  );
};

// Kiểm tra kiểu cho props
Nav.propTypes = {
  currentUser: PropTypes.shape({
    name: PropTypes.string,
    avatar: PropTypes.string,
  }),
  onLogout: PropTypes.func.isRequired,
};

export default Nav;