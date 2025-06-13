import React from "react";
import { Link } from "react-router-dom";
import i18n from "../../utils/i18n/i18n";
import './NavRentaler.css';
import { useSelector, useDispatch } from "react-redux";
import { setVietnamese, setEnglish } from "../../redux/actions/languageAction";
import { setMessageCount } from "../../redux/actions/messageActions"; // Add this import

const Nav = (props) => {
  const { currentUser, onLogout } = props;
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const language = useSelector((state) => state.language.language);
  const newMessageCount = useSelector((state) => state.message.newMessageCount); // Get message count from Redux
  const dispatch = useDispatch();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
    document.body.classList.toggle('sidebar-collapsed');
  };

  const handleLanguageChange = (lang) => {
    if (lang === "vi") {
      dispatch(setVietnamese());
    } else if (lang === "en") {
      dispatch(setEnglish());
    }
    i18n.changeLanguage(lang);
    localStorage.setItem("i18nextLng", lang);
  };

  // Handle clicking on chat dropdown - reset message count
  const handleChatClick = () => {
    dispatch(setMessageCount(0));
  };

  console.log("User", currentUser);

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
          {/* Language Switcher Dropdown */}
          <li className="nav-item dropdown">
            <a
              className="nav-link dropdown-toggle d-flex align-items-center text-dark"
              href="#"
              id="langDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ minWidth: 140, transition: 'all 0.2s ease' }}
            >
              <span className="me-2" role="img" aria-label="language">🌐</span>
              <span className="fw-semibold">
                {language === "vi" ? "Tiếng Việt" : "English"}
              </span>
            </a>
            <ul
              className="dropdown-menu dropdown-menu-end shadow-lg border-0"
              aria-labelledby="langDropdown"
              style={{
                minWidth: 180,
                borderRadius: '8px',
                padding: '0.5rem 0',
                backgroundColor: '#fff',
              }}
            >
              <li>
                <button
                  className={`dropdown-item d-flex align-items-center py-2 px-3 ${
                    language === "vi" ? "active" : ""
                  }`}
                  onClick={() => handleLanguageChange("vi")}
                  style={{
                    transition: 'background-color 0.2s ease',
                    fontWeight: language === "vi" ? '600' : '400',
                  }}
                >
                  <span className="me-2" role="img" aria-label="vi">🇻🇳</span>
                  Tiếng Việt
                  {language === "vi" && (
                    <i className="bi bi-check2 ms-auto text-primary"></i>
                  )}
                </button>
              </li>
              <li>
                <button
                  className={`dropdown-item d-flex align-items-center py-2 px-3 ${
                    language === "en" ? "active" : ""
                  }`}
                  onClick={() => handleLanguageChange("en")}
                  style={{
                    transition: 'background-color 0.2s ease',
                    fontWeight: language === "en" ? '600' : '400',
                  }}
                >
                  <span className="me-2" role="img" aria-label="en">🇺🇸</span>
                  English
                  {language === "en" && (
                    <i className="bi bi-check2 ms-auto text-primary"></i>
                  )}
                </button>
              </li>
            </ul>
          </li>
          {/* Chat icon dropdown */}
          <li className="nav-item dropdown">
            <a
              className="nav-icon dropdown-toggle"
              href="#"
              id="messagesDropdown"
              data-bs-toggle="dropdown"
              onClick={handleChatClick}
            >
              <div className="position-relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-message-square align-middle"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                {/* Badge for new message count */}
                {newMessageCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                    <span className="visually-hidden">New messages</span>
                  </span>
                )}
              </div>
            </a>
            <div
              className="dropdown-menu dropdown-menu-lg dropdown-menu-end py-0"
              aria-labelledby="messagesDropdown"
            >
              <div className="dropdown-menu-header">
                <div className="position-relative">
                  {newMessageCount > 0 
                    ? `${newMessageCount} tin nhắn mới` 
                    : "Không có tin nhắn mới"
                  }
                </div>
              </div>
              <div className="dropdown-menu-footer">
                <Link 
                  className="text-muted" 
                  to={'/rentaler/chat'}
                  onClick={handleChatClick}
                >
                  Xem tất cả tin nhắn
                </Link>
              </div>
            </div>
          </li>
          {/* User Profile Dropdown */}
          <li className="nav-item dropdown">
            <a
              className="nav-icon dropdown-toggle d-inline-block d-sm-none"
              href="#"
              data-bs-toggle="dropdown"
            >
              <i className="align-middle" data-feather="settings"></i>
            </a>
            <a
              className="nav-link dropdown-toggle d-none d-sm-inline-block"
              href="#"
              data-bs-toggle="dropdown"
            >
              {currentUser && currentUser.imageUrl ? (
                <img
                  src={currentUser.imageUrl}
                  className="avatar img-fluid rounded me-1"
                  alt={currentUser.name}
                />
              ) : (
                <img
                  src="../../assets/img/author-2.jpg"
                  className="avatar img-fluid rounded me-1"
                  alt="Charles Hall"
                />
              )}
              <span className="text-dark">
                {currentUser === null ? "" : currentUser.name}
              </span>
            </a>
            <div className="dropdown-menu dropdown-menu-end">
              <Link className="dropdown-item" to={'/rentaler/profile'}>
                Trang cá nhân
              </Link>
              <Link className="dropdown-item" to={'/rentaler/change-password'}>
                Đổi mật khẩu
              </Link>
              <div className="dropdown-divider"></div>
              <a className="dropdown-item" onClick={onLogout}>
                Đăng xuất
              </a>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Nav;