import React, { useEffect, useState } from 'react';
import SidebarNav from './SidebarNav';
import { getAllFollow } from '../../services/fetch/ApiUtils';
import Pagination from './Pagnation';
import { toast } from 'react-toastify';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Header from '../../common/Header';
import Footer from '../../common/Footer';

function Follow(props) {
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
        getAllFollow(currentPage, itemsPerPage).then(response => {
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
                            <a className="sidebar-brand" href="/profile">
                                TENANT SYSTEM
                            </a>
                            <SidebarNav />
                        </div>
                    </nav>

                    <div className="main">
                        <br />
                        <div className="container-fluid p-0"></div>
                        <div className="card">
                            <div className="card-header">
                                <h5 className="card-title">Followed Landlords</h5>
                                <h6 className="card-subtitle text-muted"> Displaying the landlords you are following.</h6>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    {tableData.map((item) => (
                                        <div className="col-md-4 mb-4" key={item.rentaler.id}>
                                            <div className="card h-100 shadow-sm">
                                                <img
                                                    src={item.rentaler?.imageUrl ? item.rentaler.imageUrl : "assets/img/agent-4.jpg"}
                                                    alt={item.rentaler.name}
                                                    className="card-img-top"
                                                    style={{ height: "250px", objectFit: "cover" }}
                                                />
                                                <div className="card-body">
                                                    <h5 className="card-title">
                                                        <Link to={`/angent-single/${item.rentaler.id}`} className="link-two">
                                                            {item.rentaler.name}
                                                        </Link>
                                                    </h5>
                                                    <p className="card-text mb-1">
                                                        <strong>Address:</strong> {item.rentaler.address}
                                                    </p>
                                                    <p className="card-text mb-1">
                                                        <strong>Phone:</strong> {item.rentaler.phone}
                                                    </p>
                                                    <p className="card-text mb-1">
                                                        <strong>Email:</strong> {item.rentaler.email}
                                                    </p>
                                                    <div className="d-flex gap-2 mt-2">
                                                        {item.rentaler?.facebookUrl && (
                                                            <a href={item.rentaler.facebookUrl} className="btn btn-outline-primary btn-sm" target="_blank" rel="noopener noreferrer">
                                                                <i className="bi bi-facebook"></i>
                                                            </a>
                                                        )}
                                                        {item.rentaler?.zaloUrl && (
                                                            <a href={item.rentaler.zaloUrl} className="btn btn-outline-info btn-sm" target="_blank" rel="noopener noreferrer">
                                                                Zalo
                                                            </a>
                                                        )}
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

export default Follow;