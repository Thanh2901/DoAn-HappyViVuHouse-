
import React, { Component } from "react";
import { Link, NavLink } from "react-router-dom";
import { getAllAccountRentalerForCustomer, getAllRoomOfCustomer } from "../services/fetch/ApiUtils";
import { toast } from "react-toastify";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Home.css";

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPage: 1,
            totalPages: 3,
            rooms: [],
            sortingOption: "Time: Newest to Oldest",
            rentaler: [],
        };
    }

    componentDidMount() {
        this.fetchRooms(this.state.currentPage);
    }

    fetchRooms = () => {
        getAllRoomOfCustomer(1, 3, "", "", "")
            .then((response) => {
                this.setState({
                    rooms: response.content,
                });
            })
            .catch((error) => {
                toast.error(error?.message || "Oops! Something went wrong. Please try again with Happy ViVu House!");
            });

        getAllAccountRentalerForCustomer(1, 7)
            .then((response) => {
                this.setState({
                    rentaler: response.content,
                });
            })
            .catch((error) => {
                toast.error(error?.message || "Oops! Something went wrong. Please try again with Happy ViVu House!");
            });
    };

    render() {
        const { rooms, rentaler } = this.state;

        const settings = {
            dots: false,
            infinite: true,
            speed: 500,
            slidesToShow: 1,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 5000,
            arrows: true,
            centerMode: true,
            centerPadding: "0px",
        };

        return (
            <main id="main">
                {/* Why Choose Happy ViVu House */}
                <section className="section-services section-t8 pt-5">
                    <div className="container">
                        <div className="title-wrap d-flex justify-content-between mb-0">
                            <div className="title-box">
                                <h2 className="title-a" style={{ fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.3 }}>
                                    Why Choose Happy ViVu House
                                </h2>
                            </div>
                        </div>
                        <div className="services-grid">
                            <div className="service-card">
                                <div className="card-header-c">
                                    <span className="card-box-ico bi bi-cart"></span>
                                    <h2 className="title-c" style={{ fontSize: '1.5rem', fontWeight: 500, lineHeight: 1.4 }}>
                                        Trusted & Secure
                                    </h2>
                                </div>
                                <div className="card-body-c">
                                    <p className="content-c" style={{ fontSize: '1.25rem', lineHeight: 1.6, color: '#555' }}>
                                        At Happy ViVu House, we prioritize your safety with verified listings and secure booking processes, ensuring peace of mind for every renter.
                                    </p>
                                </div>
                            </div>
                            <div className="service-card">
                                <div className="card-header-c">
                                    <span className="card-box-ico bi bi-calendar4-week"></span>
                                    <h2 className="title-c" style={{ fontSize: '1.5rem', fontWeight: 500, lineHeight: 1.4 }}>
                                        Affordable Rates
                                    </h2>
                                </div>
                                <div className="card-body-c">
                                    <p className="content-c" style={{ fontSize: '1.25rem', lineHeight: 1.6, color: '#555' }}>
                                        Find your dream rental without breaking the bank. Happy ViVu House offers competitive pricing with no hidden fees.
                                    </p>
                                </div>
                            </div>
                            <div className="service-card">
                                <div className="card-header-c">
                                    <span className="card-box-ico bi bi-card-checklist"></span>
                                    <h2 className="title-c" style={{ fontSize: '1.5rem', fontWeight: 500, lineHeight: 1.4 }}>
                                        Quick & Easy
                                    </h2>
                                </div>
                                <div className="card-body-c">
                                    <p className="content-c" style={{ fontSize: '1.25rem', lineHeight: 1.6, color: '#555' }}>
                                        Discover your perfect home in just a few clicks. Our user-friendly platform makes finding and renting a breeze with Happy ViVu House.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/* Featured Rentals */}
                <section className="section-property section-t8 pt-0">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="title-wrap d-flex justify-content-between">
                                    <div className="title-box">
                                        <h2 className="title-a" style={{ fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.3 }}>
                                            Featured Rentals
                                        </h2>
                                    </div>
                                    <div className="title-link">
                                        <a href="/rental-home" style={{ fontSize: '1.25rem', fontWeight: 500 }}>
                                            Explore All Rentals
                                            <span className="bi bi-chevron-right"></span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <section className="property-grid grid">
                            <div className="d-flex flex-wrap">
                                {rooms.map((room) => (
                                    <div className="col-md-4" key={room.id}>
                                        <div className="card-box-a card-shadow">
                                            <div className="img-box-a">
                                                {room.roomMedia[0] ? (
                                                    <img
                                                        src={"http://localhost:8080/document/" + room.roomMedia[0].files}
                                                        alt={room.title}
                                                        className="img-a img-fluid"
                                                    />
                                                ) : (
                                                    <img
                                                        src="assets/img/property-1.jpg"
                                                        alt={room.title}
                                                        className="img-a img-fluid"
                                                    />
                                                )}
                                            </div>
                                            <div className="card-overlay">
                                                <div className="card-overlay-a-content">
                                                    <div className="card-header-a">
                                                        <h2 className="card-title-a" style={{ fontSize: '1.5rem', fontWeight: 500, lineHeight: 1.4 }}>
                                                            <Link to={`/rental-home/${room.id}`}>
                                                                <b style={{ fontSize: '1.5rem' }}>{room.title}</b>
                                                                <br />
                                                                <small style={{ fontSize: '18px', color: '#ffff' }}>{room.description}</small>
                                                            </Link>
                                                        </h2>
                                                    </div>
                                                    <div className="card-body-a">
                                                        <div className="price-box d-flex">
                                                            <span className="price-a" style={{ fontSize: '18px', fontWeight: 500 }}>
                                                                {room.status === "ROOM_RENT" &&
                                                                    `For Rent | ${room.price.toLocaleString("en-US", {
                                                                        style: "currency",
                                                                        currency: "USD",
                                                                    })}`}
                                                                {room.status === "HIRED" &&
                                                                    `Rented | ${room.price.toLocaleString("en-US", {
                                                                        style: "currency",
                                                                        currency: "USD",
                                                                    })}`}
                                                                {room.status === "CHECKED_OUT" &&
                                                                    `Checked Out | ${room.price.toLocaleString("en-US", {
                                                                        style: "currency",
                                                                        currency: "USD",
                                                                    })}`}
                                                            </span>
                                                        </div>
                                                        <Link to={`/rental-home/${room.id}`} className="color-b" style={{ fontSize: '1.25rem', fontWeight: 500 }}>
                                                            View Rental Details
                                                            <span className="bi bi-chevron-right"></span>
                                                        </Link>
                                                    </div>
                                                    <div className="card-footer-a">
                                                        <ul className="card-info d-flex justify-content-around">
                                                            <li>
                                                                <h4 className="card-info-title" style={{ fontSize: '1.125rem', fontWeight: 500, color: '#666' }}>
                                                                    Location
                                                                </h4>
                                                                <span style={{ fontSize: '1.125rem', fontWeight: 400 }}>{room.location.cityName}</span>
                                                            </li>
                                                            <li>
                                                                <h4 className="card-info-title" style={{ fontSize: '1.125rem', fontWeight: 500, color: '#666' }}>
                                                                    Type
                                                                </h4>
                                                                <span style={{ fontSize: '1.125rem', fontWeight: 400 }}>{room.category.name}</span>
                                                            </li>
                                                            <li>
                                                                <h4 className="card-info-title" style={{ fontSize: '1.125rem', fontWeight: 500, color: '#666' }}>
                                                                    Landlord
                                                                </h4>
                                                                <span style={{ fontSize: '1.125rem', fontWeight: 400 }}>{room.user.name}</span>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </section>
                {/* Our Trusted Landlords */}
                <section className="section-agents section-t8 pt-0">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="title-wrap d-flex justify-content-between">
                                    <div className="title-box">
                                        <h2 className="title-a" style={{ fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.3 }}>
                                            Our Trusted Landlords
                                        </h2>
                                    </div>
                                    <div className="title-link">
                                        <a href="/agent-grid" style={{ fontSize: '1.25rem', fontWeight: 500 }}>
                                            Meet All Landlords
                                            <span className="bi bi-chevron-right"></span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            {rentaler.map((rentaler) => {
                                if (rentaler.roles[0] && rentaler.roles[0].name === "ROLE_RENTALER") {
                                    return (
                                        <div className="col-md-4" key={rentaler.id}>
                                            <div className="card-box-d">
                                                <div className="card-img-d">
                                                    {rentaler?.imageUrl ? (
                                                        <img
                                                            src={rentaler?.imageUrl}
                                                            alt={rentaler?.name}
                                                            className="img-d img-fluid"
                                                        />
                                                    ) : (
                                                        <img
                                                            src="assets/img/agent-4.jpg"
                                                            alt={rentaler?.name}
                                                            className="img-d img-fluid"
                                                        />
                                                    )}
                                                </div>
                                                <div className="card-overlay card-overlay-hover">
                                                    <div className="card-header-d">
                                                        <div className="card-title-d align-self-center">
                                                            <h3 className="title-d" style={{ fontSize: '1.5rem', fontWeight: 500, lineHeight: 1.4 }}>
                                                                <Link to={`/agent-single/${rentaler.id}`} className="link-two">
                                                                    {rentaler?.name}
                                                                </Link>
                                                            </h3>
                                                        </div>
                                                    </div>
                                                    <div className="card-body-d">
                                                        <p className="content-d" style={{ fontSize: '1.25rem', lineHeight: 1.6 }}>
                                                            {rentaler?.address}
                                                        </p>
                                                        <div className="info-agents">
                                                            <p style={{ fontSize: '1.125rem', lineHeight: 1.5 }}>
                                                                <strong>Phone: </strong> {rentaler?.phone}
                                                            </p>
                                                            <p style={{ fontSize: '1.125rem', lineHeight: 1.5 }}>
                                                                <strong>Email: </strong> {rentaler?.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="card-footer-d">
                                                        <div className="socials-footer d-flex justify-content-center">
                                                            <ul className="list-inline">
                                                                {rentaler?.facebookUrl && (
                                                                    <li className="list-inline-item">
                                                                        <a href={rentaler?.facebookUrl} className="link-one" target="_blank">
                                                                            <i className="bi bi-facebook" aria-hidden="true"></i>
                                                                        </a>
                                                                    </li>
                                                                )}
                                                                {rentaler?.zaloUrl && (
                                                                    <li className="list-inline-item">
                                                                        <a href={rentaler?.zaloUrl} className="link-one" target="_blank">
                                                                            <svg
                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                width="20"
                                                                                height="20"
                                                                                viewBox="0 0 50 50"
                                                                            >
                                                                                <path
                                                                                    d="M 9 4 C 6.2504839 4 4 6.2504839 4 9 L 4 41 C 4 43.749516 6.2504839 46 9 46 L 41 46 C 43.749516 46 46 43.749516 46 41 L 46 9 C 46 6.2504839 43.749516 4 41 4 L 9 4 z M 9 6 L 15.576172 6 C 12.118043 9.5981082 10 14.323627 10 19.5 C 10 24.861353 12.268148 29.748596 15.949219 33.388672 C 15.815412 33.261195 15.988635 33.48288 16.005859 33.875 C 16.023639 34.279773 15.962689 34.835916 15.798828 35.386719 C 15.471108 36.488324 14.785653 37.503741 13.683594 37.871094 A 1.0001 1.0001 0 0 0 13.804688 39.800781 C 16.564391 40.352722 18.51646 39.521812 19.955078 38.861328 C 21.393696 38.200845 22.171033 37.756375 23.625 38.34375 A 1.0001 1.0001 0 0 0 23.636719 38.347656 C 26.359037 39.41176 29.356235 40 32.5 40 C 36.69732 40 40.631169 38.95117 44 37.123047 L 44 41 C 44 42.668484 42.668484 44 41 44 L 9 44 C 7.3315161 44 6 42.668484 6 41 L 6 9 C 6 7.3315161 7.3315161 6 9 6 z M 18.496094 6 L 41 6 C 42.668484 6 44 7.3315161 44 9 L 44 34.804688 C 40.72689 36.812719 36.774644 38 32.5 38 C 29.610147 38 26.863646 37.459407 24.375 36.488281 C 22.261967 35.634656 20.540725 36.391201 19.121094 37.042969 C 18.352251 37.395952 17.593707 37.689389 16.736328 37.851562 C 17.160501 37.246758 17.523335 36.600775 17.714844 35.957031 C 17.941109 35.196459 18.033096 34.45168 18.003906 33.787109 C 17.974816 33.12484 17.916946 32.518297 17.357422 31.96875 L 17.355469 31.966797 C 14.016928 28.665356 12 24.298743 12 19.5 C 12 14.177406 14.48618 9.3876296 18.496094 6 z M 32.984375 14.986328 A 1.0001 1.0001 0 0 0 32 16 L 32 25 A 1.0001 1.0001 0 1 0 34 25 L 34 16 A 1.0001 1.0001 0 0 0 32.984375 14.986328 z M 18 16 A 1.0001 1.0001 0 1 0 18 18 L 21.197266 18 L 17.152344 24.470703 A 1.0001 1.0001 0 0 0 18 26 L 23 26 A 1.0001 1.0001 0 1 0 23 24 L 19.802734 24 L 23.847656 17.529297 A 1.0001 1.0001 0 0 0 23 16 L 18 16 z M 29.984375 18.986328 A 1.0001 1.0001 0 0 0 29.162109 19.443359 C 28.664523 19.170123 28.103459 19 27.5 19 C 25.578848 19 24 20.578848 24 22.5 C 24 24.421152 25.578848 26 27.5 26 C 28.10285 26 28.662926 25.829365 29.160156 25.556641 A 1.0001 1.0001 0 0 0 31 25 L 31 22.5 L 31 20 A 1.0001 1.0001 0 0 0 29.984375 18.986328 z M 38.5 19 C 36.578848 19 35 20.578848 35 22.5 C 35 24.421152 36.578848 26 38.5 26 C 40.421152 26 42 24.421152 42 22.5 C 42 20.578848 40.421152 19 38.5 19 z M 27.5 21 C 28.340272 21 29 21.659728 29 22.5 C 29 23.340272 28.340272 24 27.5 24 C 26.659728 24 26 23.340272 26 22.5 C 26 21.659728 26.659728 21 27.5 21 z M 38.5 21 C 39.340272 21 40 21.659728 40 22.5 C 40 23.340272 39.340272 24 38.5 24 C 37.659728 24 37 23.340272 37 22.5 C 37 21.659728 37.659728 21 38.5 21 z"></path>
                                                                            </svg>
                                                                        </a>
                                                                    </li>
                                                                )}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    </div>
                </section>
                {/* What Our Renters Say */}
                <section className="section-testimonials section-t8 pt-0">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="title-wrap d-flex justify-content-between">
                                    <div className="title-box">
                                        <h2 className="title-a" style={{ fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.3 }}>
                                            What Our Renters Say
                                        </h2>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Slider {...settings} className="swiper-wrapper">
                            <div className="carousel-item-b">
                                <div className="testimonials-box">
                                    <div className="row align-items-center">
                                        <div className="col-sm-12 col-md-6">
                                            <div className="testimonial-img">
                                                <img src="../assets/img/agent-6.jpg" alt="" className="img-fluid rounded" />
                                            </div>
                                        </div>
                                        <div className="col-sm-12 col-md-6">
                                            <div className="testimonial-ico">
                                                <i className="bi bi-chat-quote-fill"></i>
                                            </div>
                                            <div className="testimonials-content">
                                                <p className="testimonial-text" style={{ fontSize: '1.25rem', lineHeight: 1.6, fontStyle: 'italic' }}>
                                                    Happy ViVu House made finding my perfect room so easy! The space is clean, cozy, and feels like home.
                                                </p>
                                            </div>
                                            <div className="testimonial-author-box">
                                                <img src="../assets/img/agent-6.jpg" alt="" className="testimonial-avatar" />
                                                <h5 className="testimonial-author" style={{ fontSize: '1.25rem', fontWeight: 500 }}>
                                                    Le Kien
                                                </h5>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="carousel-item-b">
                                <div className="testimonials-box">
                                    <div className="row align-items-center">
                                        <div className="col-sm-12 col-md-6">
                                            <div className="testimonial-img">
                                                <img src="../assets/img/agent-7.jpg" alt="" className="img-fluid rounded" />
                                            </div>
                                        </div>
                                        <div className="col-sm-12 col-md-6">
                                            <div className="testimonial-ico">
                                                <i className="bi bi-chat-quote-fill"></i>
                                            </div>
                                            <div className="testimonials-content">
                                                <p className="testimonial-text" style={{ fontSize: '1.25rem', lineHeight: 1.6, fontStyle: 'italic' }}>
                                                    I’m thrilled with my new place! Happy ViVu House connected me with an amazing landlord in no time.
                                                </p>
                                            </div>
                                            <div className="testimonial-author-box">
                                                <img src="../assets/img/agent-7.jpg" alt="" className="testimonial-avatar" />
                                                <h5 className="testimonial-author" style={{ fontSize: '1.25rem', fontWeight: 500 }}>
                                                    Tran Hien
                                                </h5>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="carousel-item-b">
                                <div className="testimonials-box">
                                    <div className="row align-items-center">
                                        <div className="col-sm-12 col-md-6">
                                            <div className="testimonial-img">
                                                <img src="../assets/img/agent-5.jpg" alt="" className="img-fluid rounded" />
                                            </div>
                                        </div>
                                        <div className="col-sm-12 col-md-6">
                                            <div className="testimonial-ico">
                                                <i className="bi bi-chat-quote-fill"></i>
                                            </div>
                                            <div className="testimonials-content">
                                                <p className="testimonial-text" style={{ fontSize: '1.25rem', lineHeight: 1.6, fontStyle: 'italic' }}>
                                                    Finding a beautiful, affordable room near my school was a dream come true, thanks to Happy ViVu House!
                                                </p>
                                            </div>
                                            <div className="testimonial-author-box">
                                                <img src="../assets/img/agent-5.jpg" alt="" className="testimonial-avatar" />
                                                <h5 className="testimonial-author" style={{ fontSize: '1.25rem', fontWeight: 500 }}>
                                                    Ha Linh
                                                </h5>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Slider>
                    </div>
                </section>
            </main>
        );
    }
}

export default Home;
