import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { getCameraById } from "../../services/fetch/ApiUtils";
import Nav from "./Nav";
import SidebarNav from "./SidebarNav";
import { toast } from "react-toastify";
import Hls from "hls.js";

function DetailCamera(props) {
  const { authenticated, currentUser, location, onLogout } = props;
  const { id } = useParams();
  const navigate = useNavigate();
  const [camera, setCamera] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = React.useRef(null);

  useEffect(() => {
    getCameraById(id)
      .then((data) => {
        setCamera(data);
        setLoading(false);
      })
      .catch((error) => {
        toast.error("Không thể tải thông tin camera!");
        setLoading(false);
      });
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

  // Style cho khung video
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
                    </div>
                    {/* Khung xem camera */}
                    <div
                      className="camera-fullscreen-view d-flex justify-content-center align-items-center"
                      style={videoBoxStyle}
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
                          <button
                            className="btn btn-light"
                            style={{
                              position: "absolute",
                              top: 16,
                              right: 16,
                              zIndex: 10,
                            }}
                            onClick={() => setIsFullscreen((f) => !f)}
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