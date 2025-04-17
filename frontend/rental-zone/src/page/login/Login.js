import React, { Component } from "react";
import './Login.css';
import { ACCESS_TOKEN, FACEBOOK_AUTH_URL, GOOGLE_AUTH_URL } from "../../constants/Connect";
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useEffect } from "react";
import { login } from "../../services/fetch/ApiUtils";
import { useState } from "react";
import { message } from "antd";

function Login(props) {
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

    if (props.authenticated) {
        console.log("props.authenticated", props.authenticated);
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
                            <img src="../../assets/img/undraw_file_sync_ot38.svg" alt="Image" className="img-fluid" />
                        </div>
                        <div className="col-md-6 contents">
                            <div className="row justify-content-center">
                                <div className="col-md-8">
                                    <div className="mb-4">
                                        <h3>Đăng nhập <a href="/" style={{ textDecoration: 'none' }}><span className="color-b">Happy ViVu</span> House</a></h3>
                                        <p className="mb-4">Nếu bạn chưa có tài khoản. <a href="/signup">Đăng ký tài khoản mới</a></p>
                                    </div>
                                    <LoginForm />

                                    <span className="d-block text-left my-4 text-muted"> hoặc đăng nhập với</span>

                                    <SocialLogin />
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}

function SocialLogin() {
    return (
        <div className="social-login">
            <a href={FACEBOOK_AUTH_URL} className="facebook">
                <span className="icon-facebook mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" height="1.5em" viewBox="0 0 512 512"><path d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z" /></svg>                                                    </span>
            </a>
            &nbsp;&nbsp;
            <a href={GOOGLE_AUTH_URL} className="google">
                <span className="icon-google mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" height="1.5em" viewBox="0 0 512 512"><path d="M256,8C119.1,8,8,119.1,8,256S119.1,504,256,504,504,392.9,504,256,392.9,8,256,8ZM185.3,380a124,124,0,0,1,0-248c31.3,0,60.1,11,83,32.3l-33.6,32.6c-13.2-12.9-31.3-19.1-49.4-19.1-42.9,0-77.2,35.5-77.2,78.1S142.3,334,185.3,334c32.6,0,64.9-19.1,70.1-53.3H185.3V238.1H302.2a109.2,109.2,0,0,1,1.9,20.7c0,70.8-47.5,121.2-118.8,121.2ZM415.5,273.8v35.5H380V273.8H344.5V238.3H380V202.8h35.5v35.5h35.2v35.5Z" /></svg>
                </span>
            </a>
        </div>
    );
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
    console.log("formState", formState);
    const handleSubmit = event => {

        event.preventDefault();

        const loginRequest = { ...formState };
        console.log("Submitting login request", loginRequest);

        login(loginRequest)
            .then(response => {
                console.log("response:", response);

                localStorage.setItem(ACCESS_TOKEN, response?.accessToken);
                // if (response?.accessToken?.token === undefined) {
                //     toast.warning("Vui lòng xác nhận trong email của bạn");
                //     return;
                // }

                console.log("token:", response.accessToken);
                toast.success("Bạn đã đăng nhập thành công!!");
                history("/");
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }).catch(error => {
                toast.error('Đã có lỗi xảy ra!');
            });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group first">
                <span>Email</span>
                <input type="email" className="form-control" name="email" value={formState.email} onChange={handleInputChange} required />

            </div>
            <div className="form-group last mb-4">
                <span>Mật khẩu</span>
                <input type="password" className="form-control" name="password" value={formState.password} onChange={handleInputChange} required />
            </div>
            <div className="d-flex mb-5 align-items-center">
                <span className="ml-auto"><a href="/forgot-password" className="forgot-pass">Quên mật khẩu</a></span>
            </div>
            <input type="submit" value="Đăng nhập" className="btn text-white btn-block btn-primary" />
        </form>
    )
}

export default Login;