import React, { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import SidebarNav from "./SidebarNav";
import Nav from "./Nav";
import { getAllCameras, checkStatusVideo } from "../../services/fetch/ApiUtils";
import { translate } from "../../utils/i18n/translate";

function Playback(props) {
  const { authenticated, role, currentUser, location, onLogout } = props;
  const navigate = useNavigate();
  const [cameras, setCameras] = useState([]);
  const [cameraStatus, setCameraStatus] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authenticated) return;
    setLoading(true);
    getAllCameras()
      .then((data) => {
        setCameras(data);
        setLoading(false);
        // Lấy trạng thái từng camera
        data.forEach((cam) => {
          checkStatusVideo(cam.id).then((status) => {
            setCameraStatus((prev) => ({
              ...prev,
              [cam.id]: status
            }));
          });
        });
      })
      .catch(() => setLoading(false));
  }, [authenticated]);

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
                <h5 className="card-title fs-4 mb-0">{translate("rentaler:playback:cameraList")} - {translate("rentaler:playback:title")}</h5>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center my-5">
                    <div className="spinner-border" role="status"></div>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-bordered align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>{translate("rentaler:playback:camera_name")}</th>
                          <th>IP</th>
                          <th>{translate("rentaler:playback:port")}</th>
                          <th>{translate("rentaler:playback:status")}</th>
                          <th className="text-center">{translate("rentaler:playback:action")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cameras.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center text-muted">
                              Không có camera nào
                            </td>
                          </tr>
                        ) : (
                          cameras.map((cam) => (
                            <tr key={cam.id}>
                              <td>{cam.name}</td>
                              <td>{cam.ip}</td>
                              <td>{cam.port}</td>
                              <td>
                                <span className={`badge ${cameraStatus[cam.id] === true ? "bg-success" : "bg-danger"}`}>
                                  {cameraStatus[cam.id] === true ? "Active" : "Inactive"}
                                </span>
                              </td>
                              <td className="text-center">
                                <button
                                  className="btn btn-outline-primary btn-sm"
                                  onClick={() => navigate(`/rentaler/detail-playback/${cam.id}`)}
                                >
                                  {translate("rentaler:playback:watch_record")}
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
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