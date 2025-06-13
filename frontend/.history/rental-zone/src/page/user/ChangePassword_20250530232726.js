import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom'
import SidebarNav from './SidebarNav';
import '../../assets/css/app.css';
import { changePassword } from '../../services/fetch/ApiUtils';
import { toast } from 'react-toastify';
import Header from '../../common/Header';
import Footer from '../../common/Footer';

function ChangePasswordOfUser(props) {
    console.log("Props:", props)
    const { authenticated, exit, role, currentUser, location, onLogout } = props;

    const [passwordRequest, setPasswordRequest] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleSubmit = (event) => {
        event.preventDefault();

        const changePasswordRequest = Object.assign({}, passwordRequest);
        // Handle form submission logic
        changePassword(changePasswordRequest).then(response => {
            toast.success(response.message);
            exit();
        }).catch(error => {
            toast.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
        }
        )
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setPasswordRequest((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    if (!props.authenticated) {
        return <Navigate
            to={{
                pathname: "/login-rentaler",
                state: { from: location }
            }} />;
    }

    return (
        <>
            <Header authenticated={authenticated} currentUser={currentUser} onLogout={onLogout} />
            <div style={{ marginTop: "90px" }}>
            </div>
            <main id="main">
                <div className="wrapper">
                    <nav id="sidebar" className="sidebar js-sidebar">
                        <div className="sidebar-content js-simplebar">
                            <a className="sidebar-brand" href="/profile">USER</a>
                            <SidebarNav />
                        </div>
                    </nav>

                    <div className="main">
                        <main style={{ margin: "20px 20px 20px 20px" }}>
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title">Change Password</h5>

                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <label className="form-label" htmlFor="inputPasswordCurrent">Current Password</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="inputPasswordCurrent"
                                                name="oldPassword"
                                                value={passwordRequest.oldPassword}
                                                onChange={handleChange}
                                            />
                                            <small><a href="/forgot-password">Forgot password?</a></small>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label" htmlFor="inputPasswordNew">New Password</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="inputPasswordNew"
                                                name="newPassword"
                                                value={passwordRequest.newPassword}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label" htmlFor="inputPasswordNew2">Confirm New Password</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="inputPasswordNew2"
                                                name="confirmPassword"
                                                value={passwordRequest.confirmPassword}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-primary">Save</button>
                                    </form>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}

export default ChangePasswordOfUser;