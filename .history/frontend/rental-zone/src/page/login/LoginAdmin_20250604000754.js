import React, { Component } from "react";
import './Login.css';
import { ACCESS_TOKEN, FACEBOOK_AUTH_URL, GOOGLE_AUTH_URL } from "../../constants/Connect";
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useEffect } from "react";
import { login } from "../../services/fetch/ApiUtils";
import { useState } from "react";

function LoginAdmin(props) {
    const history = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // If the OAuth2 login encounters an error, the user is redirected to the /login page with an error.
        // Here we display the error and then remove the error query parameter from the location.
        if (location.state && location.state.error) {
            setTimeout(() => {
                toast.error(location.state.error, {
                    timeout: 5000
                });
                history.replace({
                    pathname: location.pathname,
                    state: {}
                });
            }, 100);
        }
    }, [location.state, location.pathname, history]);

    console.log("AUTH", props.authenticated, props)
    if (props.authenticated && props.role === "ROLE_ADMIN") {
        return <Navigate
            to={{
                pathname: "/admin",
                state: { from: location }
            }} />;
    }

    return (
        <>
            <div className="content">
                <div className="container">
                    <div className="row">
                        <div className="col-md-6 order-md-2">
                            <img src="../../assets/img/undraw_file_sync_ot38.svg" alt="Image" className="img-fluid" />
                        </div>
                        <div className="col-md-6 contents">
                            <div className="row justify-content-center">
                                <div className="col-md-8">
                                    <div className="mb-4">
                                        <h3>Login <a href="/" style={{ textDecoration: 'none' }}>The <span className="color-b">Rental</span> Zone</a></h3>
                                    </div>
                                    <LoginForm />
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}




function LoginForm() {
    const history = useNavigate();
    const [formState, setFormState] = useState({
        email: '',
        password: ''
    });

    const handleInputChange = event => {
        const target = event.target;
        const inputName = target.name;
        const inputValue = target.value;

        setFormState(prevState => ({
            ...prevState,
            [inputName]: inputValue
        }));
    };

    const handleSubmit = event => {
        event.preventDefault();

        const loginRequest = { ...formState };

        login(loginRequest)
            .then(response => {
                localStorage.setItem(ACCESS_TOKEN, response.accessToken);
                toast.success("You have successfully logged in!!");
                history("/admin");
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }).catch(error => {
                toast.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
            });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group first">
                <span>Email</span>
                <input type="email" className="form-control" name="email" value={formState.email} onChange={handleInputChange} required />

            </div>
            <div className="form-group last mb-4">
                <span>Password</span>
                <input type="password" className="form-control" name="password" value={formState.password} onChange={handleInputChange} required />

            </div>
            <input type="submit" value="Login" className="btn text-white btn-block btn-primary" />
        </form>
    )
}

export default LoginAdmin;