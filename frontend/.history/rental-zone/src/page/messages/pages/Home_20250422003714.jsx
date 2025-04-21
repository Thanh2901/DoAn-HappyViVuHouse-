import React from "react";
import Chat from "../components/Chat";
import "../style.css";
import { Navigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const Home = ({ authenticated }) => {
    const location = useLocation();

    if (!authenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return (
        <div className="home-content d-flex vh-100">
            <div className="sidebar-container" style={{ width: '25%', minWidth: '300px' }}>
                <Sidebar />
            </div>
            <div className="chat-container" style={{ width: '75%' }}>
                <Chat />
            </div>
        </div>
    );
};

export default Home;