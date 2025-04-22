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
            <div className="home-content">
                <Sidebar />
                <Chat />
            </div>
    );
};

export default Home;