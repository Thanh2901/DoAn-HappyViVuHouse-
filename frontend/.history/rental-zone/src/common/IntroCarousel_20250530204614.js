import React, { Component } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./IntroCarousel.css";
import { FaStar } from "react-icons/fa";

class IntroCarousel extends Component {
    render() {
        const settings = {
            dots: false,
            infinite: true,
            speed: 1200,
            slidesToShow: 1,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 3800,
            arrows: false,
            centerMode: true,
            centerPadding: "0px",
        };

        return (
            <div className="intro-carousel position-relative">
                <Slider {...settings} className="intro-swiper">
                    <div>
                        <div
                            className="intro-item bg-image"
                            style={{ backgroundImage: `url(assets/img/slide-1.jpg)` }}
                        >
                            <div className="overlay"></div>
                            <div className="intro-content">
                                <div className="container h-100">
                                    <div className="row h-100 align-items-center">
                                        <div className="col-lg-8 text-start">
                                            <div className="intro-body animate__animated animate__fadeInUp">
                                                <p className="intro-title-top white-text">
                                                    Discover your dream room today
                                                    <br /> Start your new journey in 2024
                                                </p>
                                                <h1 className="intro-title mb-4 white-text">
                                                    <span className="color-b">Hanoi</span> —
                                                    <br /> Where comfort meets lifestyle
                                                </h1>
                                                <p className="intro-subtitle">
                                                    <a href="/rental-home" className="btn btn-success btn-cta">
                                                        Explore Now
                                                    </a>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div
                            className="intro-item bg-image"
                            style={{ backgroundImage: `url(assets/img/slide-2.jpg)` }}
                        >
                            <div className="overlay"></div>
                            <div className="intro-content">
                                <div className="container h-100">
                                    <div className="row h-100 align-items-center">
                                        <div className="col-lg-8 text-start">
                                            <div className="intro-body">
                                                <p className="intro-title-top white-text">
                                                    Elegant, modern, and cozy spaces
                                                    <br /> Your perfect home awaits!
                                                </p>
                                                <h1 className="intro-title mb-4 white-text">
                                                    <span className="color-b">2,000+</span> Rooms
                                                    <br /> Successfully rented
                                                </h1>
                                                <p className="intro-subtitle">
                                                    <a href="/rental-home" className="btn btn-success btn-cta">
                                                        Find Yours
                                                    </a>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div
                            className="intro-item bg-image"
                            style={{ backgroundImage: `url(assets/img/slide-3.jpg)` }}
                        >
                            <div className="overlay"></div>
                            <div className="intro-content">
                                <div className="container h-100">
                                    <div className="row h-100 align-items-center">
                                        <div className="col-lg-8 text-start">
                                            <div className="intro-body">
                                                <p className="intro-title-top white-text flex items-center">
                                                    Loved by our community
                                                    <br />
                                                    <FaStar className="mr-2 text-yellow-500" />
                                                    <FaStar className="mx-2 text-yellow-500" />
                                                    <FaStar className="mx-2 text-yellow-500" />
                                                    <FaStar className="mx-2 text-yellow-500" />
                                                </p>
                                                <h1 className="intro-title mb-4 white-text">
                                                    <span className="color-b">100+</span>
                                                    <br /> Five-star reviews
                                                </h1>
                                                <p className="intro-subtitle">
                                                    <a href="/rental-home" className="btn btn-success btn-cta">
                                                        Join Our Happy Renters
                                                    </a>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Slider>
            </div>
        );
    }
}

export default IntroCarousel;