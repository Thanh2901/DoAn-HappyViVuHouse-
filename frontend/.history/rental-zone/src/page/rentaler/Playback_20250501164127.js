import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCameraRecords, getCameraById } from "../../services/fetch/ApiUtils";
import Hls from "hls.js";
import Nav from "./Nav";
import SidebarNav from "./SidebarNav";

function Playback() {
  const { id } = useParams(); // camera id
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [camera, setCamera] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    getCameraById(id).then(setCamera);
    getCameraRecords(id)
      .then((data) => {
        setRecords(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  // Phát lại video record (giả sử record có trường url hoặc filePath)
  useEffect(() => {
    if (selectedRecord && videoRef.current) {
      const src = selectedRecord.url || selectedRecord.filePath;
      let hls;
      if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = src;
      } else if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(videoRef.current);
      }
      return () => {
        if (hls) hls.destroy();
      };
    }
  }, [selectedRecord]);

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
          <Nav />
          <div className="container-fluid p-0">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title fs-4 mb-0">
                  Playback - {camera ? camera.name : "Loading..."}
                </h5>
                <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                  Back
                </button>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center my-5">
                    <div className="spinner-border" role="status"></div>
                  </div>
                ) : records.length === 0 ? (
                  <div className="text-center text-muted py-5">
                    No recordings found for this camera.
                  </div>
                ) : (
                  <div className="row">
                    <div className="col-md-4">
                      <h6 className="fw-bold mb-3">Recordings</h6>
                      <ul className="list-group">
                        {records.map((rec) => (
                          <li
                            key={rec.id}
                            className={`list-group-item list-group-item-action ${selectedRecord && selectedRecord.id === rec.id ? "active" : ""}`}
                            style={{ cursor: "pointer" }}
                            onClick={() => setSelectedRecord(rec)}
                          >
                            {rec.startTime
                              ? new Date(rec.startTime).toLocaleString()
                              : "Unknown time"}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="col-md-8 d-flex flex-column align-items-center">
                      {selectedRecord ? (
                        <div style={{ width: "100%", maxWidth: 800 }}>
                          <video
                            ref={videoRef}
                            controls
                            autoPlay
                            style={{
                              width: "100%",
                              height: 400,
                              background: "#000",
                              borderRadius: 12,
                            }}
                          />
                          <div className="mt-2 text-center">
                            <span className="fw-bold">
                              {selectedRecord.startTime
                                ? new Date(selectedRecord.startTime).toLocaleString()
                                : ""}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-muted mt-5">
                          Chọn một bản ghi để phát lại
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Playback;