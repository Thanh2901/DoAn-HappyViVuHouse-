import React from "react";
import Chat from "../components/Chat";
import "../style.css";
import { UserProvider } from "../context/UserContext";
import { WebSocketProvider } from "../context/WebSocketContext";
import { Navigate, useLocation } from "react-router-dom";

const Home = ({ authenticated }) => {
    const location = useLocation();

    if (!authenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return (
            <div className="home-content">
                <Chat />
            </div>
    );
};

export default Home;