import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import SidebarNav from "./SidebarNav";
import Nav from "./Nav";
import Pagination from "./Pagnation"; // Fixed typo in import
import { toast } from "react-toastify";
import { getAllElectricAndWaterOfRentaler } from "../../services/fetch/ApiUtils";
import { translate } from "../../utils/i18n/translate";

const ElectricAndWaterManagement = (props) => {
  const { authenticated, role, currentUser, location, onLogout } = props;
  const navigate = useNavigate();
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const paginate = (pageNumber) => {
    console.log("Navigating to Page:", pageNumber);
    setCurrentPage(pageNumber);
  };

  const fetchData = () => {
    getAllElectricAndWaterOfRentaler(currentPage, itemsPerPage, searchQuery)
        .then((response) => {
          console.log("response: ", response);
          if (response && response.content) {
            setTableData(response.content);
            setTotalItems(response.page.totalElements);
          } else {
            setTableData([]);
            setTotalItems(0);
          }
        })
        .catch((error) => {
          toast.error(
              (error && error.message) ||
              "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!"
          );
          setTableData([]);
          setTotalItems(0);
        });
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, searchQuery]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleEditElectric = (id) => {
    navigate(`/rentaler/electric_water/edit/${id}`);
  };

  const handleRedirectAddElectric = () => {
    navigate(`/rentaler/electric_water/add`);
  };

  const handleExportBill = (id) => {
    navigate(`/rentaler/electric_water-management/export-bill/${id}`);
  };

  if (!authenticated) {
    return <Navigate to="/login-rentaler" state={{ from: location }} />;
  }

  return (
      <div>
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
            <div className="container-fluid p-0">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title fs-5">{translate("rentaler:electric_and_water_management:title")}</h5>
                  <h6 className="card-subtitle text-muted">
                  {translate("rentaler:electric_and_water_management:subtitle")}
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
                              type="button"
                              onClick={handleRedirectAddElectric}
                          >
                          {translate("rentaler:electric_and_water_management:add_bill")}
                          </button>
                        </div>
                      </div>
                      <div className="col-sm-12 col-md-6">
                        <div
                            id="datatables-buttons_filter"
                            className="dataTables_filter float-end"
                        >
                          <label>
                            {translate("rentaler:search")}:
                            <input
                                type="search"
                                className="form-control form-control-sm float-end fs-6 mb-3"
                                placeholder="Enter name or month"
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
                            <th>{translate("rentaler:electric_and_water_management:bill_title")}</th>
                            <th>Room</th>
                            <th>Month</th>
                            <th>Last month <br/> electric usage</th>
                            <th>This month <br/> electric usage</th>
                            <th>Total <br/> electricity cost</th>
                            <th>Last month <br/> water usage</th>
                            <th>This month <br/> water usage</th>
                            <th>Total <br/> water cost</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                          </thead>
                          <tbody>
                          {tableData.length === 0 ? (
                              <tr>
                                <td colSpan="11" className="text-center">
                                  Không có dữ liệu hóa đơn điện nước.
                                </td>
                              </tr>
                          ) : (
                              tableData.map((item) => (
                                  <tr key={item.id} className="odd">
                                    <td>{item.name}</td>
                                    <td>{item.room?.title}</td>
                                    <td className="dtr-control sorting_1">
                                      Month {item.month}
                                    </td>
                                    <td>{item.lastMonthNumberOfElectric}</td>
                                    <td>{item.thisMonthNumberOfElectric}</td>
                                    <td>{item.lastMonthBlockOfWater}</td>
                                    <td>{item.thisMonthBlockOfWater}</td>
                                    <td>
                                      {item.totalMoneyOfElectric?.toLocaleString("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                      })}
                                    </td>
                                    <td>
                                      {item.totalMoneyOfWater?.toLocaleString("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                      })}
                                    </td>
                                    <td style={{ color: item.paid ? "green" : "red" }}>
                                      {item.paid ? "Đã thanh toán" : "Chưa thanh toán"}
                                    </td>
                                    <td>
                                      <a
                                          href="#"
                                          onClick={() => handleEditElectric(item.id)}
                                          data-toggle="tooltip"
                                          data-placement="bottom"
                                          title="Update bill information"
                                      >
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
                                            className="feather feather-edit-2 align-middle"
                                        >
                                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                                        </svg>
                                      </a>
                                    </td>
                                  </tr>
                              ))
                          )}
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
        </div>
      </div>
  );
};

export default ElectricAndWaterManagement;