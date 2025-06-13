import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCameraById, getCameraRecords } from "../../services/fetch/ApiUtils";
import SidebarNav from "./SidebarNav";
import Nav from "./Nav";

function DetailPlayback(props) {
  const { authenticated, currentUser, onLogout } = props;
  const { id } = useParams(); // camera id
  const navigate = useNavigate();
  const [camera, setCamera] = useState(null);
  const [records, setRecords] = useState([]);
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

  useEffect(() => {
    if (selectedRecord && videoRef.current) {
      videoRef.current.src = selectedRecord.url || selectedRecord.filePath || "";
      videoRef.current.load();
    }
  }, [selectedRecord]);

  return (
    <div>
      <div className="wrapper">
        <nav id="sidebar" className="sidebar js-sidebar">
          <div className="sidebar-content js-simplebar">
            <a className="sidebar-brand" href="/rentaler">
              <span className="align-middle">LANDLORD PRO</span>
            </a>
            <SidebarNav />
          </div>
        </nav>
        <div className="main">
          <Nav onLogout={onLogout} currentUser={currentUser} />
          <div className="container-fluid p-0">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title fs-4 mb-0">
                  Record - {camera ? camera.name : ""}
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
                    No record for this camera yet.
                  </div>
                ) : (
                  <div className="row">
                    <div className="col-md-4">
                      <h6 className="fw-bold mb-3">Recording list</h6>
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
                              : "Không rõ thời gian"}
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

export default DetailPlayback;