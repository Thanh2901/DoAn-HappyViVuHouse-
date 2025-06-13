import React, { Component } from "react";
import "./Footer.css"; // Custom CSS for Footer

class Footer extends Component {
    render() {
        return (
            <>
                <section className="section-footer mt-0">
                    <div className="container">
                        <div className="row">
                            <div className="col-sm-12 col-md-4">
                                <div className="widget-a">
                                    <div className="w-header-a">
                                        <h3 className="w-title-a text-brand">HappyViVu House</h3>
                                    </div>
                                    <div className="w-body-a">
                                        <p className="w-text-a">
                                            Affordable prices, high-quality rental rooms for everyone!
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
                                                <span>Phone:</span> +84 9688 9252
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-12 col-md-4 section-md-t3">
                                <div className="widget-a">
                                    <div className="w-header-a">
                                        <h3 className="w-title-a text-brand">About HappyViVu</h3>
                                    </div>
                                    <div className="w-body-a">
                                        <ul className="list-unstyled">
                                            <li className="item-list-a">
                                                <i className="bi bi-chevron-right me-2"></i>
                                                <a href="#">Room Listings</a>
                                            </li>
                                            <li className="item-list-a">
                                                <i className="bi bi-chevron-right me-2"></i>
                                                <a href="#">For Landlords</a>
                                            </li>
                                            <li className="item-list-a">
                                                <i className="bi bi-chevron-right me-2"></i>
                                                <a href="#">For Tenants</a>
                                            </li>
                                            <li className="item-list-a">
                                                <i className="bi bi-chevron-right me-2"></i>
                                                <a href="#">Support Center</a>
                                            </li>
                                            <li className="item-list-a">
                                                <i className="bi bi-chevron-right me-2"></i>
                                                <a href="#">Terms & Conditions</a>
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
                                        <h3 className="w-title-a text-brand">Popular Cities</h3>
                                    </div>
                                    <div className="w-body-a">
                                        <ul className="list-unstyled">
                                            <li className="item-list-a">
                                                <i className="bi bi-chevron-right me-2"></i>
                                                <a href="#">Hanoi</a>
                                            </li>
                                            <li className="item-list-a">
                                                <i className="bi bi-chevron-right me-2"></i>
                                                <a href="#">Ho Chi Minh City</a>
                                            </li>
                                            <li className="item-list-a">
                                                <i className="bi bi-chevron-right me-2"></i>
                                                <a href="#">Da Nang</a>
                                            </li>
                                            <li className="item-list-a">
                                                <i className="bi bi-chevron-right me-2"></i>
                                                <a href="#">Hai Phong</a>
                                            </li>
                                            <li className="item-list-a">
                                                <i className="bi bi-chevron-right me-2"></i>
                                                <a href="#">Can Tho</a>
                                            </li>
                                            <li className="item-list-a">
                                                <i className="bi bi-chevron-right me-2"></i>
                                                <a href="#">Nha Trang</a>
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
                                            <a href="#">Find a Room</a>
                                        </li>
                                        <li className="list-inline-item">
                                            <a href="#">For Landlords</a>
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
                                {/* <div className="copyright-footer">
                                    <p className="copyright">
                                        © Copyright <span className="text-brand">HappyViVu House</span> All Rights Reserved.
                                    </p>
                                </div>
                                <div className="credits">
                                    Designed by HappyViVu Team
                                </div> */}
                            </div>
                        </div>
                    </div>
                </footer>
            </>
        );
    }
}

export default Footer;