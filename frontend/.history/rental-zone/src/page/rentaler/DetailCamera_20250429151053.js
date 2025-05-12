import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { getCameraById, streamCamera, checkStatusVideo } from "../../services/fetch/ApiUtils";
import Nav from "./Nav";
import SidebarNav from "./SidebarNav";
import { toast } from "react-toastify";
import Hls from "hls.js";

function DetailCamera(props) {
  const { authenticated, currentUser, location, onLogout } = props;
  const { id } = useParams();
  const navigate = useNavigate();
  const [camera, setCamera] = useState(null);
  const [streamUrl, setStreamUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const videoRef = React.useRef(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    getCameraById(id)
      .then((data) => {
        setCamera(data);
        setLoading(false);
        // Nếu backend trả về url stream, bạn có thể set ở đây
        // setStreamUrl(data.streamUrl);
      })
      .catch((error) => {
        toast.error("Không thể tải thông tin camera!");
        setLoading(false);
      });

    // Nếu muốn lấy stream trực tiếp (ví dụ trả về MJPEG hoặc HLS)
    // setStreamUrl(`${API_BASE_URL}/cameras/${id}/stream`);
  }, [id]);

  useEffect(() => {
    if (camera && camera.name) {
      const src = `http://localhost:8888/${camera.ip}/index.m3u8`;
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
    }
  }, [camera]);

  useEffect(() => {
    if (camera && camera.id) {
      checkStatusVideo(camera.id).then(setStatus);
    }
  }, [camera]);

  // Cập nhật thời gian mỗi giây
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Hàm format thời gian
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

  const videoBoxStyle = isFullscreen
    ? {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "#222",
        zIndex: 2000,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 0,
      }
    : {
        width: "100%",
        maxWidth: 1200,
        height: "70vh",
        margin: "24px auto",
        background: "#222",
        overflow: "hidden",
        borderRadius: 12,
        position: "relative",
      };

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
                <h5 className="card-title fs-4 mb-0">Camera Detail</h5>
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate("/rentaler/camera-management")}
                >
                  Back
                </button>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center my-5">
                    <div className="spinner-border" role="status"></div>
                  </div>
                ) : camera ? (
                  <>
                    {/* Thông tin chi tiết */}
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <h6 className="fw-bold">Camera name:</h6>
                        <div>{camera.name}</div>
                      </div>
                      <div className="col-md-3">
                        <h6 className="fw-bold">IP Address:</h6>
                        <div>{camera.ip}</div>
                      </div>
                      <div className="col-md-3">
                        <h6 className="fw-bold">Port:</h6>
                        <div>{camera.port}</div>
                      </div>
                      {camera.area && (
                        <div className="col-md-3 mt-3">
                          <h6 className="fw-bold">Area:</h6>
                          <div>{camera.area}</div>
                        </div>
                      )}
                      <div className="col-12 mt-2">
                        <span className={`badge ${status === true ? "bg-success" : "bg-danger"}`}>
                          {status === true ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                    {/* Khung xem camera */}
                    <div
                      className="camera-fullscreen-view d-flex justify-content-center align-items-center"
                      style={{ ...videoBoxStyle, position: "relative" }} // luôn giữ position: "relative"
                    >
                      {camera && camera.name ? (
                        <>
                          <video
                            ref={videoRef}
                            controls
                            autoPlay
                            muted
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                              background: "#000",
                            }}
                            title={camera.name}
                          />
                          {/* Overlay thời gian góc trên trái */}
                          <div
                            style={{
                              position: "absolute",
                              top: 16,
                              left: 24,
                              color: "#fff",
                              background: "rgba(0,0,0,0.5)",
                              padding: "6px 16px",
                              borderRadius: 8,
                              fontWeight: 600,
                              fontSize: 18,
                              letterSpacing: 1,
                              zIndex: 10,
                              pointerEvents: "none",
                              userSelect: "none",
                            }}
                          >
                            {formatDateTime(currentTime)}
                          </div>
                          {/* Overlay tên camera góc phải dưới */}
                          <div
                            style={{
                              position: "absolute",
                              right: 24,
                              bottom: 16,
                              color: "#fff",
                              background: "rgba(0,0,0,0.5)",
                              padding: "6px 20px",
                              borderRadius: 8,
                              fontWeight: 600,
                              fontSize: 20,
                              letterSpacing: 1,
                              zIndex: 10,
                              pointerEvents: "none",
                              userSelect: "none",
                              textAlign: "right",
                              maxWidth: "80%",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {camera.name}
                          </div>
                          {/* Nút phóng to/thu nhỏ */}
                          <button
                            className="btn btn-light"
                            style={{
                              position: "absolute",
                              top: 16,
                              right: 16,
                              zIndex: 20,
                            }}
                            onClick={() => setIsFullscreen(f => !f)}
                          >
                            {isFullscreen ? "Thu nhỏ" : "Phóng to"}
                          </button>
                        </>
                      ) : (
                        <div
                          className="bg-dark text-white-50 d-flex align-items-center justify-content-center"
                          style={{ width: "100%", height: "100%" }}
                        >
                          No stream available
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center text-danger">Không tìm thấy camera!</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .card-body h6 {
          margin-bottom: 0.25rem;
        }
      `}</style>
    </div>
  );
}

export default DetailCamera;