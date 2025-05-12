import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllCameras } from "../../services/fetch/ApiUtils";
import Nav from "./Nav";
import SidebarNav from "./SidebarNav";

function Playback() {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getAllCameras()
      .then((data) => {
        setCameras(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
                  Danh sách Camera - Playback
                </h5>
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
                          <th>Tên camera</th>
                          <th>IP</th>
                          <th>Port</th>
                          <th>Trạng thái</th>
                          <th className="text-center">Ghi hình</th>
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
                                <span className={`badge ${cam.status === true ? "bg-success" : "bg-danger"}`}>
                                  {cam.status === true ? "Active" : "Inactive"}
                                </span>
                              </td>
                              <td className="text-center">
                                <button
                                  className="btn btn-outline-primary btn-sm"
                                  onClick={() => navigate(`/rentaler/playback/${cam.id}`)}
                                >
                                  Xem ghi hình
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