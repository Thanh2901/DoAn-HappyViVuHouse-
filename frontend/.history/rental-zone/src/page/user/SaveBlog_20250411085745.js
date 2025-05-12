import React, { useEffect, useState } from 'react';
import SidebarNav from './SidebarNav';
import { getAllBlogStore, getAllFollow } from '../../services/fetch/ApiUtils';
import Pagination from './Pagnation';
import { toast } from 'react-toastify';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Header from '../../common/Header';
import Footer from '../../common/Footer';

function SaveBlog(props) {
    const { authenticated, role, currentUser, location, onLogout } = props;
    const history = useNavigate();

    const [tableData, setTableData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);
    const [totalItems, setTotalItems] = useState(0);

    // Fetch data from the API
    useEffect(() => {
        fetchData();
    }, [currentPage]);

    const fetchData = () => {
        getAllBlogStore(currentPage, itemsPerPage).then(response => {
            setTableData(response.content);
            setTotalItems(response.totalElements);
        }).catch(
            error => {
                toast.error((error && error.message) || 'Oops! Có điều gì đó xảy ra. Vui lòng thử lại!');
            }
        )
    }

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };


    if (!authenticated) {
        return <Navigate
            to={{
                pathname: "/login",
                state: { from: location }
            }} />;
    }

    return (
        <>
            <Header authenticated={authenticated} currentUser={currentUser} onLogout={onLogout} />
            <div style={{ marginTop: "90px" }}>
            </div>
            <main id="main">
                <div className="wrapper">
                    <nav id="sidebar" className="sidebar js-sidebar">
                        <div className="sidebar-content js-simplebar">
                            <a className="sidebar-brand" href="/profile">USER</a>
                            <SidebarNav />
                        </div>
                    </nav>

                    <div className="main">
                        <br />
                        <div className="container-fluid p-0"></div>
                        <div className="card">
                            <div className="card-header">
                                <h5 className="card-title">Lưu bài đăng</h5>
                                <h6 className="card-subtitle text-muted"> Quản lý các bài đăng đã lưu.</h6>
                            </div>
                            <div className="row">
                                {tableData.map(item => (

                                    <div className="col-md-4">
                                        <div className="card-box-a card-shadow">
                                            <div className="img-box-a">
                                                {item?.room.roomMedia[0] ?
                                                    <img src={"http://localhost:8080/document/"+item?.room.roomMedia[0].files} alt="" className="img-a img-fluid" style={{ width: "350", height: "450px" }} />
                                                    :
                                                    <img src="assets/img/property-1.jpg" alt="" className="img-a img-fluid" style={{ width: "350px", height: "450px" }} />
                                                }
                                            </div>
                                            <div className="card-overlay">
                                                <div className="card-overlay-a-content">
                                                    <div className="card-header-a">
                                                        <h2 className="card-title-a">
                                                            <Link to={`/rental-home/${item?.room.id}`}>
                                                                <b>{item?.room.title}</b>
                                                                <br /> <small>{item?.room.description}</small>
                                                            </Link>

                                                        </h2>
                                                    </div>
                                                    <div className="card-body-a">
                                                        <div className="price-box d-flex">
                                                            <span className="price-a">
                                                                {item?.room.status === "ROOM_RENT" && `Cho thuê |  ${item?.room.price.toLocaleString('vi-VN', {
                                                                    style: 'currency',
                                                                    currency: 'VND',
                                                                })}`}
                                                                {item?.room.status === "HIRED" && `Đã thuê | ${item?.room.price.toLocaleString('vi-VN', {
                                                                    style: 'currency',
                                                                    currency: 'VND',
                                                                })}`}
                                                                {item?.room.status === "CHECKED_OUT" && `Đã trả phòng | ${item?.room.price.toLocaleString('vi-VN', {
                                                                    style: 'currency',
                                                                    currency: 'VND',
                                                                })}`}
                                                            </span>
                                                        </div>
                                                        <Link to={`/rental-home/${item?.room.id}`}>Xem chi tiết
                                                            <span className="bi bi-chevron-right"></span>
                                                        </Link>
                                                    </div>
                                                    <div className="card-footer-a">
                                                        <ul className="card-info d-flex justify-content-around">
                                                            <li>
                                                                <h4 className="card-info-title">Vị trí</h4>
                                                                <span>{item?.room.location.cityName}
                                                                    <sup></sup>
                                                                </span>
                                                            </li>
                                                            <li>
                                                                <h4 className="card-info-title">Loại</h4>
                                                                <span>{item?.room.category.name}</span>
                                                            </li>
                                                            <li>
                                                                <h4 className="card-info-title">Người cho thuê</h4>
                                                                <span>{item?.room.user.name}</span>
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
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}

export default SaveBlog;