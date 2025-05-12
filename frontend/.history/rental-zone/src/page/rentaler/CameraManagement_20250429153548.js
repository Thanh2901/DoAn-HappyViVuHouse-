import React, { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import SidebarNav from "./SidebarNav";
import Nav from "./Nav";
import { toast } from "react-toastify";
import {
  getAllCameras,
  deleteCamera,
  checkStatusVideo,
} from "../../services/fetch/ApiUtils";
import Hls from "hls.js";

function CameraPreview({ src, camName }) {
  const videoRef = React.useRef(null);
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    let hls;
    if (videoRef.current) {
      if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = src;
      } else if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(videoRef.current);
      }
    }
    return () => {
      if (hls) hls.destroy();
    };
  }, [src]);

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date) => {
    const days = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
    const day = days[date.getDay()];
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${day}, ${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
  };

  return (
    <div style={{ position: "relative", width: "100%", height: 180 }}>
      <video
        ref={videoRef}
        controls={false}
        autoPlay
        muted
        loop
        style={{ width: "100%", height: 180, objectFit: "cover", background: "#000" }}
        title={camName}
      />
      {/* Overlay ngày giờ góc trên trái */}
      <div
        style={{
          position: "absolute",
          top: 8,
          left: 12,
          color: "#fff",
          background: "rgba(0,0,0,0.5)",
          padding: "2px 10px",
          borderRadius: 6,
          fontWeight: 500,
          fontSize: 13,
          letterSpacing: 1,
          zIndex: 10,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {formatDateTime(currentTime)}
      </div>
    </div>
  );
}

function CameraManagement(props) {
  const { authenticated, role, currentUser, location, onLogout } = props;
  const navigate = useNavigate();
  const [cameras, setCameras] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [cameraStatus, setCameraStatus] = useState({});

  // Lấy danh sách camera
  const fetchCameras = () => {
    setLoading(true);
    getAllCameras()
      .then((data) => {
        setCameras(data);
        setLoading(false);
        // Gọi checkStatusVideo cho từng camera
        data.forEach((cam) => {
          checkStatusVideo(cam.id).then((status) => {
            setCameraStatus((prev) => ({
              ...prev,
              [cam.id]: status
            }));
          });
        });
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
                                  <CameraPreview src={`http://localhost:8888/${cam.ip}/index.m3u8`} camName={cam.name} />
                                </div>
                                <div className="card-body">
                                  <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="fw-semibold">{cam.name}</span>
                                    <span className="badge bg-secondary">{cam.ip}:{cam.port}</span>
                                  </div>
                                  <div className="mb-2">
                                    <span className={`fs-6badge ${cameraStatus[cam.id] === true ? "bg-success" : "bg-danger"}`}>
                                      {cameraStatus[cam.id] === true ? "Active" : "Inactive"}
                                    </span>
                                  </div>
                                  <div className="d-flex justify-content-between">
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