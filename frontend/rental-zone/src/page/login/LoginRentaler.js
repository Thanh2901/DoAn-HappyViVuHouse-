import React from "react";
import './Login.css';
import { ACCESS_TOKEN, FACEBOOK_AUTH_URL, GOOGLE_AUTH_URL } from "../../constants/Connect";
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useEffect, useState } from "react";
import { login } from "../../services/fetch/ApiUtils";

function LoginRentaler(props) {
    const history = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state && location.state.error) {
            setTimeout(() => {
                toast.error(location.state.error, {
                    timeout: 5000
                });
                history.replace({
                    pathname: location.pathname,
                    state: {}
                });
            }, 2000);
        }
    }, [location.state, location.pathname, history]);

    if ((props.authenticated && props.role === "ROLE_RENTALER") || (props.authenticated && props.role === "ROLE_ADMIN")) {
        return <Navigate
            to={{
                pathname: "/rentaler",
                state: { from: location }
            }}
        />;
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
                                        <h3>Đăng nhập <a href="/" style={{ textDecoration: 'none' }}>The <span className="color-b">Rental</span> Zone</a></h3>
                                        <p className="mb-4">Nếu bạn chưa có tài khoản. <a href="/signup-rentaler">Đăng ký tài khoản mới</a></p>
                                    </div>
                                    <LoginForm />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
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

    const handleSubmit = event => {
        event.preventDefault();

        const loginRequest = { ...formState };

        login(loginRequest)
            .then(response => {
                localStorage.setItem(ACCESS_TOKEN, response.accessToken);
                toast.success("Bạn đã đăng nhập thành công!!");
                history("/rentaler");
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            })
            .catch(error => {
                toast.error((error && error.message) || 'Oops! Có điều gì đó xảy ra. Vui lòng thử lại!');
            });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group first">
                <span className="label">Email</span> {/* Sửa class thành className */}
                <input type="email" className="form-control" name="email" value={formState.email} onChange={handleInputChange} required />
            </div>
            <div className="form-group last mb-4">
                <span className="label">Mật khẩu</span> {/* Sửa class thành className */}
                <input type="password" className="form-control" name="password" value={formState.password} onChange={handleInputChange} required />
            </div>
            <div className="d-flex mb-5 align-items-center"> {/* Sửa class thành className */}
                <span className="ml-auto"><a href="/forgot-password" className="forgot-pass">Quên mật khẩu</a></span> {/* Sửa class thành className */}
            </div>
            <input type="submit" value="Đăng nhập" className="btn text-white btn-block btn-primary" />
        </form>
    );
}

export default LoginRentaler;