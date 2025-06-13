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
                                <div className="row">
                                    {tableData.map(item => (
                                        <div className="col-md-4 mb-4" key={item.room.id}>
                                            <div className="card h-100 shadow-sm">
                                                <img
                                                    src={item?.room.roomMedia[0]
                                                        ? "http://localhost:8080/document/" + item.room.roomMedia[0].files
                                                        : "assets/img/property-1.jpg"}
                                                    alt={item.room.title}
                                                    className="card-img-top"
                                                    style={{ height: "220px", objectFit: "cover" }}
                                                />
                                                <div className="card-body">
                                                    <h5 className="card-title">
                                                        <Link to={`/rental-home/${item.room.id}`} className="link-two">
                                                            {item.room.title}
                                                        </Link>
                                                    </h5>
                                                    <p className="card-text mb-1">
                                                        <strong>Description:</strong> {item.room.description}
                                                    </p>
                                                    <p className="card-text mb-1">
                                                        <strong>Location:</strong> {item.room.location.cityName}
                                                    </p>
                                                    <p className="card-text mb-1">
                                                        <strong>Type:</strong> {item.room.category.name}
                                                    </p>
                                                    <p className="card-text mb-1">
                                                        <strong>Landlord:</strong> {item.room.user.name}
                                                    </p>
                                                    <p className="card-text mb-1">
                                                        <strong>Status:</strong> {item.room.status === "ROOM_RENT" && "For rent"}
                                                        {item.room.status === "HIRED" && "Rented"}
                                                        {item.room.status === "CHECKED_OUT" && "Checked out"}
                                                    </p>
                                                    <p className="card-text mb-2">
                                                        <strong>Price:</strong> {item.room.price.toLocaleString('vi-VN', {
                                                            style: 'currency',
                                                            currency: 'VND',
                                                        })}
                                                    </p>
                                                    <Link to={`/rental-home/${item.room.id}`} className="btn btn-primary btn-sm">
                                                        View details
                                                    </Link>
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