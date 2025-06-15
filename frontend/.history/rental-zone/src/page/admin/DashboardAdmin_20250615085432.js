import React, { useEffect, useState, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../../assets/css/app.css";
import "../../assets/css/Sort.css";
import {
  approveRoomOfAdmin,
  getAllRoomApprovingOfAdmin,
  getNumberOfAdmin,
  removeRoomOfAdmin,
  getFinancialStats,
} from "../../services/fetch/ApiUtils";
import ModalRoomDetails from "./modal/ModalRoomDetail";
import Nav from "./Nav";
import Pagination from "./Pagnation";
import SidebarNav from "./SidebarNav";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Chart from "chart.js/auto"; // Thêm Chart.js

const DashboardAdmin = (props) => {
  const { authenticated, roleName, location, currentUser, onLogout } = props;

  const history = useNavigate();
  const [roomId, setRoomId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("");

  const [number, setNumber] = useState({
    numberOfAccount: "",
    numberOfApprove: "",
    numberOfApproving: "",
    numberOfAccountLocked: "",
  });

  const [financialStats, setFinancialStats] = useState(null);

  // Refs for map and charts
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const revenueChartRef = useRef(null);
  const statusChartRef = useRef(null);

  useEffect(() => {
    fetchData();
    fetchFinancialStats();
  }, [currentPage, sortField, sortOrder]);

  const fetchData = () => {
    getAllRoomApprovingOfAdmin(
      currentPage,
      itemsPerPage,
      false,
      sortField,
      sortOrder
    )
      .then((response) => {
        setTableData(response.content);
        setTotalItems(response.page.totalElements);
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
            "Oops! Something went wrong. Please try again!"
        );
      });
  };

  const fetchFinancialStats = () => {
    getFinancialStats(currentPage, itemsPerPage)
      .then((response) => {
        setFinancialStats(response);
        // Cập nhật biểu đồ khi có dữ liệu mới
        updateCharts(response);
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
            "Oops! Something went wrong fetching financial stats!"
        );
      });
  };

  const updateCharts = (data) => {
    const revenueData = [
      data.totalRevenue || 0,
      data.totalAdminFee || 0,
    ];
    const statusCounts = data.statusCounts.map((item) => item.count) || [0, 0, 0];
    const statusLabels = data.statusCounts.map((item) => item.status) || [
      "PENDING",
      "SUCCESS",
      "FAILED",
    ];

    // Cập nhật hoặc tạo biểu đồ Revenue vs Admin Fee
    if (revenueChartRef.current) {
      if (revenueChartRef.current.chart) {
        revenueChartRef.current.chart.destroy();
      }
      revenueChartRef.current.chart = new Chart(revenueChartRef.current, {
        type: "bar",
        data: {
          labels: ["Total Revenue", "Total Admin Fee"],
          datasets: [
            {
              label: "Amount (VND)",
              data: revenueData,
              backgroundColor: ["#36A2EB", "#FF6384"],
              borderColor: ["#36A2EB", "#FF6384"],
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Amount (VND)",
              },
            },
          },
          plugins: {
            legend: {
              position: "top",
            },
            title: {
              display: true,
              text: "Revenue vs Admin Fee",
            },
          },
        },
      });
    }

    // Cập nhật hoặc tạo biểu đồ Transaction Status Distribution
    if (statusChartRef.current) {
      if (statusChartRef.current.chart) {
        statusChartRef.current.chart.destroy();
      }
      statusChartRef.current.chart = new Chart(statusChartRef.current, {
        type: "pie",
        data: {
          labels: statusLabels,
          datasets: [
            {
              data: statusCounts,
              backgroundColor: ["#FFCE56", "#36A2EB", "#FF6384"],
              borderColor: ["#FFCE56", "#36A2EB", "#FF6384"],
              borderWidth: 1,
            },
          ],
        },
        options: {
          plugins: {
            legend: {
              position: "top",
            },
            title: {
              display: true,
              text: "Transaction Status Distribution",
            },
          },
        },
      });
    }
  };

  const handleSetRoomId = (id) => {
    setRoomId(id);
    setShowModal(true);
  };

  const handleSendEmail = (userId) => {
    history("/admin/send-email/" + userId);
  };

  const handleIsApprove = (id) => {
    approveRoomOfAdmin(id)
      .then((response) => {
        toast.success(response.message);
        fetchData();
        fetchFinancialStats(); // Cập nhật thống kê sau khi phê duyệt
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
            "Oops! Something went wrong. Please try again!"
        );
      });
  };

  const handleIsRemove = (id) => {
    removeRoomOfAdmin(id)
      .then((response) => {
        toast.success(response.message);
        fetchData();
        fetchFinancialStats(); // Cập nhật thống kê sau khi xóa
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
            "Oops! Something went wrong. Please try again!"
        );
      });
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    getNumberOfAdmin()
      .then((response) => {
        const number = response;
        setNumber((prevState) => ({
          ...prevState,
          ...number,
        }));
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    // Remove old map if exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    // If no data, do not render map
    if (!tableData || tableData.length === 0) return;

    // Find rooms with valid lat/lng
    const validRooms = tableData.filter(
      (item) =>
        item.latitude &&
        item.longitude &&
        !isNaN(parseFloat(item.latitude)) &&
        !isNaN(parseFloat(item.longitude))
    );

    // If no valid rooms, do not render map
    if (validRooms.length === 0) return;

    // Center of the map (first room or average)
    const center = [
      parseFloat(validRooms[0].latitude),
      parseFloat(validRooms[0].longitude),
    ];

    // Custom house icon
    const houseIcon = L.icon({
      iconUrl: "https://cdn-icons-png.flaticon.com/512/69/69524.png",
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24],
      shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      shadowSize: [30, 30],
      shadowAnchor: [13, 41],
    });

    // Initialize map
    const map = L.map(mapRef.current).setView(center, 12);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '© <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add marker for each room
    validRooms.forEach((item) => {
      const marker = L.marker(
        [parseFloat(item.latitude), parseFloat(item.longitude)],
        { icon: houseIcon }
      ).addTo(map);
      marker.bindPopup(
        `<b>${item.title}</b><br>${item.address || ""}<br>Price: ${
          item.price
            ? item.price.toLocaleString("en-US", {
                style: "currency",
                currency: "VND",
              })
            : ""
        }`
      );
    });

    setTimeout(() => {
      map.invalidateSize();
    }, 300);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [tableData]);

  if (!authenticated) {
    return (
      <Navigate
        to={{
          pathname: "/login-admin",
          state: { from: location },
        }}
      />
    );
  }

  const handleSort = (filter, direction) => {
    setSortField(filter);
    setSortOrder(direction);
  };

  return (
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

        <main style={{ margin: "20px 20px 20px 20px" }}>
          <div className="container-fluid p-0">
            <div className="row mb-2 mb-xl-3">
              <div className="col-auto d-none d-sm-block">
                <h3>
                  <strong>✨</strong> Statistics
                </h3>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-6 col-xl-3">
                <div className="card">
                  <div className="card-body">
                    <div className="row">
                      <div className="col mt-0">
                        <h5 className="card-title">Accounts</h5>
                      </div>
                      <div className="col-auto">
                        <div className="stat text-primary">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="feather feather-dollar-sign align-middle"
                          >
                            <line x1="12" y1="1" x2="12" y2="23"></line>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <h1 className="mt-1 mb-3">{number.numberOfAccount}</h1>
                    <div className="mb-0">
                      <span className="badge badge-success-light">
                        <i className="mdi mdi-arrow-bottom-right"></i> 3.65%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-sm-6 col-xl-3">
                <div className="card">
                  <div className="card-body">
                    <div className="row">
                      <div className="col mt-0">
                        <h5 className="card-title">Approved Posts</h5>
                      </div>
                      <div className="col-auto">
                        <div className="stat text-primary">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="feather feather-shopping-bag align-middle"
                          >
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <h1 className="mt-1 mb-3">{number.numberOfApprove}</h1>
                    <div className="mb-0">
                      <span className="badge badge-danger-light">
                        <i className="mdi mdi-arrow-bottom-right"></i> -5.25%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-sm-6 col-xl-3">
                <div className="card">
                  <div className="card-body">
                    <div className="row">
                      <div className="col mt-0">
                        <h5 className="card-title">Pending Posts</h5>
                      </div>
                      <div className="col-auto">
                        <div className="stat text-primary">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="feather feather-activity align-middle"
                          >
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <h1 className="mt-1 mb-3">{number.numberOfApproving}</h1>
                    <div className="mb-0">
                      <span className="badge badge-success-light">
                        <i className="mdi mdi-arrow-bottom-right"></i> 4.65%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-sm-6 col-xl-3">
                <div className="card">
                  <div className="card-body">
                    <div className="row">
                      <div className="col mt-0">
                        <h5 className="card-title">Total Posts</h5>
                      </div>
                      <div className="col-auto">
                        <div className="stat text-primary">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="feather feather-shopping-cart align-middle"
                          >
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <h1 className="mt-1 mb-3">{number.numberOfAccountLocked}</h1>
                    <div className="mb-0">
                      <span className="badge badge-success-light">
                        <i className="mdi mdi-arrow-bottom-right"></i> 2.35%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Statistics Charts */}
            <div  className="card mt-4 chart-container">
              <div className="card-header">
                <h5 className="card-title">Financial Statistics</h5>
                <h6 className="card-subtitle text-muted">
                  Overview of revenue and transaction status.
                </h6>
              </div>
              <div className="card-body">
                <div className="row">
                  {/* Revenue vs Admin Fee Chart */}
                  <div className="col-md-6">
                    <h6>Revenue vs Admin Fee</h6>
                    <canvas  className="chart-canvas" ref={revenueChartRef} />
                  </div>

                  {/* Transaction Status Distribution Chart */}
                  <div className="col-md-6">
                    <h6>Transaction Status Distribution</h6>
                    <canvas style={"height:200px"} className="chart-canvas" ref={statusChartRef} />
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h5 className="card-title">Unapproved Posts and Rooms</h5>
                <h6 className="card-subtitle text-muted">
                  Manage all room and post functions efficiently.
                </h6>
              </div>
              <div className="card-body">
                <div
                  id="datatables-buttons_wrapper"
                  className="dataTables_wrapper dt-bootstrap5 no-footer"
                >
                  <div className="row">
                    <div className="col-sm-12 col-md-6">
                      <div className="dt-buttons btn-group flex-wrap"></div>
                    </div>
                    <div className="col-sm-12 col-md-6">
                      <div
                        id="datatables-buttons_filter"
                        className="dataTables_filter"
                      ></div>
                    </div>
                  </div>
                  <div className="row dt-row">
                    <div className="col-sm-12">
                      <table
                        id="datatables-buttons"
                        className="table table-striped dataTable no-footer dtr-inline"
                        style={{ width: "100%" }}
                        aria-describedby="datatables-buttons_info"
                      >
                        <thead>
                          <tr>
                            <th
                              className="sorting"
                              data-sort="room"
                              tabIndex="0"
                              aria-controls="datatables-buttons"
                              rowSpan="1"
                              colSpan="1"
                              style={{ width: "100px" }}
                            >
                              Room Name
                            </th>
                            <th
                              className="sorting"
                              tabIndex="0"
                              aria-controls="datatables-buttons"
                              rowSpan="1"
                              colSpan="1"
                              style={{ width: "100px" }}
                            >
                              Post Type
                            </th>
                            <th
                              className="sorting"
                              tabIndex="0"
                              aria-controls="datatables-buttons"
                              rowSpan="1"
                              colSpan="1"
                              style={{ width: "100px" }}
                            >
                              Description
                            </th>
                            <th
                              className="sorting"
                              tabIndex="0"
                              aria-controls="datatables-buttons"
                              rowSpan="1"
                              colSpan="1"
                              style={{ width: "246px" }}
                            >
                              Address
                            </th>
                            <th
                              className="sorting"
                              tabIndex="0"
                              aria-controls="datatables-buttons"
                              rowSpan="1"
                              colSpan="1"
                              style={{ width: "75px" }}
                              onClick={() =>
                                handleSort(
                                  "price",
                                  sortOrder === "asc" ? "desc" : "asc"
                                )
                              }
                            >
                              Price
                              <span className="sort-icon">
                                <i className="fas fa-sort-up"></i>
                                <i className="fas fa-sort-down"></i>
                              </span>
                            </th>
                            <th
                              className="sorting"
                              tabIndex="0"
                              aria-controls="datatables-buttons"
                              rowSpan="1"
                              colSpan="1"
                              style={{ width: "100px" }}
                              onClick={() =>
                                handleSort(
                                  "status",
                                  sortOrder === "asc" ? "desc" : "asc"
                                )
                              }
                            >
                              Status
                              <span className="sort-icon">
                                <i className="fas fa-sort-up"></i>
                                <i className="fas fa-sort-down"></i>
                              </span>
                            </th>
                            <th
                              className="sorting"
                              tabIndex="0"
                              aria-controls="datatables-buttons"
                              rowSpan="1"
                              colSpan="1"
                              style={{ width: "110px" }}
                            >
                              Approve
                            </th>
                            <th
                              className="sorting"
                              tabIndex="0"
                              aria-controls="datatables-buttons"
                              rowSpan="1"
                              colSpan="1"
                              style={{ width: "110px" }}
                            >
                              Remove
                            </th>
                            <th
                              className="sorting"
                              tabIndex="0"
                              aria-controls="datatables-buttons"
                              rowSpan="1"
                              colSpan="1"
                              style={{ width: "54px" }}
                            ></th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableData.map((item) => (
                            <tr className="odd" key={item.id}>
                              <td
                                className="dtr-control sorting_1"
                                tabIndex="0"
                              >
                                {item.title}
                              </td>
                              <td>
                                {item.roomType === "REGULAR" ? (
                                  <span className="bg-warning text-light p-1 rounded">
                                    Regular
                                  </span>
                                ) : (
                                  <span className="bg-danger text-light p-1 rounded">
                                    VIP
                                  </span>
                                )}
                              </td>
                              <td>{item.description}</td>
                              <td>{item.address}</td>
                              <td>
                                <span className="bg-primary text-light p-1 rounded">
                                  {item.price &&
                                    item.price.toLocaleString("en-US", {
                                      style: "currency",
                                      currency: "VND",
                                    })}
                                </span>
                              </td>
                              <td style={{ color: "green" }}>
                                {item.status === "ROOM_RENT" ||
                                item.status === "CHECKED_OUT"
                                  ? "Available"
                                  : "Rented"}
                              </td>
                              <td style={{ color: "green" }}>
                                <button
                                  type="button"
                                  className="btn btn-outline-success"
                                  onClick={() => handleIsApprove(item.id)}
                                >
                                  {(item.isApprove === false) |
                                  (item.isApprove === "false")
                                    ? "Approve"
                                    : "Approved"}
                                </button>
                              </td>
                              <td style={{ color: "green" }}>
                                <button
                                  type="button"
                                  className="btn btn-outline-danger"
                                  onClick={() => handleIsRemove(item.id)}
                                >
                                  {item.isRemove === false ? "Remove" : "Removed"}
                                </button>
                              </td>
                              <td>
                                <a
                                  href="#"
                                  onClick={() => handleSendEmail(item.user.id)}
                                  data-toggle="tooltip"
                                  data-placement="bottom"
                                  title="Send email"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    height="1em"
                                    viewBox="0 0 512 512"
                                  >
                                    <path d="M64 112c-8.8 0-16 7.2-16 16v22.1L220.5 291.7c20.7 17 50.4 17 71.1 0L464 150.1V128c0-8.8-7.2-16-16-16H64zM48 212.2V384c0 8.8 7.2 16 16 16H448c8.8 0 16-7.2 16-16V212.2L322 328.8c-38.4 31.5-93.7 31.5-132 0L48 212.2zM0 128C0 92.7 28.7 64 64 64H448c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128z" />
                                  </svg>
                                </a>
                                 
                                <a
                                  onClick={() => handleSetRoomId(item.id)}
                                  data-bs-toggle="modal"
                                  data-bs-target="#exampleModal"
                                  data-toggle="tooltip"
                                  data-placement="bottom"
                                  title="View details"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    height="1em"
                                    viewBox="0 0 512 512"
                                  >
                                    <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" />
                                  </svg>{" "}
                                </a>
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
            {showModal && (
              <div
                className="modal fade show"
                id="exampleModal"
                tabIndex="-1"
                style={{ display: "block" }}
                aria-modal="true"
                role="dialog"
              >
                <div className="modal-dialog modal-xl">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Room Details</h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setShowModal(false)}
                      ></button>
                    </div>
                    <div
                      className="modal-body"
                      style={{ maxHeight: "70vh", overflowY: "auto" }}
                    >
                      <ModalRoomDetails roomId={roomId} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div style={{ margin: "32px 0 0 0" }}>
              <h5 className="mb-3">Map of rooms pending approval</h5>
              <div
                ref={mapRef}
                style={{
                  width: "100%",
                  height: "400px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                }}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardAdmin;