import React from "react";
import './ForgotPassword.css';
import {  useNavigate, useLocation } from 'react-router-dom';
import { useState } from "react";
import { resetPassword } from "../services/fetch/ApiUtils";
import { toast } from "react-toastify";

function ResetPassword() {
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
                                        <h3>Thay đổi mật khẩu mới</h3>
                                        <p className="mb-4">Cập nhật mật khẩu mới của bạn.</p>
                                    </div>
                                    <ForgotPasswordForm />
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}




function ForgotPasswordForm() {
    const history = useNavigate();
    const location = useLocation();
    const [formState, setFormState] = useState({
        email: '',
        password: '',
        confirmedPassword: ''
    });

    const handleInputChange = event => {
        const target = event.target;
        const inputName = target.name;
        const inputValue = target.value;

        setFormState(prevState => ({
            ...prevState,
            [inputName]: inputValue,
            email: location.pathname.substring(16)
        }));
    };

    const handleSubmit = event => {
        event.preventDefault();

        const resetPasswordRequest = { ...formState };

        resetPassword(resetPasswordRequest)
        .then(response => {
            toast.success(response.message);
            history("/");
        }).catch(error => {
            toast.error((error && error.message) || 'Oops! Có điều gì đó xảy ra. Vui lòng thử lại!');
        });

    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group first">
                <span>Mật khẩu mới*</span>
                <input type="password" className="form-control" name="password" value={formState.password} onChange={handleInputChange} required />
            </div>
            <div className="form-group first">
                <span>Xác nhận mật khẩu*</span>
                <input type="password" className="form-control" name="confirmedPassword" value={formState.confirmedPassword} onChange={handleInputChange} required />
            </div>
            <input type="submit" value="Lưu thay đổi" className="btn text-white btn-block btn-primary" />
        </form>
    )
}

export default ResetPassword;