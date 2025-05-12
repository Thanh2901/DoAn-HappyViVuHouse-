import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Nav from './Nav';
import SidebarNav from './SidebarNav';
import Home from '../messages/pages/Home';
import '../../assets/css/app.css';
import { getCurrentRentaler } from '../../services/fetch/ApiUtils';
import { toast } from 'react-toastify';

function Chat(props) {
    console.log("Chat Props:", props);
    const { authenticated, role, location, onLogout } = props;
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getCurrentRentaler()
            .then((rentaler) => {
                // Normalize rentaler data
                setCurrentUser({
                    ...rentaler,
                    name: rentaler.name || rentaler.username || 'Rentaler',
                    username: rentaler.username || rentaler.name || 'rentaler'
                });
                setIsLoading(false);
            })
            .catch((err) => {
                console.error('Failed to fetch current rentaler:', err);
                setError('Unable to load rentaler information');
                setIsLoading(false);
            });
    }, []);

    if (isLoading) {
        return <div>Loading rentaler information...</div>;
    }

    if (error || !authenticated) {
        return (
            <Navigate
                to={{
                    pathname: "/login-rentaler",
                    state: { from: location }
                }}
                replace
            />
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
                <Nav onLogout={onLogout} currentUser={currentUser} />
                <main style={{ margin: "20px 20px 20px 20px" }}>
                    <Home
                        authenticated={authenticated}
                        currentUser={currentUser}
                        onLogout={onLogout}
                        role={role}
                    />
                </main>
            </div>
        </div>
    );
}

export default Chat;