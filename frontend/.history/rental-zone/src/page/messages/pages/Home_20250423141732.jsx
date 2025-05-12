import React from "react";
import Chat from "../components/Chat";
import "../style.css";
import { Navigate, useLocation } from "react-router-dom";

const Home = ({ authenticated, currentUser, onLogout, role }) => {
    const location = useLocation();

    if (!authenticated) {
        const redirectPath = role === 'rentaler' ? "/login-rentaler" : "/login";
        return <Navigate to={redirectPath} state={{ from: location }} replace />;
    }

    return (
        <div className="home-content">
            <Chat
                authenticated={authenticated}
                currentUser={currentUser}
                onLogout={onLogout}
            />
        </div>
    );
};

export default Home;