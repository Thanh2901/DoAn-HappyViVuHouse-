import React, { Component } from "react";
import Slider from "react-slick"; // Thay Swiper bằng Slider từ react-slick
import "slick-carousel/slick/slick.css"; // Import CSS của Slick
import "slick-carousel/slick/slick-theme.css"; // Import theme của Slick
import "./IntroCarousel.css"; // File CSS tùy chỉnh
import { FaStar } from "react-icons/fa";

class IntroCarousel extends Component {
    render() {
        // Cấu hình cho React Slick
        const settings = {
            dots: false, // Hiển thị chấm pagination
            infinite: true, // Vòng lặp vô hạn
            speed: 1200, // Tốc độ chuyển slide (ms)
            slidesToShow: 1, // Hiển thị 1 slide
            slidesToScroll: 1, // Chuyển 1 slide mỗi lần
            autoplay: true, // Tự động chuyển slide
            autoplaySpeed: 3800, // Thời gian chờ giữa các slide (ms), tương ứng với delay của Swiper
            arrows: false, // Hiển thị nút điều hướng (navigation)
            centerMode: true, // Căn giữa slide, tương ứng với centeredSlides của Swiper
            centerPadding: "0px", // Đảm bảo không có padding thừa
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
                                                    Phòng trọ tốt bạn muốn tìm kiếm
                                                    <br /> 2024
                                                </p>
                                                <h1 className="intro-title mb-4 white-text">
                                                    <span className="color-b">Hà Nội</span> Một
                                                    <br /> Nơi tuyệt vời
                                                </h1>
                                                <p className="intro-subtitle">
                                                    <a href="/rental-home" className="btn btn-success btn-cta">
                                                        Khám phá ngay
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
                                                    Nhà bao đẹp, bao sang xịn
                                                    <br /> Good job!
                                                </p>
                                                <h1 className="intro-title mb-4 white-text">
                                                    <span className="color-b">2000</span> Phòng trọ
                                                    <br /> Đã được thuê
                                                </h1>
                                                <p className="intro-subtitle">
                                                    <a href="/rental-home" className="btn btn-success btn-cta">
                                                        Khám phá ngay
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
                                                    Xếp hạng đánh giá
                                                    <br />
                                                    <FaStar className="mr-2 text-yellow-500" />
                                                    <FaStar className="mx-2 text-yellow-500" />
                                                    <FaStar className="mx-2 text-yellow-500" />
                                                    <FaStar className="mx-2 text-yellow-500" />
                                                </p>
                                                <h1 className="intro-title mb-4 white-text">
                                                    <span className="color-b">100+</span>
                                                    <br />Lượt đánh giá
                                                </h1>
                                                <p className="intro-subtitle">
                                                    <a href="/rental-home" className="btn btn-success btn-cta">
                                                        Khám phá ngay
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