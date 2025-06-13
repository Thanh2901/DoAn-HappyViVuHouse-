import React from "react";
import { Link } from "react-router-dom";
import i18n from "../../utils/i18n/i18n";
import './NavRentaler.css';
import { useSelector, useDispatch } from "react-redux";
import { setVietnamese, setEnglish } from "../../redux/actions/languageAction";
import { resetMessageCount } from "../../redux/actions/messageAction";

const Nav = (props) => {
  const { currentUser, onLogout } = props;
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const language = useSelector((state) => state.language.language);
  const newMessageCount = useSelector(state => state.messages.newMessageCount || 0);
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

  // Handle click vào chat icon - reset message count
  const handleChatClick = () => {
    console.log('💬 Chat icon clicked - resetting message count from', newMessageCount, 'to 0');
    if (newMessageCount > 0) {
      dispatch(resetMessageCount());
    }
  };

  console.log("User", currentUser);
  console.log("📊 Nav - Current new message count:", newMessageCount);

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
          
          {/* Chat icon dropdown with message count */}
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
                {/* Badge hiển thị số tin nhắn mới */}
                {newMessageCount > 0 && (
                  <span
                    className="position-absolute translate-middle badge rounded-pill bg-danger"
                    style={{
                      top: '0px',
                      left: '100%',
                      fontSize: '0.7rem',
                      minWidth: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 0 2px white'
                    }}
                  >
                    {newMessageCount > 99 ? '99+' : newMessageCount}
                    <span className="visually-hidden">tin nhắn mới</span>
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
                    : 'Không có tin nhắn mới'
                  }
                </div>
              </div>
              <div className="list-group list-group-flush">
                {newMessageCount > 0 ? (
                  <div className="list-group-item">
                    <div className="row g-0 align-items-center">
                      <div className="col-2">
                        <div 
                          className="bg-primary rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: '32px', height: '32px' }}
                        >
                          <i className="bi bi-chat-dots text-white"></i>
                        </div>
                      </div>
                      <div className="col-10 ps-2">
                        <div className="text-dark">Bạn có {newMessageCount} tin nhắn chưa đọc</div>
                        <div className="text-muted small mt-1">
                          Nhấp để xem chi tiết
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="list-group-item text-center py-3">
                    <div className="text-muted">
                      <i className="bi bi-chat-square-dots fs-3 mb-2 d-block"></i>
                      Không có tin nhắn mới
                    </div>
                  </div>
                )}
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