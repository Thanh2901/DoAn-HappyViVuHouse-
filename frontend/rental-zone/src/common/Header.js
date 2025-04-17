import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import "./Profile.css";

class Header extends Component {
    state = {
        isDropdownOpen: false,
    };

    toggleDropdown = () => {
        this.setState((prevState) => ({
            isDropdownOpen: !prevState.isDropdownOpen,
        }));
    };

    handleLogout = () => {
        this.props.onLogout();
        this.setState({ isDropdownOpen: false }); // Đóng dropdown sau khi logout
    };

    // Hàm để lấy chữ cái đầu của từ cuối cùng trong tên
    getLastNameInitial = (name) => {
        if (!name) return ""; // Kiểm tra nếu name không tồn tại
        const nameParts = name.trim().split(" "); // Tách tên thành mảng các từ
        const lastName = nameParts[nameParts.length - 1]; // Lấy từ cuối cùng
        return lastName[0] ? lastName[0].toUpperCase() : ""; // Lấy chữ cái đầu và chuyển thành chữ hoa
    };

    render() {
        console.log("logout", this.props.onLogout);
        return (
            <>
                <nav className="navbar navbar-default navbar-trans navbar-expand-lg fixed-top p-0">
                    <div className="container">
                        <button
                            className="navbar-toggler collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#navbarDefault"
                            aria-controls="navbarDefault"
                            aria-expanded="false"
                            aria-label="Toggle navigation"
                        >
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                        <a className="navbar-brand text-brand" href="/">
                            <span className="color-b">HappyViVu</span> House
                        </a>

                        <div className="navbar-collapse collapse justify-content-center" id="navbarDefault">
                            <ul className="navbar-nav">
                                <li className="nav-item">
                                    <NavLink
                                        className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                                        to="/"
                                    >
                                        Home
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink
                                        className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                                        to="/rental-home"
                                    >
                                        Rental House
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink
                                        className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                                        to="/contact"
                                    >
                                        Contact
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink
                                        className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                                        to="/angent-gird"
                                    >
                                        Rentaler
                                    </NavLink>
                                </li>
                            </ul>
                        </div>

                        {!this.props.authenticated ? (
                            <div className="auth-buttons" style={{ display: "flex", gap: "10px" }}>
                                <button type="button" className="btn btn-outline-success">
                                    <NavLink
                                        className={({ isActive }) => (isActive ? "active" : "")}
                                        to="/login"
                                        style={{ textDecoration: "none", color: "green" }}
                                    >
                                        Sign In
                                    </NavLink>
                                </button>
                                <button type="button" className="btn btn-outline-success">
                                    <NavLink
                                        className={({ isActive }) => (isActive ? "active" : "")}
                                        to="/signup"
                                        style={{ textDecoration: "none", color: "green" }}
                                    >
                                        Sign Up
                                    </NavLink>
                                </button>
                                <button type="button" className="btn btn-success">
                                    <NavLink
                                        className={({ isActive }) => (isActive ? "active" : "")}
                                        to="/login-rentaler"
                                        style={{ textDecoration: "none", color: "white" }}
                                    >
                                        News Release
                                    </NavLink>
                                </button>
                            </div>
                        ) : (
                            <div className="profile-container dropdown p-0">
                                <div
                                    className="profile-avatar dropdown-toggle"
                                    onClick={this.toggleDropdown}
                                    role="button"
                                    aria-expanded={this.state.isDropdownOpen}
                                >
                                    {this.props.currentUser.imageUrl ? (
                                        <img
                                            src={this.props.currentUser.imageUrl}
                                            alt={this.props.currentUser.name}
                                            className="avatar-img"
                                        />
                                    ) : (
                                        <div className="text-avatar">
                                            <span className="fs-14">
                                                {this.getLastNameInitial(this.props.currentUser.name)}
                                            </span>
                                        </div>
                                    )}
                                    <span className="user-name ms-2">{this.props.currentUser.name}</span>
                                </div>
                                <ul
                                    className={`dropdown-menu ${this.state.isDropdownOpen ? "show" : ""}`}
                                    aria-labelledby="profileDropdown"
                                >
                                    <li>
                                        <NavLink className="dropdown-item" to="/profile" onClick={this.toggleDropdown}>
                                            Profile
                                        </NavLink>
                                    </li>
                                    <li>
                                        <button
                                            className="dropdown-item"
                                            onClick={this.handleLogout}
                                        >
                                            Log Out
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </nav>
            </>
        );
    }
}

export default Header;