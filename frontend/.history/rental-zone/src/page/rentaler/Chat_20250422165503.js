import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom'
import Nav from './Nav';
import SidebarNav from './SidebarNav';
import '../../assets/css/app.css';
import Message from '../messages/pages/Home';


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

                    <Message authenticated={authenticated} currentUser={currentUser} onLogout={onLogout} />

                </main>

            </div>
        </div>
    )
}

export default Chat;