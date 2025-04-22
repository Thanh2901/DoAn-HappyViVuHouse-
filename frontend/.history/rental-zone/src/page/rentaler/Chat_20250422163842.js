import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom'
import Home from '../src/page/messages/pages/Home';



function Chat(props) {
    console.log("Props:", props)
    const { authenticated, role, currentUser, location, onLogout } = props;

    if (!props.authenticated) {
        return <Navigate
            to={{
                pathname: "/login-rentaler",
                state: { from: location }
            }} />;
    }

    return (
        <div className="wrapper">
            <Home/>
        </div>
    )
}

export default Chat;