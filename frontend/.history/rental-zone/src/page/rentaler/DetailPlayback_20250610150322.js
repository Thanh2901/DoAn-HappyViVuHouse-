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
  const [videoError, setVideoError] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const videoRef = useRef(null);

  // Lấy host từ biến môi trường
  const minioHost = process.env.REACT_APP_MINIO_HOST || "http://localhost:9000";

  useEffect(() => {
    setLoading(true);
    getCameraById(id).then(setCamera);
    getCameraRecords(id)
      .then((data) => {
        console.log("Records data:", data);
        // Debug: Log từng record để xem structure
        if (data.length > 0) {
          console.log("First record structure:", data[0]);
          console.log("First record keys:", Object.keys(data[0]));
        }
        setRecords(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching records:", error);
        setLoading(false);
      });
  }, [id]);

  // Hàm kiểm tra URL có accessible không
  const checkVideoUrl = async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error("URL check failed:", error);
      return false;
    }
  };

  useEffect(() => {
    if (selectedRecord && videoRef.current) {
      setVideoError(null);
      setVideoLoading(true);
      
      // Debug: Log toàn bộ selectedRecord object
      console.log("Selected Record Object:", selectedRecord);
      console.log("Available properties:", Object.keys(selectedRecord));
      
      const videoUrl = selectedRecord.url || selectedRecord.filePath || selectedRecord.path || selectedRecord.fileName || "";
      
      console.log("Extracted videoUrl:", videoUrl);
      
      if (!videoUrl) {
        setVideoError("Video URL not found in record data. Check API response structure.");
        setVideoLoading(false);
        return;
      }
      
      // Thử nhiều cách tạo URL
      const possibleUrls = [
        `${minioHost}/${videoUrl}`, // URL hiện tại
        `${minioHost}/api/v1/download/${videoUrl}`, // Có thể cần API endpoint
        videoUrl.startsWith('http') ? videoUrl : `${minioHost}/${videoUrl}`, // URL đầy đủ
      ];

      console.log("Trying URLs:", possibleUrls);

      // Thử từng URL
      const tryUrls = async () => {
        for (const url of possibleUrls) {
          console.log("Checking URL:", url);
          const isAccessible = await checkVideoUrl(url);
          if (isAccessible) {
            console.log("Success with URL:", url);
            videoRef.current.src = url;
            videoRef.current.load();
            setVideoLoading(false);
            return;
          }
        }
        
        // Nếu tất cả URL đều fail
        setVideoError("Cannot access video file. Please check MinIO configuration.");
        setVideoLoading(false);
      };

      tryUrls();
    }
  }, [selectedRecord, minioHost]);

  const handleVideoError = (e) => {
    const error = e.target.error;
    let errorMessage = "Unknown video error";
    
    switch (error?.code) {
      case 1:
        errorMessage = "Video loading aborted";
        break;
      case 2:
        errorMessage = "Network error occurred";
        break;
      case 3:
        errorMessage = "Video decoding failed";
        break;
      case 4:
        errorMessage = "Video format not supported or file not found";
        break;
    }
    
    console.error("Video error:", error);
    setVideoError(errorMessage);
    setVideoLoading(false);
  };

  const handleVideoLoadStart = () => {
    setVideoLoading(true);
    setVideoError(null);
  };

  const handleVideoCanPlay = () => {
    setVideoLoading(false);
  };

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
                            className={`list-group-item list-group-item-action ${
                              selectedRecord && selectedRecord.id === rec.id
                                ? "active"
                                : ""
                            }`}
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
                          {videoLoading && (
                            <div className="text-center mb-3">
                              <div className="spinner-border spinner-border-sm" role="status">
                                <span className="visually-hidden">Loading video...</span>
                              </div>
                              <span className="ms-2">Loading video...</span>
                            </div>
                          )}
                          
                          {videoError ? (
                            <div className="alert alert-danger" role="alert">
                              <strong>Video Error:</strong> {videoError}
                              <br />
                              <small>URL: {selectedRecord.url || selectedRecord.filePath}</small>
                            </div>
                          ) : (
                            <video
                              ref={videoRef}
                              controls
                              muted
                              onError={handleVideoError}
                              onLoadStart={handleVideoLoadStart}
                              onCanPlay={handleVideoCanPlay}
                              style={{
                                width: "100%",
                                height: 400,
                                background: "#000",
                                borderRadius: 12,
                              }}
                            />
                          )}
                          
                          <div className="mt-2 text-center">
                            <span className="fw-bold">
                              {selectedRecord.startTime
                                ? new Date(selectedRecord.startTime).toLocaleString()
                                : ""}
                            </span>
                          </div>
                          
                          {/* Debug info - Hiển thị tất cả properties của record */}
                          <div className="mt-2">
                            <small className="text-muted">
                              <strong>Debug Info:</strong><br/>
                              URL: {selectedRecord.url || 'N/A'}<br/>
                              FilePath: {selectedRecord.filePath || 'N/A'}<br/>
                              Path: {selectedRecord.path || 'N/A'}<br/>
                              FileName: {selectedRecord.fileName || 'N/A'}<br/>
                              All properties: {JSON.stringify(Object.keys(selectedRecord))}
                            </small>
                          </div>
                        </div>
                      ) : (
                        <div className="text-muted mt-5">
                          Choose a recording from the list to view.
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