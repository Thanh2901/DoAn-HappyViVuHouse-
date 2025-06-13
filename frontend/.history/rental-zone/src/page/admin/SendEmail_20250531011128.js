import React, { useState, useEffect } from "react";
import SidebarNav from './SidebarNav';
import { getAccountById, sendEmailForRentaler } from "../../services/fetch/ApiUtils";
import { toast } from "react-toastify";
import { Navigate, useParams } from "react-router-dom";
import Nav from "./Nav";

function SendEmail(props) {
    const { authenticated, role, currentUser, location, onLogout } = props;
    const { id } = useParams();

    const [title, setTitle] = useState('');
    const [nameOfRentaler, setNameOfRentaler] = useState('');
    const [toEmail, setToEmail] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        getAccountById(id).then(response => {
            setToEmail(response.email)
            setNameOfRentaler(response.name)
        }).catch(
            error => {
                toast.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
            }
        )
    }, []);

    const handleTitleChange = (event) => {
        setTitle(event.target.value);
    };

    const handleRentalerChange = (event) => {
        setNameOfRentaler(event.target.value);
    };

    const handleToEmailChange = (event) => {
        setToEmail(event.target.value);
    };

    const handleDescriptionChange = (event) => {
        setDescription(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const sendEmailRequest = { title, nameOfRentaler, toEmail, description };
        sendEmailForRentaler(id, sendEmailRequest).then(response => {
            console.log(response.message)
            toast.success(response.message)
            setTitle('');
            setDescription('');
        }).catch(
            error => {
                toast.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
            }
        )
    };

    if (!authenticated) {
        return <Navigate
          to={{
            pathname: "/login-admin",
            state: { from: location }
          }} />;
      }


    return (
        <div className="wrapper">
            <nav id="sidebar" className="sidebar js-sidebar">
                <div className="sidebar-content js-simplebar">
                    <a className="sidebar-brand" href="/rentaler">
                        <span className="align-middle">ADMIN PRO</span>
                    </a>
                    <SidebarNav />
                </div>
            </nav>

            <div className="main">
                <Nav onLogout={onLogout} currentUser={currentUser} />
                <main style={{margin: "20px"}}>
                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title">Send email to poster</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Recipient's email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        name="toEmail"
                                        value={toEmail}
                                        onChange={handleToEmailChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Poster name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="nameOfRentaler"
                                        value={nameOfRentaler}
                                        onChange={handleRentalerChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Email subject</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="title"
                                        value={title}
                                        onChange={handleTitleChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Message</label>
                                    <textarea
                                        className="form-control"
                                        placeholder="Description"
                                        rows="1"
                                        style={{ height: "65px" }}
                                        name="description"
                                        value={description}
                                        onChange={handleDescriptionChange}
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary">Submit</button>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default SendEmail;