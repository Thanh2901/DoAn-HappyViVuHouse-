import React, { Component } from "react";
import "./Footer.css"; // Thêm file CSS riêng cho Footer

class Footer extends Component {
    render() {
        return (
            <>
                <section className="section-footer mb-0">
                    <div className="container">
                        <div className="row">
                            <div className="col-sm-12 col-md-4">
                                <div className="widget-a">
                                    <div className="w-header-a">
                                        <h3 className="w-title-a text-brand">HappyViVu House</h3>
                                    </div>
                                    <div className="w-body-a">
                                        <p className="w-text-a">
                                            Giá cả phải chăng, phòng trọ chất lượng cao!!!
                                        </p>
                                    </div>
                                    <div className="w-footer-a">
                                        <ul className="list-unstyled">
                                            <li className="contact-item">
                                                <i className="bi bi-envelope me-2"></i>
                                                <span>Email:</span> thanhvuworkspace@gmail.com
                                            </li>
                                            <li className="contact-item">
                                                <i className="bi bi-telephone me-2"></i>
                                                <span>Số điện thoại:</span> +84 9688 9252
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-12 col-md-4 section-md-t3">
                                <div className="widget-a">
                                    <div className="w-header-a">
                                        <h3 className="w-title-a text-brand">Về công ty</h3>
                                    </div>
                                    <div className="w-body-a">
                                        <ul className="list-unstyled">
                                            <li className="item-list-a">
                                                <i className="bi bi-chevron-right me-2"></i>
                                                <a href="#">Site Map</a>
                                            </li>
                                            <li className="item-list-a">
                                                <i className="bi bi-chevron-right me-2"></i>
                                                <a href="#">Legal</a>
                                            </li>
                                            <li className="item-list-a">
                                                <i className="bi bi-chevron-right me-2"></i>
                                                <a href="#">Agent Admin</a>
                                            </li>
                                            <li className="item-list-a">
                                                <i className="bi bi-chevron-right me-2"></i>
                                                <a href="#">Careers</a>
                                            </li>
                                            <li className="item-list-a">
                                                <i className="bi bi-chevron-right me-2"></i>
                                                <a href="#">Affiliate</a>
                                            </li>
                                            <li className="item-list-a">
                                                <i className="bi bi-chevron-right me-2"></i>
                                                <a href="#">Privacy Policy</a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-12 col-md-4 section-md-t3">
                                <div className="widget-a">
                                    <div className="w-header-a">
                                        <h3 className="w-title-a text-brand">International sites</h3>
                                    </div>
                                    <div className="w-body-a">
                                        <ul className="list-unstyled">
                                            <li className="item-list-a">
                                                <i className="bi bi-chevron-right me-2"></i>
                                                <a href="#">Venezuela</a>
                                            </li>
                                            <li className="item-list-a">
                                                <i className="bi bi-chevron-right me-2"></i>
                                                <a href="#">China</a>
                                            </li>
                                            <li className="item-list-a">
                                                <i className="bi bi-chevron-right me-2"></i>
                                                <a href="#">Hong Kong</a>
                                            </li>
                                            <li className="item-list-a">
                                                <i className="bi bi-chevron-right me-2"></i>
                                                <a href="#">Argentina</a>
                                            </li>
                                            <li className="item-list-a">
                                                <i className="bi bi-chevron-right me-2"></i>
                                                <a href="#">Singapore</a>
                                            </li>
                                            <li className="item-list-a">
                                                <i className="bi bi-chevron-right me-2"></i>
                                                <a href="#">Philippines</a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <footer>
                    <div className="container">
                        <div className="row">
                            <div className="col-md-12">
                                <nav className="nav-footer">
                                    <ul className="list-inline">
                                        <li className="list-inline-item">
                                            <a href="#">Home</a>
                                        </li>
                                        <li className="list-inline-item">
                                            <a href="#">About</a>
                                        </li>
                                        <li className="list-inline-item">
                                            <a href="#">Property</a>
                                        </li>
                                        <li className="list-inline-item">
                                            <a href="#">Blog</a>
                                        </li>
                                        <li className="list-inline-item">
                                            <a href="#">Contact</a>
                                        </li>
                                    </ul>
                                </nav>
                                <div className="socials-a">
                                    <ul className="list-inline">
                                        <li className="list-inline-item">
                                            <a href="#" className="social-link">
                                                <i className="bi bi-facebook"></i>
                                            </a>
                                        </li>
                                        <li className="list-inline-item">
                                            <a href="#" className="social-link">
                                                <i className="bi bi-twitter"></i>
                                            </a>
                                        </li>
                                        <li className="list-inline-item">
                                            <a href="#" className="social-link">
                                                <i className="bi bi-instagram"></i>
                                            </a>
                                        </li>
                                        <li className="list-inline-item">
                                            <a href="#" className="social-link">
                                                <i className="bi bi-linkedin"></i>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                                <div className="copyright-footer">
                                    <p className="copyright">
                                        © Copyright <span className="text-brand">EstateAgency</span> All Rights Reserved.
                                    </p>
                                </div>
                                <div className="credits">
                                    Designed by <a href="https://bootstrapmade.com/">BootstrapMade</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            </>
        );
    }
}

export default Footer;