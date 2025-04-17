import React, { Component } from 'react';
import './NotFound.css';
import { Link } from 'react-router-dom';

class NotFound extends Component {
    render() {
        return (
            <div className="page-not-found">
                <h1 className="title">
                    404
                </h1>
                <div className="desc">
                    Không tìm thấy Trang bạn đang tìm kiếm.
                </div>
                <Link to="/"><button className="go-back-btn btn btn-primary" type="button">Quay lại Trang chủ</button></Link>
            </div>
        );
    }
}

export default NotFound;