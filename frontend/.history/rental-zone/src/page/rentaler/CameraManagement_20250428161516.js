import React, { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import SidebarNav from "./SidebarNav";
import Nav from "./Nav";
import { toast } from "react-toastify";
import {
  getAllCameras,
  getCameraFrame,
  deleteCamera, // Bạn cần thêm hàm này vào ApiUtils nếu muốn xóa camera
} from "../../services/fetch/ApiUtils";

function CameraManagement(props) {
  const { authenticated, role, currentUser, location, onLogout } = props;
  const navigate = useNavigate();
  const [cameras, setCameras] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Lấy danh sách camera
  const fetchCameras = () => {
    setLoading(true);
    getAllCameras()
      .then((data) => {
        setCameras(data);
        setLoading(false);
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
            "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!"
        );
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCameras();
  }, []);

  // Lọc camera theo tên hoặc khu vực
  const filteredCameras = cameras.filter(
    (cam) =>
      cam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cam.area && cam.area.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Gom nhóm camera theo khu vực (area)
  const groupedByArea = filteredCameras.reduce((groups, cam) => {
    const area = cam.area || "Other";
    if (!groups[area]) groups[area] = [];
    groups[area].push(cam);
    return groups;
  }, {});

  // Xử lý xóa camera
  const handleDeleteCamera = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa camera này?")) {
      deleteCamera(id)
        .then(() => {
          toast.success("Xóa camera thành công!");
          fetchCameras();
        })
        .catch((error) => {
          toast.error(
            (error && error.message) ||
              "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!"
          );
        });
    }
  };

  // Xử lý xem stream
  const handleViewStream = (id) => {
    navigate(`/rentaler/camera/stream/${id}`);
  };

  // Xử lý xem chi tiết
  const handleViewDetail = (id) => {
    navigate(`/rentaler/camera/detail/${id}`);
  };

  // Xử lý chỉnh sửa
  const handleEditCamera = (id) => {
    navigate(`/rentaler/camera/edit/${id}`);
  };

  // Xử lý thêm mới
  const handleAddCamera = () => {
    navigate(`/rentaler/camera/add`);
  };

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
              <div className="card-header d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="card-title fs-3 mb-0">Camera Management</h5>
                  <h6 className="card-subtitle text-muted mt-3">
                    Manage and monitor all cameras in your system.
                  </h6>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={handleAddCamera}
                >
                  + Add Camera
                </button>
              </div>
              <div className="card-body">
                <div className="mb-3 d-flex justify-content-end">
                  <input
                    type="search"
                    className="form-control w-25"
                    placeholder="Search by name or area"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {loading ? (
                  <div className="text-center my-5">
                    <div className="spinner-border" role="status"></div>
                  </div>
                ) : (
                  Object.keys(groupedByArea).length === 0 ? (
                    <div className="text-center text-muted py-5">
                      No cameras found.
                    </div>
                  ) : (
                    Object.keys(groupedByArea).map((area) => (
                      <div key={area} className="mb-5">
                        <h5 className="fw-bold mb-3">{area}</h5>
                        <div className="row">
                          {groupedByArea[area].map((cam) => (
                            <div className="col-md-4 mb-4" key={cam.id}>
                              <div className="card shadow-sm h-100">
                                <div className="card-img-top bg-dark d-flex align-items-center justify-content-center" style={{height: 180, overflow: 'hidden'}}>
                                  {/* Hiển thị frame camera nếu có */}
                                  {cam.frameUrl ? (
                                    <img
                                      src={cam.frameUrl}
                                      alt={cam.name}
                                      style={{ width: "100%", objectFit: "cover", minHeight: 180 }}
                                    />
                                  ) : (
                                    <div className="text-white-50">No preview</div>
                                  )}
                                </div>
                                <div className="card-body">
                                  <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="fw-semibold">{cam.name}</span>
                                    <span className="badge bg-secondary">{cam.ip}:{cam.port}</span>
                                  </div>
                                  <div className="d-flex justify-content-between">
                                    <button
                                      className="btn btn-outline-primary btn-sm"
                                      onClick={() => handleViewStream(cam.id)}
                                    >
                                      <i className="bi bi-play-circle"></i> Stream
                                    </button>
                                    <button
                                      className="btn btn-outline-info btn-sm"
                                      onClick={() => handleViewDetail(cam.id)}
                                    >
                                      <i className="bi bi-info-circle"></i> Detail
                                    </button>
                                    <button
                                      className="btn btn-outline-warning btn-sm"
                                      onClick={() => handleEditCamera(cam.id)}
                                    >
                                      <i className="bi bi-pencil"></i> Edit
                                    </button>
                                    <button
                                      className="btn btn-outline-danger btn-sm"
                                      onClick={() => handleDeleteCamera(cam.id)}
                                    >
                                      <i className="bi bi-trash"></i> Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Custom CSS for grid layout */}
      <style>{`
        .card-img-top img {
          object-fit: cover;
          width: 100%;
          height: 180px;
        }
      `}</style>
    </div>
  );
}

export default CameraManagement;