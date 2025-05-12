import React, { useEffect, useState } from 'react';
import SidebarNav from './SidebarNav';
import { getAllRoomHired } from '../../services/fetch/ApiUtils';
import Pagination from './Pagnation';
import { toast } from 'react-toastify';
import { Navigate, useNavigate } from 'react-router-dom';
import Header from '../../common/Header';
import Footer from '../../common/Footer';

function RoomHired(props) {
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
        getAllRoomHired(currentPage, itemsPerPage, currentUser?.phone).then(response => {
            setTableData(response.content);
            setTotalItems(response.page.totalElements);
        }).catch(
            error => {
                toast.error((error && error.message) || 'Oops! Có điều gì đó xảy ra. Vui lòng thử lại!');
            }
        )
    }

    const handleSendRequest = (id) => {
        history('/send-request/'+id)
    }


    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const calculateRemainingMonths = (deadlineContract) => {
        const currentDate = new Date();
        const contractDate = new Date(deadlineContract);

        const remainingMonths = (contractDate.getFullYear() - currentDate.getFullYear()) * 12 +
            (contractDate.getMonth() - currentDate.getMonth());

        return remainingMonths;
    }

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
                                <span className="align-middle">USER</span>
                            </a>
                            <SidebarNav />
                        </div>
                    </nav>

                    <div className="main">
                        <br />
                        <div className="container-fluid p-0"></div>
                        <div className="card">
                            <div className="card-header">
                                <h5 className="card-title">Lịch sử thuê phòng</h5>
                                <h6 className="card-subtitle text-muted"> Hiển thị lịch sử thuê phòng.</h6>
                            </div>
                            <div className="card-body">
                                <div id="datatables-buttons_wrapper" className="dataTables_wrapper dt-bootstrap5 no-footer"><div className="row"><div className="col-sm-12 col-md-6"><div className="dt-buttons btn-group flex-wrap">
                                </div></div>
                                    <div className="col-sm-12 col-md-6"><div id="datatables-buttons_filter" className="dataTables_filter">
                                    </div></div></div><div className="row dt-row"><div className="col-sm-12"><table id="datatables-buttons" className="table table-striped dataTable no-footer dtr-inline" style={{ width: "100%" }} aria-describedby="datatables-buttons_info">
                                        <thead>
                                            <tr>
                                                <th className="sorting sorting_asc" tabindex="0" aria-controls="datatables-buttons" rowspan="1" colspan="1" style={{ width: "224px" }}  >Tên Phòng</th>
                                                <th className="sorting" tabindex="0" aria-controls="datatables-buttons" rowspan="1" colspan="1" style={{ width: "180px" }} >Người thuê</th>
                                                <th className="sorting" tabindex="0" aria-controls="datatables-buttons" rowspan="1" colspan="1" style={{ width: "180px" }} >Số điện thoại</th>
                                                <th className="sorting" tabindex="0" aria-controls="datatables-buttons" rowspan="1" colspan="1" style={{ width: "75px" }} >Giá</th>
                                                <th className="sorting" tabindex="0" aria-controls="datatables-buttons" rowspan="1" colspan="1" style={{ width: "100px" }} >Thời hạn</th>
                                                <th className="sorting" tabindex="0" aria-controls="datatables-buttons" rowspan="1" colspan="1" style={{ width: "142px" }} >Trạng Thái</th>
                                                <th className="sorting" tabindex="0" aria-controls="datatables-buttons" rowspan="1" colspan="1" style={{ width: "134px" }} >Chế độ</th></tr>
                                        </thead>
                                        <tbody>
                                            {tableData.map((item) => (
                                                <tr className="odd">
                                                    <td><a href={`/rental-home/` + item.room.id} target='_blank'>{item.room.title}</a></td>
                                                    <td>{item.nameOfRent}</td>
                                                    <td>{item.phone}</td>
                                                    <td>{item.room.price && item.room.price.toLocaleString('vi-VN', {
                                                        style: 'currency',
                                                        currency: 'VND',
                                                    })}</td>
                                                    <td>{calculateRemainingMonths(new Date(item.deadlineContract))} tháng</td>
                                                    <td style={{ color: "green" }}>{item.room.status === "ROOM_RENT" || item.room.status === "CHECKED_OUT" ? "Đã trả phòng" : "Đã thuê"}</td>
                                                    <td>

                                                        {
                                                            item.room.status === "CHECKED_OUT" ?
                                                                <span style={{color : "red"}}>Vô hiệu hóa</span>
                                                                :
                                                                <button type="button" class="btn btn-outline-success">
                                                                    <a href="#" onClick={() => handleSendRequest(item.id)}>Gửi yêu cầu</a>
                                                                </button>
                                                        }

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

export default RoomHired;