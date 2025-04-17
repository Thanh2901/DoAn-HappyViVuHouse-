import React from "react";
import { NavLink } from "react-router-dom";
import "./SidebarNav.css"; // Thêm file CSS riêng

const SidebarNav = () => {
    return (
        <ul className="sidebar-nav">
            {/*<li className="sidebar-header">*/}
            {/*    Quản lý chức năng*/}
            {/*</li>*/}
            <li className="sidebar-item">
                <NavLink
                    to="/profile"
                    className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
                >
                    <i className="bi bi-person align-middle me-2"></i>
                    <span className="align-middle">Hồ sơ cá nhân</span>
                </NavLink>
            </li>
            <li className="sidebar-item">
                <NavLink
                    to="/room-hired"
                    className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
                >
                    <i className="bi bi-house-door align-middle me-2"></i>
                    <span className="align-middle">Lịch sử thuê trọ</span>
                </NavLink>
            </li>
            <li className="sidebar-item">
                <NavLink
                    to="/request-status"
                    className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
                >
                    <i className="bi bi-check-circle align-middle me-2"></i>
                    <span className="align-middle">Trạng thái yêu cầu</span>
                </NavLink>
            </li>
            <li className="sidebar-item">
                <NavLink
                    to="/follow-agents"
                    className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
                >
                    <i className="bi bi-people align-middle me-2"></i>
                    <span className="align-middle">Người theo dõi</span>
                </NavLink>
            </li>
            <li className="sidebar-item">
                <NavLink
                    to="/save-blog"
                    className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
                >
                    <i className="bi bi-bookmark align-middle me-2"></i>
                    <span className="align-middle">Lưu bài đăng</span>
                </NavLink>
            </li>
            <li className="sidebar-item">
                <NavLink
                    to="/message"
                    className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
                >
                    <i className="bi bi-chat align-middle me-2"></i>
                    <span className="align-middle">Tin nhắn</span>
                </NavLink>
            </li>
            <li className="sidebar-item">
                <NavLink
                    to="/change-password"
                    className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
                >
                    <i className="bi bi-lock align-middle me-2"></i>
                    <span className="align-middle">Đổi mật khẩu</span>
                </NavLink>
            </li>
        </ul>
    );
};

export default SidebarNav;