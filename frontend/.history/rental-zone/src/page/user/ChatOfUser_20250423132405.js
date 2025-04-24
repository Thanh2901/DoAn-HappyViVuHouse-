import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Header from "../../common/Header";
import Footer from "../../common/Footer";
import Message from '../messages/pages/Home';
import SidebarNav from "./SidebarNav";
import { getCurrentUser } from "../../services/fetch/ApiUtils";

const ChatOfUser = (props) => {
    const { authenticated, onLogout, location } = props;
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch user data when component mounts
        if (authenticated) {
            getCurrentUser()
                .then(data => {
                    console.log("Fetched user data:", data);
                    setUserData(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Error fetching user data:", err);
                    setError(err);
                    setLoading(false);
                });
        }
    }, [authenticated]);

    if (!authenticated) {
        return <Navigate
            to={{
                pathname: "/login",
                state: { from: location }
            }} />;
    }

    if (loading) {
        return <div className="loading-spinner">Loading user information...</div>;
    }

    if (error) {
        return <div className="error-message">Error loading user data. Please try again later.</div>;
    }

    return (
        <>
            <Header authenticated={authenticated} currentUser={userData} onLogout={onLogout} />
            <div style={{ marginTop: "90px" }}>
            </div>
            <main id="main">
                <div className="wrapper">
                    <nav id="sidebar" className="sidebar js-sidebar">
                        <div className="sidebar-content js-simplebar">
                            <a className="sidebar-brand" href="/profile">
                                USER
                            </a>
                            <SidebarNav />
                        </div>
                    </nav>
                    <div className="main">
                        <main style={{ margin: "20px 20px 20px 20px" }}>
                            <Message 
                                authenticated={authenticated} 
                                currentUser={userData} 
                                onLogout={onLogout}
                                userType="user"
                            />
                        </main>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default ChatOfUser;