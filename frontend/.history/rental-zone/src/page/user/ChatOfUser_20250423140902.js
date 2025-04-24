import React, { useState, useEffect } from 'react';
import Header from '../../common/Header';
import Footer from '../../common/Footer';
import Home from '../messages/pages/Home';
import SidebarNav from './SidebarNav';
import { getCurrentUser } from '../../../services/fetch/ApiUtils';

const ChatOfUser = (props) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getCurrentUser()
            .then((user) => {
                // Normalize user data
                setCurrentUser({
                    ...user,
                    name: user.name || user.username || 'User',
                    username: user.username || user.name || 'user'
                });
                setIsLoading(false);
            })
            .catch((err) => {
                console.error('Failed to fetch current user:', err);
                setError('Unable to load user information');
                setIsLoading(false);
            });
    }, []);

    if (isLoading) {
        return <div>Loading user information...</div>;
    }

    if (error || !props.authenticated) {
        return (
            <Navigate
                to={{
                    pathname: "/login",
                    state: { from: props.location }
                }}
                replace
            />
        );
    }

    return (
        <>
            <Header
                authenticated={props.authenticated}
                currentUser={currentUser}
                onLogout={props.onLogout}
            />
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
                            <Home
                                authenticated={props.authenticated}
                                currentUser={currentUser}
                                onLogout={props.onLogout}
                                role="user"
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