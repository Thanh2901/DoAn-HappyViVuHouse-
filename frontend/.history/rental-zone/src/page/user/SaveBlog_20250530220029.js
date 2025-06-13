import React, { useEffect, useState } from 'react';
import SidebarNav from './SidebarNav';
import { getAllBlogStore } from '../../services/fetch/ApiUtils';
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
            setTotalItems(response.page.totalElements);
        }).catch(
            error => {
                toast.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
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
                                <h5 className="card-title">Saved Posts</h5>
                                <h6 className="card-subtitle text-muted"> Manage your saved posts.</h6>
                            </div>
                            <div className="card-body">
                                <div className="row g-4">
                                    {tableData.map(item => (
                                        <div className="col-md-6 col-lg-4" key={item.room.id}>
                                            <div className="card h-100 border-0 shadow">
                                                <div className="row g-0">
                                                    <div className="col-12">
                                                        <img
                                                            src={item?.room.roomMedia[0]
                                                                ? "http://localhost:8080/document/" + item.room.roomMedia[0].files
                                                                : "assets/img/property-1.jpg"}
                                                            alt={item.room.title}
                                                            className="img-fluid rounded-top"
                                                            style={{ height: "200px", objectFit: "cover", width: "100%" }}
                                                        />
                                                    </div>
                                                    <div className="col-12">
                                                        <div className="card-body py-3">
                                                            <h5 className="card-title mb-2 text-primary" style={{ fontSize: "20px" }}>
                                                                <Link to={`/rental-home/${item.room.id}`} className="link-underline link-underline-opacity-0">
                                                                    {item.room.title}
                                                                </Link>
                                                            </h5>
                                                            <div className="mb-2 text-muted">
                                                                {item.room.location.cityName} &bull; {item.room.category.name}
                                                            </div>
                                                            <div className="mb-2">
                                                                <strong>Landlord:</strong> {item.room.user.name}
                                                            </div>
                                                            <div className="mb-2">
                                                                <strong>Status:</strong>{" "}
                                                                {item.room.status === "ROOM_RENT" && <span className="badge bg-success p-1">For rent</span>}
                                                                {item.room.status === "HIRED" && <span className="badge bg-warning text-dark p-1">Rented</span>}
                                                                {item.room.status === "CHECKED_OUT" && <span className="badge bg-secondary p-1">Checked out</span>}
                                                            </div>
                                                            <div className="mb-2">
                                                                <strong>Price:</strong>{" "}
                                                                <span className="text-danger">
                                                                    {item.room.price.toLocaleString('vi-VN', {
                                                                        style: 'currency',
                                                                        currency: 'VND',
                                                                    })}
                                                                </span>
                                                            </div>
                                                            <p className="card-text" style={{ minHeight: "48px" }}>
                                                                {item.room.description}
                                                            </p>
                                                            <Link
                                                                to={`/rental-home/${item.room.id}`}
                                                                className="btn btn-success btn-sm mt-2 w-100 fw-bold"
                                                                style={{ backgroundColor: "#198754", borderColor: "#198754" }} // Bootstrap success green
                                                            >
                                                                View details
                                                            </Link>
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
                </div>
            </main>
            <Footer />
        </>
    )
}

export default SaveBlog;