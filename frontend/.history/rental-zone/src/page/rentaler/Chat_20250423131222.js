import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom'
import Nav from './Nav';
import SidebarNav from './SidebarNav';
import '../../assets/css/app.css';
import Message from '../messages/pages/Home';
import { getCurrentRentaler } from '../../services/fetch/ApiUtils';

function Chat(props) {
    const { authenticated, role, location, onLogout } = props;
    const [rentalerData, setRentalerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch rentaler data when component mounts
        if (authenticated) {
            getCurrentRentaler()
                .then(data => {
                    console.log("Fetched rentaler data:", data);
                    setRentalerData(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Error fetching rentaler data:", err);
                    setError(err);
                    setLoading(false);
                });
        }
    }, [authenticated]);

    if (!props.authenticated) {
        return <Navigate
            to={{
                pathname: "/login-rentaler",
                state: { from: location }
            }} />;
    }

    if (loading) {
        return <div className="loading-spinner">Loading rentaler information...</div>;
    }

    if (error) {
        return <div className="error-message">Error loading rentaler data. Please try again later.</div>;
    }

    return (
        <div className="wrapper">
            <nav id="sidebar" className="sidebar js-sidebar">
                <div className="sidebar-content js-simplebar">
                    <a className="sidebar-brand" href="index.html">
                        <span className="align-middle">RENTALER PRO</span>
                    </a>
                    <SidebarNav />
                </div>
            </nav>

            <div className="main">
                <Nav onLogout={onLogout} currentUser={rentalerData} />

                <main style={{ margin: "20px 20px 20px 20px" }}>
                    <Message 
                        authenticated={authenticated} 
                        currentUser={rentalerData} 
                        onLogout={onLogout}
                        userType="rentaler"
                    />
                </main>
            </div>
        </div>
    )
}

export default Chat;