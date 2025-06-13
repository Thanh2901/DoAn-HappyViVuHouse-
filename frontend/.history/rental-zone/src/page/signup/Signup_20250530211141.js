import React, { useState } from "react";
import './Signup.css';
import { toast } from 'react-toastify';
import { signup } from "../../services/fetch/ApiUtils";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

function Signup(props) {

    const history = useNavigate();
    const location = useLocation();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role] = useState('ROLE_USER');

    const validatePhone = (phone) => {
        const phoneRegex = /^\d{10}$/;
        return phoneRegex.test(phone);
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        if (password === confirmPassword) {
            const signUpRequest = { name, email, phone, password, confirmPassword, role };
            signup(signUpRequest)
                .then(response => {
                    toast.success("Account registered successfully. Please check your email to verify your account.");
                    history("/login");
                })
                .catch(error => {
                    toast.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
                });
        } else if (name === '' || email === '' || password === '' || confirmPassword === '') {
            toast.error("Please fill in all required information.");
        } else if (validatePhone(phone) === false) {
            toast.error("Invalid phone number.");
        } else if (password.length <= 8 || confirmPassword.length <= 8) {
            toast.error("Password must be at least 8 characters.");
        }
        else {
            toast.error("Passwords do not match. Please re-enter.");
        }
    }

    if (props.authenticated) {
        return <Navigate
            to={{
                pathname: "/",
                state: { from: location }
            }} />;
    }

    return (
        <>
            <div className="content">
                <div className="container">
                    <div className="row">
                        <div className="col-md-6 order-md-2">
                            <img src="https://undraw.co/api/illustrations/undraw_sign_up_n6im.svg" alt="Sign up illustration" className="img-fluid" />
                        </div>
                        <div className="col-md-6 contents">
                            <div className="row justify-content-center">
                                <div className="col-md-8">
                                    <div className="mb-4">
                                        <h3>Sign up for <a href="/" style={{ textDecoration: 'none' }}><span className="color-b">Happy ViVu</span> House</a></h3>
                                        <p className="mb-4">Already have an account? <a href="/login">Login</a></p>
                                    </div>
                                    <form onSubmit={handleSubmit}>
                                        <div className="form-group first">
                                            <span>Email</span>
                                            <input type="email" className="form-control" id="username" name="email"
                                                value={email} onChange={(e) => setEmail(e.target.value)} required />

                                        </div>
                                        <div className="form-group first">
                                            <span>Phone number</span>
                                            <input type="text" className="form-control" id="username" name="phone"
                                                value={phone} onChange={(e) => setPhone(e.target.value)} required />

                                        </div>
                                        <div className="form-group first">
                                            <span>Full name</span>
                                            <input type="text" className="form-control" id="username"
                                                name="name"
                                                value={name} onChange={(e) => setName(e.target.value)} required />


                                        </div>
                                        <div className="form-group last mb-4">
                                            <span>Password</span>
                                            <input type="password" className="form-control" id="password"
                                                name="password"
                                                value={password} onChange={(e) => setPassword(e.target.value)} />

                                        </div>
                                        <div className="form-group last mb-4">
                                            <span>Confirm password</span>
                                            <input type="password" className="form-control" id="password"
                                                name="confirmPassword"
                                                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />

                                        </div>


                                        <input type="submit" value="Sign Up" className="btn text-white btn-block btn-primary" />

                                    </form>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}

export default Signup;