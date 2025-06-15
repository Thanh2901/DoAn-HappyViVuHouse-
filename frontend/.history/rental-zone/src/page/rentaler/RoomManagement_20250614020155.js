import React, { useEffect, useState, useRef } from 'react';
import SidebarNav from './SidebarNav';
import Nav from './Nav';
import { disableRoom, getAllRoomOfRentaler } from '../../services/fetch/ApiUtils';
import Pagination from './Pagnation';
import { toast } from 'react-toastify';
import { Navigate, useNavigate } from 'react-router-dom';
import ModalRoomDetails from './modal/ModalRoomDetail';
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { translate } from '../../utils/i18n/translate';
import RoomMap from './RoomMap';

function RoomManagement(props) {
    const { authenticated, role, currentUser, location, onLogout } = props;
    const history = useNavigate();

    const [tableData, setTableData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    const [roomId, setRoomId] = useState(4);
    const [showModal, setShowModal] = useState(false);

    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);

    const [statusFilter, setStatusFilter] = useState("ALL");

    // Fetch data from the API
    useEffect(() => {
        fetchData();
    }, [currentPage, searchQuery]);

    const fetchData = () => {
        getAllRoomOfRentaler(currentPage, itemsPerPage, searchQuery).then(response => {
            setTableData(response.content);
            setTotalItems(response.page.totalElements);
            console.log("Day la response room management:", response)
        }).catch(
            error => {
                toast.error((error && error.message) || 'Oops! Có điều gì đó xảy ra. Vui lòng thử lại!');
            }
        )
    }

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleRedirectAddRoom = () => {
        history('/rentaler/add-room')
    }

    const handleEditRoom = (id) => {
        history('/rentaler/edit-room/' + id)
    }

    const handleSetRoomId = (id) => {
        setRoomId(id);
        setShowModal(true);
    }

    const handleDisableRoom = (roomId) => {
        disableRoom(roomId).then(response => {
            toast.success(response.message)
            fetchData();
        }).catch(
            error => {
                toast.error((error && error.message) || 'Oops! Some thing happened, Please try again later!');
            }
        )
    };

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Hàm debounce để giảm số lần gọi cập nhật
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    useEffect(() => {
        // Cleanup bản đồ cũ nếu có
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }

        if (!tableData || tableData.length === 0) return;

        const timer = setTimeout(() => {
            const validRooms = tableData.filter(
                (item) =>
                    item.latitude &&
                    item.longitude &&
                    !isNaN(parseFloat(item.latitude)) &&
                    !isNaN(parseFloat(item.longitude))
            );

            if (validRooms.length === 0 || !mapRef.current) return;

            // Đặt kiểu CSS cố định cho container bản đồ để tránh thay đổi kích thước đột ngột
            if (mapRef.current) {
                mapRef.current.style.height = "400px";
                mapRef.current.style.width = "100%";
                mapRef.current.style.position = "relative";
                mapRef.current.style.outline = "none";
            }

            const center = [
                parseFloat(validRooms[0].latitude),
                parseFloat(validRooms[0].longitude),
            ];

            // Icon xanh lá cho phòng đã duyệt
            const greenIcon = L.icon({
                iconUrl: "https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-green.png",
                iconSize: [20, 30],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
                shadowSize: [41, 41]
            });

            // Icon đỏ cho phòng chưa duyệt
            const redIcon = L.icon({
                iconUrl: "https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-red.png",
                iconSize: [20, 30],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
                shadowSize: [41, 41]
            });

            try {
                // Khởi tạo bản đồ với các tùy chọn ổn định để tránh flicker
                const map = L.map(mapRef.current, {
                    attributionControl: false,  // Tắt attribution để tránh re-render không cần thiết
                    zoomControl: true,          // Giữ điều khiển zoom
                    fadeAnimation: false,       // Tắt animation để giảm hiệu ứng chập chờn
                    zoomAnimation: false,       // Tắt animation zoom
                    markerZoomAnimation: false  // Tắt animation marker zoom
                }).setView(center, 12);
                
                mapInstanceRef.current = map;

                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    maxZoom: 19
                }).addTo(map);

                // Thêm các marker
                validRooms.forEach((item) => {
                    const isApproved = item.isApprove === true || item.isApprove === "true" || item.isApprove === 1;
                    const icon = isApproved ? greenIcon : redIcon;
                    const marker = L.marker(
                        [parseFloat(item.latitude), parseFloat(item.longitude)],
                        { icon }
                    ).addTo(map);
                    marker.bindPopup(
                        `<b>${item.title}</b><br>${item.address || ""}<br>Price: ${
                            item.price
                                ? item.price.toLocaleString("vi-VN", {
                                      style: "currency",
                                      currency: "VND",
                                  })
                                : ""
                        }<br>Status: ${
                            isApproved
                                ? "<span style='color:green'>Approved</span>"
                                : "<span style='color:red'>Disapproved</span>"
                        }`
                    );
                });

                // Chỉ sử dụng một callback để cập nhật kích thước, tránh gọi nhiều lần
                const updateMapSize = () => {
                    if (mapInstanceRef.current && mapRef.current) {
                        mapInstanceRef.current.invalidateSize({ animate: false, pan: false });
                    }
                };

                // Sử dụng debounce để giảm số lần gọi invalidateSize
                const debouncedUpdateSize = debounce(updateMapSize, 250);

                // Cập nhật kích thước sau một khoảng thời gian và khi cửa sổ thay đổi kích thước
                setTimeout(updateMapSize, 500);
                window.addEventListener('resize', debouncedUpdateSize);

                // Xử lý sự kiện tab visibilitychange
                const handleVisibilityChange = () => {
                    if (!document.hidden && mapInstanceRef.current) {
                        setTimeout(updateMapSize, 200);
                    }
                };

                document.addEventListener('visibilitychange', handleVisibilityChange);

                // Cleanup function
                return () => {
                    window.removeEventListener('resize', debouncedUpdateSize);
                    document.removeEventListener('visibilitychange', handleVisibilityChange);
                    if (mapInstanceRef.current) {
                        mapInstanceRef.current.remove();
                        mapInstanceRef.current = null;
                    }
                };
            } catch (error) {
                console.error("Error initializing map:", error);
                if (mapInstanceRef.current) {
                    mapInstanceRef.current.remove();
                    mapInstanceRef.current = null;
                }
            }
        }, 500); // Đợi 500ms để DOM hoàn toàn ready
        
        return () => {
            clearTimeout(timer);
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [tableData]); // Chỉ re-render khi tableData thay đổi

    // Thêm useEffect mới để xử lý sự kiện khi chuyển tab
    useEffect(() => {
        const handleTabVisibility = () => {
            if (mapInstanceRef.current && !document.hidden) {
                setTimeout(() => {
                    mapInstanceRef.current.invalidateSize();
                }, 200);
            }
        };

        document.addEventListener('visibilitychange', handleTabVisibility);
        
        return () => {
            document.removeEventListener('visibilitychange', handleTabVisibility);
        };
    }, []);

    const filteredTableData = tableData.filter(item => {
        if (statusFilter === "ALL") return true;
        // Đã thuê: HIRED
        if (statusFilter === "RENTED") return item.status === "HIRED";
        // Chưa thuê: ROOM_RENT hoặc CHECK_OUT
        if (statusFilter === "AVAILABLE") return item.status === "ROOM_RENT" || item.status === "CHECKED_OUT";
        return true;
    });

    console.log("ROOM_ID", roomId)

    if (!props.authenticated) {
        return <Navigate
            to={{
                pathname: "/login-rentaler",
                state: { from: location }
            }} />;
    }

    return (
        <>
            <div className="wrapper">
                <nav id="sidebar" className="sidebar js-sidebar">
                    <div className="sidebar-content js-simplebar">
                        <a className="sidebar-brand" href="/rentaler">
                            <span className="align-middle">LANDLORD PRO</span>
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
                            <h5 className="card-title fs-5">{translate("rentaler:rental_rooms_management:title")}</h5>
                            <h6 className="card-subtitle text-muted">{translate("rentaler:rental_rooms_management:subtitle")}</h6>
                        </div>
                        <div className="card-body">
                            <div id="datatables-buttons_wrapper" className="dataTables_wrapper dt-bootstrap5 no-footer"><div className="row"><div className="col-sm-12 col-md-6"><div className="dt-buttons btn-group flex-wrap">
                                <button className="btn btn-secondary buttons-copy buttons-html5" tabindex="0" aria-controls="datatables-buttons" type="button"><a onClick={handleRedirectAddRoom}>{translate("rentaler:rental_rooms_management:add_room")}</a></button>
                            </div></div>
                                <div className="col-sm-12 col-md-6"><div id="datatables-buttons_filter" className="dataTables_filter float-end mb-3">
                                    <label>{translate("rentaler:search")}:<input type="search" className="form-control form-control-sm float-end fs-6" placeholder="Enter name"
                                                         aria-controls="datatables-buttons"
                                                         value={searchQuery}
                                                         onChange={handleSearch} /></label>
                                </div></div></div>
                                <div className="mb-3">
                                    <label>Room status filter: </label>
                                    <select
                                        className="form-select w-auto d-inline-block ms-2"
                                        value={statusFilter}
                                        onChange={e => setStatusFilter(e.target.value)}
                                    >
                                        <option value="ALL">All</option>
                                        <option value="RENTED">RENTED</option>
                                        <option value="AVAILABLE">NOT RENTED</option>
                                    </select>
                                </div>
                                <div className="row dt-row"><div className="col-sm-12"><table id="datatables-buttons" className="table table-striped dataTable no-footer dtr-inline" style={{ width: "100%" }} aria-describedby="datatables-buttons_info">
                                <thead>
                                <tr>
                                    <th className="sorting sorting_asc" tabindex="0" aria-controls="datatables-buttons" rowspan="1" colspan="1" style={{ width: "224px" }}>{translate("rentaler:rental_rooms_management:room_name")}</th>
                                    <th className="sorting" tabindex="0" aria-controls="datatables-buttons" rowspan="1" colspan="1" style={{ width: "266px" }}>{translate("rentaler:rental_rooms_management:address")}</th>
                                    <th className="sorting" tabindex="0" aria-controls="datatables-buttons" rowspan="1" colspan="1" style={{ width: "75px" }} >{translate("rentaler:rental_rooms_management:price")}</th>
                                    <th className="sorting" tabindex="0" aria-controls="datatables-buttons" rowspan="1" colspan="1" style={{ width: "142px" }} >{translate("rentaler:rental_rooms_management:status")}</th>
                                    <th className="sorting" tabindex="0" aria-controls="datatables-buttons" rowspan="1" colspan="1" style={{ width: "90px" }} >{translate("rentaler:rental_rooms_management:hidden")}/{translate("rentaler:rental_rooms_management:show")}</th>
                                    <th className="sorting" tabindex="0" aria-controls="datatables-buttons" rowspan="1" colspan="1" style={{ width: "90px" }} >{translate("rentaler:rental_rooms_management:approve")}</th>
                                    <th className="sorting" tabindex="0" aria-controls="datatables-buttons" rowspan="1" colspan="1" style={{ width: "134px" }} >{translate("rentaler:rental_rooms_management:action")}</th></tr>
                                </thead>
                                <tbody>
                                {filteredTableData.map((item) => (
                                    <tr className="odd">
                                        <td className="dtr-control sorting_1" tabindex="0">{item.title}</td>
                                        <td>{item.address}</td>
                                        <td>{item.price && item.price.toLocaleString('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND',
                                        })}</td>
                                        <td style={{ color: "green" }}>{item.status === "ROOM_RENT" || item.status === "CHECKED_OUT" ? "Not rented" : "Rented"}</td>
                                        <td style={{ color: "green" }}>{item.isLocked === "ENABLE" ? "Show" : "Hidden"}</td>
                                        <td style={{ color: "green" }}>{(item.isApprove === false) || (item.isApprove === "false")? "Not approved" : "Approved"}</td>

                                        <td>
                                            {item.isRemove === true ? (
                                                <span style={{ color: "red" }} data-toggle="tooltip" data-placement="bottom" title="Chi tiết thông tin gỡ ở email của bạn.">Admin remove post</span>
                                            ) : (
                                                <div className="dropdown">
                                                <button
                                                    className="btn btn-sm btn-secondary dropdown-toggle"
                                                    type="button"
                                                    id={`dropdownMenuButton-${item.id}`}
                                                    data-bs-toggle="dropdown"
                                                    aria-expanded="false"
                                                >
                                                    <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    fill="currentColor"
                                                    className="bi bi-three-dots-vertical"
                                                    viewBox="0 0 16 16"
                                                    >
                                                    <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                                                    </svg>
                                                </button>
                                                <ul className="dropdown-menu" aria-labelledby={`dropdownMenuButton-${item.id}`}>
                                                    <li>
                                                    <a
                                                        className="dropdown-item"
                                                        href="#"
                                                        onClick={() => handleEditRoom(item.id)}
                                                        data-toggle="tooltip"
                                                        data-placement="bottom"
                                                        title="Sửa"
                                                    >
                                                        <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="16"
                                                        height="16"
                                                        fill="currentColor"
                                                        className="bi bi-pencil me-2"
                                                        viewBox="0 0 16 16"
                                                        >
                                                        <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5.5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" />
                                                        </svg>
                                                        Sửa
                                                    </a>
                                                    </li>
                                                    <li>
                                                    <a
                                                        className="dropdown-item"
                                                        href="#"
                                                        onClick={() => handleSetRoomId(item.id)}
                                                        data-bs-toggle="modal"
                                                        data-bs-target=".bd-example-modal-lg"
                                                        data-toggle="tooltip"
                                                        data-placement="bottom"
                                                        title="Xem chi tiết"
                                                    >
                                                        <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="16"
                                                        height="16"
                                                        fill="currentColor"
                                                        className="bi bi-eye me-2"
                                                        viewBox="0 0 16 16"
                                                        >
                                                        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                                                        <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
                                                        </svg>
                                                        Xem chi tiết
                                                    </a>
                                                    </li>
                                                    <li>
                                                    <a
                                                        className="dropdown-item"
                                                        href="#"
                                                        onClick={() => handleDisableRoom(item.id)}
                                                        data-toggle="tooltip"
                                                        data-placement="bottom"
                                                        title="Ẩn phòng"
                                                    >
                                                        <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="16"
                                                        height="16"
                                                        fill="currentColor"
                                                        className="bi bi-trash me-2"
                                                        viewBox="0 0 16 16"
                                                        >
                                                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                                                        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                                                        </svg>
                                                        Ẩn phòng
                                                    </a>
                                                    </li>
                                                </ul>
                                                </div>
                                            )}
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
                            <div style={{ margin: "32px 0 0 0" }}>
                                <h5 className="mb-3">Map of rental rooms</h5>
                                <RoomMap rooms={filteredTableData} />
                            </div>
                        </div>
                    </div>
                    <div className="modal fade bd-example-modal-lg" tabIndex="-1" role="dialog" aria-labeledby="myLargeModalLabel" aria-hidden="true">
                        <div class="modal-dialog modal-xl">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title" id="exampleModalLabel">Post details</h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body overflow-auto">
                                    {showModal && <ModalRoomDetails roomId={roomId} />}
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </>
    )
}

export default RoomManagement;