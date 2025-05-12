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
        // Only fetch if authenticated
        if (authenticated) {
            console.log("Fetching user data...");
            
            // Check for token
            const token = localStorage.getItem("ACCESS_TOKEN");
            if (!token) {
                console.error("No access token available");
                setError("Authentication required");
                setLoading(false);
                return;
            }
            
            getCurrentUser()
                .then(data => {
                    console.log("API response:", data);
                    if (data) {
                        setUserData(data);
                        console.log("User data set successfully:", data);
                    } else {
                        console.error("Empty user data received");
                        setError("No data received");
                    }
                })
                .catch(err => {
                    console.error("Error fetching user data:", err);
                    setError(err.message || "Failed to load user data");
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [authenticated]);

    // If not authenticated, redirect to login
    if (!authenticated) {
        return <Navigate to="/login" state={{ from: location }} />;
    }

    // If loading, show loading indicator
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <span className="ms-2">Loading user information...</span>
            </div>
        );
    }

    // If error, show error message
    if (error) {
        return (
            <div className="alert alert-danger m-3" role="alert">
                <h4 className="alert-heading">Error Loading Data</h4>
                <p>{error}</p>
                <hr />
                <p className="mb-0">Please try refreshing the page or logging in again.</p>
            </div>
        );
    }

    // If no data, show message
    if (!userData) {
        return (
            <div className="alert alert-warning m-3" role="alert">
                <h4 className="alert-heading">No Data Available</h4>
                <p>Unable to load your user profile information.</p>
                <hr />
                <p className="mb-0">Please try refreshing the page or logging in again.</p>
            </div>
        );
    }

    return (
        <>
            <Header authenticated={authenticated} currentUser={userData} onLogout={onLogout} />
            <div style={{ marginTop: "90px" }}></div>
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