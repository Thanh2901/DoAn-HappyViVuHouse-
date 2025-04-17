import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom";
import './NavRentaler.css'

const Nav = (props) => {
  const { currentUser, onLogout } = props;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Toggle sidebar function
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
    // Apply the toggle class to the body element to affect the sidebar
    document.body.classList.toggle('sidebar-collapsed');
  };

  console.log("User", currentUser)

  return (
      <nav className="navbar navbar-expand navbar-light navbar-bg">
        <button
            className={`sidebar-toggle js-sidebar-toggle mx-3 ${sidebarCollapsed ? 'collapsed' : ''}`}
            onClick={toggleSidebar}
        >
          <i className="hamburger align-self-center"></i>
        </button>
        <div className="navbar-collapse collapse">
          <ul className="navbar-nav navbar-align">
            <li className="nav-item dropdown">
              <a className="nav-icon dropdown-toggle" href="#" id="messagesDropdown" data-bs-toggle="dropdown">
                <div className="position-relative">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-message-square align-middle"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </div>
              </a>
              <div className="dropdown-menu dropdown-menu-lg dropdown-menu-end py-0" aria-labelledby="messagesDropdown">
                <div className="dropdown-menu-header">
                  <div className="position-relative">
                    4 tin nhắn mới
                  </div>
                </div>
                <div className="dropdown-menu-footer">
                  <Link className="text-muted" to={'/rentaler/chat'}>
                    Xem tất cả tin nhắn
                  </Link>
                </div>
              </div>
            </li>
            <li className="nav-item dropdown">
              <a className="nav-icon dropdown-toggle d-inline-block d-sm-none" href="#" data-bs-toggle="dropdown">
                <i className="align-middle" data-feather="settings"></i>
              </a>
              <a className="nav-link dropdown-toggle d-none d-sm-inline-block" href="#" data-bs-toggle="dropdown">
                {
                  currentUser && currentUser.imageUrl ? (
                      <img src={currentUser.imageUrl} className="avatar img-fluid rounded me-1" alt={currentUser.name} />
                  ) : (
                      <img src="../../assets/img/author-2.jpg" className="avatar img-fluid rounded me-1" alt="Charles Hall" />
                  )
                }
                <span className="text-dark">{currentUser === null ? "" : currentUser.name}</span>
              </a>
              <div className="dropdown-menu dropdown-menu-end">
                <Link className="dropdown-item" to={'/rentaler/profile'}>
                  Trang cá nhân
                </Link>
                <Link className="dropdown-item" to={'/rentaler/change-password'}>
                  Đổi mật khẩu
                </Link>
                <div className="dropdown-divider"></div>
                <a className="dropdown-item" onClick={onLogout}>Đăng xuất</a>
              </div>
            </li>
          </ul>
        </div>
      </nav>
  )
}

export default Nav;