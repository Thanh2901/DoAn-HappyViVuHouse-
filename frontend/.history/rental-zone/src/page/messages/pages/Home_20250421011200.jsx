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
        <UserProvider>
            <WebSocketProvider>
                <div className="mb-3">
                    <h1 className="h3 d-inline align-middle">Tin nhắn</h1>
                </div>
                <div className="card">
                    <div className="row g-0">
                        <div className="col-12">
                            <Chat authenticated={authenticated} />
                        </div>
                    </div>
                </div>
            </WebSocketProvider>
        </UserProvider>
    );
};

export default Home;