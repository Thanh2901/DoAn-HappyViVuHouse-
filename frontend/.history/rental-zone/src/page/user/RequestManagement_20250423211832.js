import React, { useEffect, useState } from 'react';
import SidebarNav from './SidebarNav';
import { changeStatusOfRequest, deleteMaintenance, getAllMaintenceOfRentaler, getAllRequireOfCustomer, getAllRequireOfRentaler } from '../../services/fetch/ApiUtils';
import Pagination from './Pagnation';
import { toast } from 'react-toastify';
import { Navigate, useNavigate } from 'react-router-dom';
import Footer from '../../common/Footer';
import Header from '../../common/Header';

function RequestManagement(props) {
    const { authenticated, role, currentUser, location, onLogout } = props;

    const [tableData, setTableData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch data from the API
    useEffect(() => {
        fetchData();
    }, [currentPage, searchQuery]);

    const fetchData = () => {
        getAllRequireOfCustomer(currentPage, itemsPerPage, searchQuery, currentUser?.phone).then(response => {
            setTableData(response.content);
            setTotalItems(response.page.totalElements);
        }).catch(
            error => {
                toast.error((error && error.message) || 'Oops! Có điều gì đó xảy ra. Vui lòng thử lại!');
            }
        )
    }

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
    };



    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    if (!props.authenticated) {
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
                                <h5 className="card-title">Trạng thái yêu cầu lặp đặt</h5>
                                <h6 className="card-subtitle text-muted"> Quản lý trạng thái của yêu cầu.</h6>
                            </div>
                            <div className="card-body">
                                <div id="datatables-buttons_wrapper" className="dataTables_wrapper dt-bootstrap5 no-footer"><div className="row"><div className="col-sm-12 col-md-6"><div className="dt-buttons btn-group flex-wrap">
                                </div></div>
                                    <div className="col-sm-12 col-md-6"><div id="datatables-buttons_filter" className="dataTables_filter float-end">
                                        <label>Search:<input type="search" className="form-control form-control-sm float-end fs-6" placeholder="Name"
                                            aria-controls="datatables-buttons"
                                            value={searchQuery}
                                            onChange={handleSearch} /></label>
                                    </div></div></div><div className="row dt-row"><div className="col-sm-12"><table id="datatables-buttons" className="table table-striped dataTable no-footer dtr-inline" style={{ width: "100%" }} aria-describedby="datatables-buttons_info">
                                        <thead>
                                            <tr>
                                                <th className="sorting sorting_asc" tabindex="0" aria-controls="datatables-buttons" rowspan="1" colspan="1" style={{ width: "224px" }}  >Tên Phòng</th>
                                                <th className="sorting" tabindex="0" aria-controls="datatables-buttons" rowspan="1" colspan="1" style={{ width: "180px" }} >Tên Người Thuê</th>
                                                <th className="sorting" tabindex="0" aria-controls="datatables-buttons" rowspan="1" colspan="1" style={{ width: "166px" }} >Số điện thoại</th>
                                                <th className="sorting" tabindex="0" aria-controls="datatables-buttons" rowspan="1" colspan="1" style={{ width: "130px" }} >Mô tả yêu cầu</th>
                                                <th className="sorting" tabindex="0" aria-controls="datatables-buttons" rowspan="1" colspan="1" style={{ width: "142px" }} >Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tableData.map((item) => (
                                                <tr className="odd">
                                                    <td className="dtr-control sorting_1" tabindex="0">{item.room.title}</td>
                                                    <td>{item.name}</td>
                                                    <td>{item.phoneNumber}</td>
                                                    <td>
                                                        {item.description}
                                                    </td>
                                                    <td>
                                                        <button type="button" class="btn btn-outline-success">
                                                            {item.isAnswer === true ? "Đã xử lý" : "Chưa xử lý"}
                                                        </button>
                                                    </td>

                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    </div>
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
                </div>
            </main>
            <Footer />
        </>
    )
}

export default RequestManagement;