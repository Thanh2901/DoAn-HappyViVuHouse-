import React, { useEffect } from "react";
import './ForgotPassword.css';
import {  useNavigate, useLocation } from 'react-router-dom';
import { useState } from "react";
import { changeConfirmedStatus} from "../services/fetch/ApiUtils";
import { toast } from "react-toastify";

function SuccessConfirmed() {
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
                                        <h3>Xác thực tài khoản thành công🎉✨🎉</h3>
                                        <p className="mb-4">Bạn quay lại trang chủ và đăng nhập tài khoản của mình.</p>
                                    </div>
                                    <AccountStatus />
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}




function AccountStatus() {
    const history = useNavigate();
    const location = useLocation();
  
    const [formState, setFormState] = useState({
      email: location.pathname.substring(19),
    });
  
  
    const changeStatusOfAccount = () => {
      const emailRequest = { ...formState };
      changeConfirmedStatus(emailRequest)
        .then(response => {
          console.log(response.message);
        })
        .catch(error => {
          toast.error((error && error.message) || 'Oops! Có điều gì đó xảy ra. Vui lòng thử lại!');
        });
    };
  
    const handleSubmit = event => {
      event.preventDefault();
      history('/');
    };
  
    useEffect(() => {
      changeStatusOfAccount();
    }, [formState.email]);

    return (
        <form onSubmit={handleSubmit}>
            <input type="submit" value="Quay lại Trang Chủ" className="btn text-white btn-block btn-primary" />
        </form>
    )
}

export default SuccessConfirmed;