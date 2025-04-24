import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../../assets/css/Sort.css";
import {
  deleteMaintenance,
  getAllMaintenceOfRentaler,
} from "../../services/fetch/ApiUtils";
import Nav from "./Nav";
import Pagination from "./Pagnation";
import SidebarNav from "./SidebarNav";
function MaintenceManagement(props) {
  const { authenticated, role, currentUser, location, onLogout } = props;
  const history = useNavigate();

  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  // Fetch data from the API
  useEffect(() => {
    fetchData();
  }, [currentPage, searchQuery, sortField, sortOrder]);

  const fetchData = () => {
    getAllMaintenceOfRentaler(
      currentPage,
      itemsPerPage,
      searchQuery,
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
            "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!"
        );
      });
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleRedirectAddMaintenance = () => {
    history("/rentaler/add-maintenance");
  };

  const handleEditMaintenance = (id) => {
    history("/rentaler/edit-maintenance/" + id);
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDeleteMaintenance = (id) => {
    deleteMaintenance(id)
      .then((response) => {
        console.log(response.message);
        toast.success("Xóa phiếu bảo trì thành công");
        fetchData();
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
            "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!"
        );
      });
  };

  if (!props.authenticated) {
    return (
      <Navigate
        to={{
          pathname: "/login-rentaler",
          state: { from: location },
        }}
      />
    );
  }

  const handleSort = (field, order) => {
    setSortField(field);
    setSortOrder(order);
  };

  return (
    <>
      <div className="wrapper">
        <nav id="sidebar" className="sidebar js-sidebar">
          <div className="sidebar-content js-simplebar">
            <a className="sidebar-brand" href="index.html">
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
              <h5 className="card-title fs-5">Maintenance management</h5>
              <h6 className="card-subtitle text-muted">
                {" "}
                Quản lý bảo trì của phòng trọ.
              </h6>
            </div>
            <div className="card-body">
              <div
                id="datatables-buttons_wrapper"
                className="dataTables_wrapper dt-bootstrap5 no-footer"
              >
                <div className="row">
                  <div className="col-sm-12 col-md-6">
                    <div className="dt-buttons btn-group flex-wrap">
                      <button
                        className="btn btn-secondary buttons-copy buttons-html5"
                        tabindex="0"
                        aria-controls="datatables-buttons"
                        type="button"
                      >
                        <a onClick={handleRedirectAddMaintenance}>
                          Thêm Phiếu Bảo Trì
                        </a>
                      </button>
                    </div>
                  </div>
                  <div className="col-sm-12 col-md-6">
                    <div
                      id="datatables-buttons_filter"
                      className="dataTables_filter float-end mb-3"
                    >
                      <label>
                        Search:
                        <input
                          type="search"
                          className="form-control form-control-sm float-end fs-6"
                          placeholder="Enter name"
                          aria-controls="datatables-buttons"
                          value={searchQuery}
                          onChange={handleSearch}
                        />
                      </label>
                    </div>
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
                            className="sorting sorting_asc"
                            tabindex="0"
                            aria-controls="datatables-buttons"
                            rowspan="1"
                            colspan="1"
                            style={{ width: "224px" }}
                          >
                            Tên Phòng
                          </th>
                          <th
                            className="sorting"
                            tabindex="0"
                            aria-controls="datatables-buttons"
                            rowspan="1"
                            colspan="1"
                            style={{ width: "180px" }}
                          >
                            Địa Chỉ
                          </th>
                          <th
                            className="sorting"
                            tabindex="0"
                            aria-controls="datatables-buttons"
                            rowspan="1"
                            colspan="1"
                            style={{ width: "166px" }}
                          >
                            Phiếu bảo trì
                          </th>
                          <th
                            className="sorting"
                            tabindex="0"
                            aria-controls="datatables-buttons"
                            rowspan="1"
                            colspan="1"
                            style={{ width: "90px" }}
                            onClick={() =>
                              handleSort(
                                "price",
                                sortOrder === "asc" ? "desc" : "asc"
                              )
                            }
                          >
                            Chi phí
                            <span className="sort-icon">
                              <i className="fas fa-sort-up"></i>
                              <i className="fas fa-sort-down"></i>
                            </span>
                          </th>
                          <th
                            className="sorting"
                            tabindex="0"
                            aria-controls="datatables-buttons"
                            rowspan="1"
                            colspan="1"
                            style={{ width: "142px" }}
                            onClick={() =>
                              handleSort(
                                "time",
                                sortOrder === "asc" ? "desc" : "asc"
                              )
                            }
                          >
                            Thời gian
                            <span className="sort-icon">
                              <i className="fas fa-sort-up"></i>
                              <i className="fas fa-sort-down"></i>
                            </span>
                          </th>
                          <th
                            className="sorting"
                            tabindex="0"
                            aria-controls="datatables-buttons"
                            rowspan="1"
                            colspan="1"
                            style={{ width: "75px" }}
                          >
                            Chế độ
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.map((item) => (
                          <tr className="odd">
                            <td className="dtr-control sorting_1" tabindex="0">
                              {item.room.title}
                            </td>
                            <td>{item.room.address}</td>
                            <td>
                              <button
                                type="button"
                                class="btn btn-outline-success"
                              >
                                <a
                                  href={
                                    item.files === null
                                      ? ""
                                      : `` +
                                        item.files.replace(
                                          "photographer/files/",
                                          ""
                                        )
                                  }
                                  target="_blank"
                                >
                                  Xem
                                </a>
                              </button>
                            </td>
                            <td>
                              {item.price &&
                                item.price.toLocaleString("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                })}
                            </td>
                            <td>
                              {item.maintenanceDate &&
                                new Date(
                                  item.maintenanceDate
                                ).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                })}
                            </td>
                            <td>
                              <a
                                href="#"
                                onClick={() => handleEditMaintenance(item.id)}
                                data-toggle="tooltip"
                                tabindex="0"
                                data-placement="bottom"
                                title="Sửa"
                                className="mx-1"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  class="feather feather-edit-2 align-middle"
                                >
                                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                                </svg>
                              </a>
                              &nbsp;
                              <a
                                href="#"
                                onClick={() => handleDeleteMaintenance(item.id)}
                                data-toggle="tooltip"
                                tabindex="0"
                                data-placement="bottom"
                                title="Xóa"
                                className="mx-1"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  class="feather feather-trash align-middle"
                                >
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
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
        </div>
      </div>
    </>
  );
}

export default MaintenceManagement;
