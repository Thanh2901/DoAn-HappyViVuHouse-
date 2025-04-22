import React from 'react';
import { Navigate } from 'react-router-dom';
import Home from '../messages/pages/Home';

function Chat(props) {
    const { authenticated, role, currentUser, location, onLogout } = props;

    if (!authenticated) {
        return <Navigate
            to={{
                pathname: "/login-rentaler",
                state: { from: location }
            }} />;
    }

    return (
        <div className="wrapper">
            <Home
                authenticated={authenticated}
                role={role}
                currentUser={currentUser}
                onLogout={onLogout}
            />
        </div>
    );
}

export default Chat;