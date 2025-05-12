import { Navigate, useNavigate } from "react-router-dom";
import Nav from "./Nav";
import SidebarNav from "./SidebarNav";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { getRentOfHome } from "../../services/fetch/ApiUtils";
import { ACCESS_TOKEN } from "../../constants/Connect";
import { translate } from "../../utils/i18n/translate";

// Custom CSS for form styling
const formStyles = `
  .compact-input {
    max-width: 200px;
  }
  .form-section {
    margin-bottom: 2rem;
    padding: 1rem;
    border-radius: 8px;
    background-color: #f8f9fa;
  }
  .form-buttons {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }
  .form-label {
    font-weight: 500;
  }
`;

const AddElectric = (props) => {
  const { authenticated, role, currentUser, location, onLogout } = props;
  const navigate = useNavigate();
  const [roomOptions, setRoomOptions] = useState([]);
  const [errors, setErrors] = useState({});

  const [electricData, setElectricData] = useState({
    name: "",
    month: "",
    lastMonthNumberOfElectric: "",
    thisMonthNumberOfElectric: "",
    lastMonthBlockOfWater: "",
    thisMonthBlockOfWater: "",
    moneyEachNumberOfElectric: "",
    moneyEachBlockOfWater: "",
    roomId: "",
  });

  const validateForm = () => {
    const newErrors = {};
    if (!electricData.name) newErrors.name = "Tên hóa đơn là bắt buộc";
    if (!electricData.month) newErrors.month = "Tháng sử dụng là bắt buộc";
    if (!electricData.lastMonthNumberOfElectric)
      newErrors.lastMonthNumberOfElectric = "Số điện tháng trước là bắt buộc";
    if (!electricData.thisMonthNumberOfElectric)
      newErrors.thisMonthNumberOfElectric = "Số điện tháng này là bắt buộc";
    if (!electricData.moneyEachNumberOfElectric)
      newErrors.moneyEachNumberOfElectric = "Số tiền mỗi số điện là bắt buộc";
    if (!electricData.lastMonthBlockOfWater)
      newErrors.lastMonthBlockOfWater = "Số khối nước tháng trước là bắt buộc";
    if (!electricData.thisMonthBlockOfWater)
      newErrors.thisMonthBlockOfWater = "Số khối nước tháng này là bắt buộc";
    if (!electricData.moneyEachBlockOfWater)
      newErrors.moneyEachBlockOfWater = "Số tiền mỗi khối nước là bắt buộc";
    if (!electricData.roomId) newErrors.roomId = "Phòng là bắt buộc";

    // Validate numeric fields
    const numericFields = [
      "lastMonthNumberOfElectric",
      "thisMonthNumberOfElectric",
      "moneyEachNumberOfElectric",
      "lastMonthBlockOfWater",
      "thisMonthBlockOfWater",
      "moneyEachBlockOfWater",
    ];
    numericFields.forEach((field) => {
      if (
          electricData[field] &&
          (isNaN(electricData[field]) || electricData[field] < 0)
      ) {
        newErrors[field] = "Vui lòng nhập số dương hợp lệ";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setElectricData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    // Clear error for the field when user starts typing
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng điền đầy đủ và đúng thông tin!");
      return;
    }

    const data = {
      name: electricData.name,
      month: electricData.month,
      lastMonthNumberOfElectric: electricData.lastMonthNumberOfElectric,
      thisMonthNumberOfElectric: electricData.thisMonthNumberOfElectric,
      lastMonthBlockOfWater: electricData.lastMonthBlockOfWater,
      thisMonthBlockOfWater: electricData.thisMonthBlockOfWater,
      moneyEachNumberOfElectric: electricData.moneyEachNumberOfElectric,
      moneyEachBlockOfWater: electricData.moneyEachBlockOfWater,
      room: {
        id: electricData.roomId,
      },
    };

    try {
      await axios.post("http://localhost:8080/electric-water/create", data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
        },
      });
      toast.success("Thêm hóa đơn điện nước thành công!");
      setElectricData({
        name: "",
        month: "",
        lastMonthNumberOfElectric: "",
        thisMonthNumberOfElectric: "",
        lastMonthBlockOfWater: "",
        thisMonthBlockOfWater: "",
        moneyEachNumberOfElectric: "",
        moneyEachBlockOfWater: "",
        roomId: "",
      });
      navigate("/rentaler/electric_water-management");
    } catch (error) {
      toast.error(
          (error.response?.data?.message) ||
          "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!"
      );
    }
  };

  useEffect(() => {
    getRentOfHome()
        .then((response) => {
          const room = response.content;
          setRoomOptions(room);
        })
        .catch((error) => {
          toast.error(
              (error && error.message) ||
              "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!"
          );
        });
  }, []);

  if (!authenticated) {
    return (
        <Navigate
            to={{
              pathname: "/login-rentaler",
              state: { from: location },
            }}
        />
    );
  }

  return (
      <>
        <style>{formStyles}</style>
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
                  <h5 className="card-title fs-5">{translate("rentaler:electric_and_water_management:")}</h5>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    {/* Bill Information Section */}
                    <div className="form-section border">
                      <h6 className="text-capitalize fw-semibold bg-light py-2 rounded-2 mb-3">Bill information</h6>
                      <div className="row">
                        <div className="mb-3 col-md-6 col-sm-12">
                          <label className="form-label" htmlFor="name">
                            Bill title
                          </label>
                          <input
                              type="text"
                              className={`form-control ${errors.name ? "is-invalid" : ""}`}
                              id="name"
                              name="name"
                              value={electricData.name}
                              onChange={handleInputChange}
                          />
                          {errors.name && (
                              <div className="invalid-feedback">{errors.name}</div>
                          )}
                        </div>
                        <div className="mb-3 col-md-6 col-sm-12">
                          <label className="form-label" htmlFor="month">
                            Month of use
                          </label>
                          <select
                              className={`form-select ${errors.month ? "is-invalid" : ""}`}
                              id="month"
                              name="month"
                              value={electricData.month}
                              onChange={handleInputChange}
                          >
                            <option value="">Choose...</option>
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                  Month {i + 1}
                                </option>
                            ))}
                          </select>
                          {errors.month && (
                              <div className="invalid-feedback">{errors.month}</div>
                          )}
                        </div>
                      </div>
                      <div className="row">
                        <div className="mb-3 col-md-6 col-sm-12">
                          <label className="form-label" htmlFor="roomId">
                            Choose room
                          </label>
                          <select
                              className={`form-select ${errors.roomId ? "is-invalid" : ""}`}
                              id="roomId"
                              name="roomId"
                              value={electricData.roomId}
                              onChange={handleInputChange}
                          >
                            <option value="">Choose...</option>
                            {roomOptions.map((roomOption) => (
                                <option key={roomOption.id} value={roomOption.id}>
                                  {roomOption.title}
                                </option>
                            ))}
                          </select>
                          {errors.roomId && (
                              <div className="invalid-feedback">{errors.roomId}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Electricity Usage Section */}
                    <div className="form-section border">
                      <h6 className="text-capitalize fw-semibold bg-light py-2 rounded-2 mb-3">Electric bill information</h6>
                      <div className="row">
                        <div className="mb-3 col-md-4 col-sm-6">
                          <label className="form-label" htmlFor="lastMonthNumberOfElectric">
                            Last month electric usage
                          </label>
                          <input
                              type="number"
                              className={`form-control compact-input ${
                                  errors.lastMonthNumberOfElectric ? "is-invalid" : ""
                              }`}
                              id="lastMonthNumberOfElectric"
                              name="lastMonthNumberOfElectric"
                              value={electricData.lastMonthNumberOfElectric}
                              onChange={handleInputChange}
                              min="0"
                              placeholder="0"
                          />
                          {errors.lastMonthNumberOfElectric && (
                              <div className="invalid-feedback">
                                {errors.lastMonthNumberOfElectric}
                              </div>
                          )}
                        </div>
                        <div className="mb-3 col-md-4 col-sm-6">
                          <label className="form-label" htmlFor="thisMonthNumberOfElectric">
                            This month electric usage
                          </label>
                          <input
                              type="number"
                              className={`form-control compact-input ${
                                  errors.thisMonthNumberOfElectric ? "is-invalid" : ""
                              }`}
                              id="thisMonthNumberOfElectric"
                              name="thisMonthNumberOfElectric"
                              value={electricData.thisMonthNumberOfElectric}
                              onChange={handleInputChange}
                              min="0"
                              placeholder="0"
                          />
                          {errors.thisMonthNumberOfElectric && (
                              <div className="invalid-feedback">
                                {errors.thisMonthNumberOfElectric}
                              </div>
                          )}
                        </div>
                        <div className="mb-3 col-md-4 col-sm-6">
                          <label className="form-label" htmlFor="moneyEachNumberOfElectric">
                            Price per electric unit
                          </label>
                          <input
                              type="number"
                              className={`form-control compact-input ${
                                  errors.moneyEachNumberOfElectric ? "is-invalid" : ""
                              }`}
                              id="moneyEachNumberOfElectric"
                              name="moneyEachNumberOfElectric"
                              value={electricData.moneyEachNumberOfElectric}
                              onChange={handleInputChange}
                              min="0"
                              placeholder="0"
                          />
                          {errors.moneyEachNumberOfElectric && (
                              <div className="invalid-feedback">
                                {errors.moneyEachNumberOfElectric}
                              </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Water Usage Section */}
                    <div className="form-section border">
                      <h6 className="text-capitalize fw-semibold bg-light py-2 rounded-2 mb-3">Water bill information</h6>
                      <div className="row">
                        <div className="mb-3 col-md-4 col-sm-6">
                          <label className="form-label" htmlFor="lastMonthBlockOfWater">
                            Last month water usage
                          </label>
                          <input
                              type="number"
                              className={`form-control compact-input ${
                                  errors.lastMonthBlockOfWater ? "is-invalid" : ""
                              }`}
                              id="lastMonthBlockOfWater"
                              name="lastMonthBlockOfWater"
                              value={electricData.lastMonthBlockOfWater}
                              onChange={handleInputChange}
                              min="0"
                              placeholder="0"
                          />
                          {errors.lastMonthBlockOfWater && (
                              <div className="invalid-feedback">
                                {errors.lastMonthBlockOfWater}
                              </div>
                          )}
                        </div>
                        <div className="mb-3 col-md-4 col-sm-6">
                          <label className="form-label" htmlFor="thisMonthBlockOfWater">
                            This month water usage
                          </label>
                          <input
                              type="number"
                              className={`form-control compact-input ${
                                  errors.thisMonthBlockOfWater ? "is-invalid" : ""
                              }`}
                              id="thisMonthBlockOfWater"
                              name="thisMonthBlockOfWater"
                              value={electricData.thisMonthBlockOfWater}
                              onChange={handleInputChange}
                              min="0"
                              placeholder="0"
                          />
                          {errors.thisMonthBlockOfWater && (
                              <div className="invalid-feedback">
                                {errors.thisMonthBlockOfWater}
                              </div>
                          )}
                        </div>
                        <div className="mb-3 col-md-4 col-sm-6">
                          <label className="form-label" htmlFor="moneyEachBlockOfWater">
                            Price per water unit
                          </label>
                          <input
                              type="number"
                              className={`form-control compact-input ${
                                  errors.moneyEachBlockOfWater ? "is-invalid" : ""
                              }`}
                              id="moneyEachBlockOfWater"
                              name="moneyEachBlockOfWater"
                              value={electricData.moneyEachBlockOfWater}
                              onChange={handleInputChange}
                              min="0"
                              placeholder="0"
                          />
                          {errors.moneyEachBlockOfWater && (
                              <div className="invalid-feedback">
                                {errors.moneyEachBlockOfWater}
                              </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Form Buttons */}
                    <div className="form-buttons">
                      <button type="submit" className="btn btn-primary">
                        Save bill
                      </button>
                      <button
                          type="button"
                          className="btn btn-info"
                          onClick={() =>
                              setElectricData({
                                name: "",
                                month: "",
                                lastMonthNumberOfElectric: "",
                                thisMonthNumberOfElectric: "",
                                lastMonthBlockOfWater: "",
                                thisMonthBlockOfWater: "",
                                moneyEachNumberOfElectric: "",
                                moneyEachBlockOfWater: "",
                                roomId: "",
                              })
                          }
                      >
                        Reset
                      </button>
                      <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => navigate("/rentaler/electric_water-management")}>
                            Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
  );
};

export default AddElectric;