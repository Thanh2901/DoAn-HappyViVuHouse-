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
    const [itemsPerPage] = useState(3);
    const [totalItems, setTotalItems] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [roomId, setRoomId] = useState(4);
    const [showModal, setShowModal] = useState(false);

    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);

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
                toast.error((error && error.message) || 'Oops! Có điều gì đó xảy ra. Vui lòng thử lại!');
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
        
        // Nếu không có dữ liệu thì thoát
        if (!tableData || tableData.length === 0) return;
        
        // Đảm bảo chỉ khởi tạo bản đồ một lần và chờ đủ thời gian để DOM được render hoàn chỉnh
        const timer = setTimeout(() => {
            // Lọc ra các phòng có tọa độ hợp lệ
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
                        `<b>${item.title}</b><br>${item.address || ""}<br>Giá: ${
                            item.price
                                ? item.price.toLocaleString("vi-VN", {
                                      style: "currency",
                                      currency: "VND",
                                  })
                                : ""
                        }<br>Trạng thái: ${
                            isApproved
                                ? "<span style='color:green'>Đã duyệt</span>"
                                : "<span style='color:red'>Chưa duyệt</span>"
                        }`
                    );
                });

                // Chỉ sử dụng một callback để cập nhật kích thước, tránh gọi nhiều lần
                const updateMapSize = () => {
                    if (mapInstanceRef.current) {
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
                            <span className="align-middle">RENTALER PRO</span>
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
                                </div></div></div><div className="row dt-row"><div className="col-sm-12"><table id="datatables-buttons" className="table table-striped dataTable no-footer dtr-inline" style={{ width: "100%" }} aria-describedby="datatables-buttons_info">
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
                                {tableData.map((item) => (
                                    <tr className="odd">
                                        <td className="dtr-control sorting_1" tabindex="0">{item.title}</td>
                                        <td>{item.address}</td>
                                        <td>{item.price && item.price.toLocaleString('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND',
                                        })}</td>
                                        <td style={{ color: "green" }}>{item.status === "ROOM_RENT" || item.status === "CHECKED_OUT" ? "Chưa thuê" : "Đã thuê"}</td>
                                        <td style={{ color: "green" }}>{item.isLocked === "ENABLE" ? "Hiển" : "Ẩn"}</td>
                                        <td style={{ color: "green" }}>{(item.isApprove === false) || (item.isApprove === "false")? "Chưa duyệt" : "Đã duyệt"}</td>

                                        <td>
                                            {
                                                item.isRemove === true ?
                                                    (
                                                        <>
                                                            <span style={{ color: "red" }} data-toggle="tooltip" data-placement="bottom" title="Chi tiết thông tin gỡ ở email của bạn.">Admin gỡ tin</span>
                                                        </>
                                                    )
                                                    :
                                                    (
                                                        <>
                                                            <a href="#" onClick={() => handleEditRoom(item.id)} data-toggle="tooltip" data-placement="bottom" title="Sửa"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit-2 align-middle"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg></a>
                                                            &nbsp;&nbsp;

                                                            &nbsp;
                                                            <a onClick={() => handleSetRoomId(item.id)} data-bs-toggle="modal" data-bs-target=".bd-example-modal-lg" data-toggle="tooltip" data-placement="bottom" title="Xem chi tiết" >
                                                                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" /></svg> </a>
                                                            &nbsp;&nbsp;
                                                            <a href="#" onClick={() => handleDisableRoom(item.id)} data-toggle="tooltip" data-placement="bottom" title="Ẩn phòng"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash align-middle"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></a>

                                                        </>
                                                    )
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
                            <div style={{ margin: "32px 0 0 0" }}>
                                <h5 className="mb-3">Bản đồ các phòng trọ</h5>
                                <RoomMap rooms={tableData} />
                            </div>
                        </div>
                    </div>
                    <div className="modal fade bd-example-modal-lg" tabIndex="-1" role="dialog" aria-labeledby="myLargeModalLabel" aria-hidden="true">
                        <div class="modal-dialog modal-xl">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title" id="exampleModalLabel">Chi tiết bài đăng tin</h5>
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