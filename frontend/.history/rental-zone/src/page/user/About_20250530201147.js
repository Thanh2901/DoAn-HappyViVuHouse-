import React, { Component } from "react";
import Header from "../../common/Header";
import Footer from "../../common/Footer";

class About extends Component {
    render() {
        return (
            <>
                <Header
                    authenticated={this.props.authenticated}
                    currentUser={this.props.currentUser}
                    onLogout={this.props.onLogout}
                />
                <main id="main">

                    <section className="intro-single">
                        <div className="container">
                            <div className="row">
                                <div className="col-md-12 col-lg-8">
                                    <div className="title-single-box">
                                        <h1 className="title-single">Welcome to Happy ViVu House</h1>
                                        <p>Your cozy and modern stay in the heart of the city</p>
                                    </div>
                                </div>
                                <div className="col-md-12 col-lg-4">
                                    <nav aria-label="breadcrumb" className="breadcrumb-box d-flex justify-content-lg-end">
                                        <ol className="breadcrumb">
                                            <li className="breadcrumb-item">
                                                <a href="/">Home</a>
                                            </li>
                                            <li className="breadcrumb-item active" aria-current="page">
                                                About
                                            </li>
                                        </ol>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="section-about">
                        <div className="container">
                            <div className="row">
                                <div className="col-sm-12 position-relative">
                                    <div className="about-img-box">
                                        <img src="/assets/img/happy-vivu-front.jpg" alt="Happy ViVu House" className="img-fluid" />
                                    </div>
                                    <div className="sinse-box">
                                        <h3 className="sinse-title">Happy ViVu House
                                            <span></span>
                                            <br /> Since 2021
                                        </h3>
                                        <p>Comfort & Style</p>
                                    </div>
                                </div>
                                <div className="col-md-12 section-t8 position-relative">
                                    <div className="row">
                                        <div className="col-md-6 col-lg-5">
                                            <img src="/assets/img/happy-vivu-room.jpg" alt="Happy ViVu Room" className="img-fluid" />
                                        </div>
                                        <div className="col-lg-2 d-none d-lg-block position-relative">
                                            <div className="title-vertical d-flex justify-content-start">
                                                <span>Enjoy Your Stay</span>
                                            </div>
                                        </div>
                                        <div className="col-md-6 col-lg-5 section-md-t3">
                                            <div className="title-box-d">
                                                <h3 className="title-d">A Space
                                                    <span className="color-d">Designed</span> for You
                                                    <br /> to Feel at Home
                                                </h3>
                                            </div>
                                            <p className="color-text-a">
                                                Happy ViVu House offers fully-furnished, stylish rooms for long and short-term stays. Whether you’re a digital nomad, a traveler, or on a business trip, you’ll find a warm and welcoming space with modern amenities and a personal touch.
                                            </p>
                                            <p className="color-text-a">
                                                Located in a prime area with easy access to cafes, co-working spaces, and public transportation, Happy ViVu House is more than just a place to stay — it’s your home away from home.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="section-agents section-t8">
                        <div className="container">
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="title-wrap d-flex justify-content-between">
                                        <div className="title-box">
                                            <h2 className="title-a">Meet The Hosts</h2>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                {/* Sample Host */}
                                <div className="col-md-4">
                                    <div className="card-box-d">
                                        <div className="card-img-d">
                                            <img src="/assets/img/host-1.jpg" alt="Host" className="img-d img-fluid" />
                                        </div>
                                        <div className="card-overlay card-overlay-hover">
                                            <div className="card-header-d">
                                                <div className="card-title-d align-self-center">
                                                    <h3 className="title-d">
                                                        <a href="#" className="link-two">Anna Nguyen</a>
                                                    </h3>
                                                </div>
                                            </div>
                                            <div className="card-body-d">
                                                <p className="content-d color-text-a">
                                                    Friendly and attentive, Anna ensures every guest enjoys a personalized stay at Happy ViVu House.
                                                </p>
                                                <div className="info-agents color-a">
                                                    <p><strong>Phone:</strong> +84 987 654 321</p>
                                                    <p><strong>Email:</strong> anna@happyvivu.com</p>
                                                </div>
                                            </div>
                                            <div className="card-footer-d">
                                                <div className="socials-footer d-flex justify-content-center">
                                                    <ul className="list-inline">
                                                        <li className="list-inline-item">
                                                            <a href="#" className="link-one">
                                                                <i className="bi bi-facebook" aria-hidden="true"></i>
                                                            </a>
                                                        </li>
                                                        <li className="list-inline-item">
                                                            <a href="#" className="link-one">
                                                                <i className="bi bi-instagram" aria-hidden="true"></i>
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Add more hosts if needed */}
                            </div>
                        </div>
                    </section>

                </main>
                <Footer />
            </>
        );
    }
}

export default About;
