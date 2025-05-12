import React, { useEffect, useState } from 'react';
import SidebarNav from './SidebarNav';
import Nav from './Nav';
import Pagination from './Pagnation';
import { toast } from 'react-toastify';
import { Navigate, useNavigate } from 'react-router-dom';
import { disableRoom, getAllAccpuntOfAdmin, lockedAccount } from '../../services/fetch/ApiUtils';

function AccountManagement(props) {
    const { authenticated, role, currentUser, location, onLogout } = props;
    const history = useNavigate();

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
        getAllAccpuntOfAdmin(currentPage, itemsPerPage, searchQuery).then(response => {
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

    const handleAuthorization = (userId) => {
        history("/admin/authorization/"+ userId)
    }

    const handleLockedAccount = (userId) => {
        lockedAccount(userId).then(response => {
            toast.success(response.message)
            fetchData();
        }).catch(
            error => {
                toast.error((error && error.message) || 'Oops! Có điều gì đó xảy ra. Vui lòng thử lại!');
            }
        )

    };


    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    if (!authenticated) {
        return <Navigate
            to={{
                pathname: "/login-admin",
                state: { from: location }
            }} />;
    }

    return (
        <>
            <div className="wrapper">
                <nav id="sidebar" className="sidebar js-sidebar">
                    <div className="sidebar-content js-simplebar">
                        <a className="sidebar-brand" href="/admin">
                            <span className="align-middle">ADMIN PRO</span>
                        </a>
                        <SidebarNav />
                    </div>
                </nav>

                <div className="main">
                    <Nav onLogout={onLogout} currentUser={currentUser} />

                    <br />
                    <div className="container-fluid p-0"></div>
                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title fs-5">Quản lý tài khoản</h5>
                            <h6 className="card-subtitle text-muted"> Quản lý tài khoản có các chức năng phân quyền và khóa tài khoản.</h6>
                        </div>
                        <div className="card-body">
                            <div id="datatables-buttons_wrapper" className="dataTables_wrapper dt-bootstrap5 no-footer"><div className="row"><div className="col-sm-12 col-md-6"><div className="dt-buttons btn-group flex-wrap">
                            </div></div>
                                <div className="col-sm-12 col-md-6"><div id="datatables-buttons_filter" className="dataTables_filter float-end mb-3">
                                    <label>Search:<input type="search" className="form-control form-control-sm float-end fs-6" placeholder="Enter name or mail"
                                                         aria-controls="datatables-buttons"
                                                         value={searchQuery}
                                                         onChange={handleSearch} /></label>
                                </div></div></div><div className="row dt-row"><div className="col-sm-12"><table id="datatables-buttons" className="table table-striped dataTable no-footer dtr-inline" style={{ width: "100%" }} aria-describedby="datatables-buttons_info">
                                <thead>
                                <tr>
                                    <th className="sorting sorting_asc" tabIndex="0" aria-controls="datatables-buttons" rowSpan="1" colSpan="1" style={{ width: "224px" }}  >Họ và tên</th>
                                    <th className="sorting" tabIndex="0" aria-controls="datatables-buttons" rowSpan="1" colSpan="1" style={{ width: "290px" }} >Email</th>
                                    <th className="sorting" tabIndex="0" aria-controls="datatables-buttons" rowSpan="1" colSpan="1" style={{ width: "166px" }} >Số điện thoại</th>
                                    <th className="sorting" tabIndex="0" aria-controls="datatables-buttons" rowSpan="1" colSpan="1" style={{ width: "142px" }} >Trạng Thái</th>
                                    <th className="sorting" tabIndex="0" aria-controls="datatables-buttons" rowSpan="1" colSpan="1" style={{ width: "134px" }} >Chế độ</th></tr>
                                </thead>
                                <tbody>
                                {tableData.map((item) => (
                                    <tr className="odd">
                                        <td className="dtr-control sorting_1" tabIndex="0">{item.name}</td>
                                        <td>{item.email}</td>
                                        <td>{item.phone}</td>

                                        <td style={{ color: "green" }}>
                                            <button type="button" className="btn btn-outline-success" onClick={() => handleLockedAccount(item.id)}>
                                                {item.isLocked === true ? "Mở" : "Khóa"}
                                            </button>
                                        </td>
                                        <td>
                                            <button type="button" className="btn btn-success" onClick={() => handleAuthorization(item.id)}>
                                                Phân quyền
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
        </>
    )
}

export default AccountManagement;