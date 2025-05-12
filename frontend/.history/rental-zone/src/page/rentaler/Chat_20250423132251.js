import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
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
        // Only fetch if authenticated
        if (authenticated) {
            console.log("Fetching rentaler data...");
            
            // Check for token
            const token = localStorage.getItem("ACCESS_TOKEN");
            if (!token) {
                console.error("No access token available");
                setError("Authentication required");
                setLoading(false);
                return;
            }
            
            getCurrentRentaler()
                .then(data => {
                    console.log("API response:", data);
                    if (data) {
                        setRentalerData(data);
                        console.log("Rentaler data set successfully:", data);
                    } else {
                        console.error("Empty rentaler data received");
                        setError("No data received");
                    }
                })
                .catch(err => {
                    console.error("Error fetching rentaler data:", err);
                    setError(err.message || "Failed to load rentaler data");
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
        return <Navigate to="/login-rentaler" state={{ from: location }} />;
    }

    // If loading, show loading indicator
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <span className="ms-2">Loading rentaler information...</span>
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
    if (!rentalerData) {
        return (
            <div className="alert alert-warning m-3" role="alert">
                <h4 className="alert-heading">No Data Available</h4>
                <p>Unable to load your rentaler profile information.</p>
                <hr />
                <p className="mb-0">Please try refreshing the page or logging in again.</p>
            </div>
        );
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
    );
}

export default Chat;