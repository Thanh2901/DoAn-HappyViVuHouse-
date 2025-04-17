import React, { useState, useEffect } from "react";
import Header from "../../common/Header";
import Footer from "../../common/Footer";
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from "react-toastify";
import Pagination from "./Pagnation";
import { getAllRoomOfCustomer } from "../../services/fetch/ApiUtils";

const RentalHome = (props) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);
    const [totalItems, setTotalItems] = useState(0);
    const [rooms, setRooms] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [price, setPrice] = useState('');
    const [cateId, setCateId] = useState(0);

    useEffect(() => {
        fetchData();
    }, [currentPage, searchQuery, price, cateId]);

    const fetchData = () => {
        getAllRoomOfCustomer(currentPage, itemsPerPage, searchQuery, price, cateId).then(response => {
            setRooms(response.content);
            setTotalItems(response.totalElements);
        }).catch(
            error => {
                toast.error((error && error.message) || 'Oops! Có điều gì đó xảy ra. Vui lòng thử lại!');
            }
        )
    }

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handlePriceChange = (event) => {
        setPrice(event.target.value);
    };

    const handleCategoryChange = (event) => {
        setCateId(event.target.value);
    };

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <>
            <Header authenticated={props.authenticated} currentUser={props.currentUser} onLogout={props.onLogout} />
            <main id="main">
                <section className="intro-single">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-12 col-lg-8">
                                <div className="title-single-box">
                                    <h1 className="title-single">PHÒNG TRỌ</h1>
                                    <span className="color-text-a">Cho thuê phòng trọ</span>
                                </div>
                            </div>
                            <div className="col-md-12 col-lg-4">
                                <nav aria-label="breadcrumb" className="breadcrumb-box d-flex justify-content-lg-end">
                                    <ol className="breadcrumb">
                                        <li className="breadcrumb-item">
                                            <a href="/">Trang chủ</a>
                                        </li>
                                        <li className="breadcrumb-item active" aria-current="page">
                                        </li>
                                    </ol>
                                </nav>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="property-grid grid">
                    <div className="container">
                        <div className="row" style={{ marginBottom: "30px" }}>
                            <div className="col-sm-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    name="searchQuery"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    id="inputAddress"
                                    placeholder="Tên phòng"

                                />
                            </div>
                            <div className="col-sm-3">
                                <input
                                    type="number"
                                    className="form-control"
                                    name="price"
                                    value={price}
                                    onChange={handlePriceChange}
                                    id="inputAddress"
                                    placeholder="Giá"

                                />
                            </div>
                            <div className="col-sm-3">
                                <select className="form-select" id="categoryId" name="categoryId"                                     
                                    value={cateId}
                                    onChange={handleCategoryChange}>
                                    <option value={0}>Chọn...</option>
                                    <option value={1}>Bất động sản</option>
                                    <option value={2}>Phòng trọ</option>
                                    <option value={3}>Chung cư mini</option>
                                </select>
                            </div>
                        </div>
                        <div className="row">
                            {rooms.map(room => (

                                <div className="col-md-4">
                                    <div className="card-box-a card-shadow">
                                        <div className="img-box-a">
                                            {room.roomMedia[0] ?
                                                <img src={"http://localhost:8080/document/"+room.roomMedia[0].files} alt="" className="img-a img-fluid" style={{ width: "350px", height: "450px" }} />
                                                :
                                                <img src="assets/img/property-1.jpg" alt="" className="img-a img-fluid" style={{ width: "350px", height: "450px" }} />
                                            }
                                        </div>
                                        <div className="card-overlay">
                                            <div className="card-overlay-a-content">
                                                <div className="card-header-a">
                                                    <h2 className="card-title-a">
                                                        <Link to={`/rental-home/${room.id}`}>
                                                            <b>{room.title}</b>
                                                            <br /> <small>{room.description}</small>
                                                        </Link>

                                                    </h2>
                                                </div>
                                                <div className="card-body-a">
                                                    <div className="price-box d-flex">
                                                        <span className="price-a">
                                                            {room.status === "ROOM_RENT" && `Cho thuê |  ${room.price.toLocaleString('vi-VN', {
                                                                style: 'currency',
                                                                currency: 'VND',
                                                            })}`}
                                                            {room.status === "HIRED" && `Đã thuê | ${room.price.toLocaleString('vi-VN', {
                                                                style: 'currency',
                                                                currency: 'VND',
                                                            })}`}
                                                            {room.status === "CHECKED_OUT" && `Đã trả phòng | ${room.price.toLocaleString('vi-VN', {
                                                                style: 'currency',
                                                                currency: 'VND',
                                                            })}`}
                                                        </span>
                                                    </div>
                                                    <Link to={`/rental-home/${room.id}`}>Xem chi tiết
                                                        <span className="bi bi-chevron-right"></span>
                                                    </Link>
                                                </div>
                                                <div className="card-footer-a">
                                                    <ul className="card-info d-flex justify-content-around">
                                                        <li>
                                                            <h4 className="card-info-title">Vị trí</h4>
                                                            <span>{room.location.cityName}
                                                                <sup></sup>
                                                            </span>
                                                        </li>
                                                        <li>
                                                            <h4 className="card-info-title">Loại</h4>
                                                            <span>{room.category.name}</span>
                                                        </li>
                                                        <li>
                                                            <h4 className="card-info-title">Người cho thuê</h4>
                                                            <span>{room.user.name}</span>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                        </div>
                        <Pagination
                            itemsPerPage={itemsPerPage}
                            totalItems={totalItems}
                            currentPage={currentPage}
                            paginate={paginate}
                        />
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
};

export default RentalHome;