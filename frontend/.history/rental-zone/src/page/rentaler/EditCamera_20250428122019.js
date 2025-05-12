import { Navigate, useParams, useNavigate } from 'react-router-dom';
import Nav from './Nav';
import SidebarNav from './SidebarNav';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getCameraById, updateCamera } from '../../services/fetch/ApiUtils';

function EditCamera(props) {
  const { authenticated, role, currentUser, location, onLogout } = props;
  const { id } = useParams();
  const navigate = useNavigate();

  const [cameraData, setCameraData] = useState({
    name: '',
    ip: '',
    port: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getCameraById(id)
      .then((data) => {
        setCameraData({
          name: data.name || '',
          ip: data.ip || '',
          port: data.port || ''
        });
      })
      .catch((error) => {
        toast.error((error && error.message) || 'Không thể tải thông tin camera!');
      });
  }, [id]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setCameraData((prev) => ({
      ...prev,
      [name]: value
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!cameraData.name) newErrors.name = "Tên camera là bắt buộc";
    if (!cameraData.ip) newErrors.ip = "IP là bắt buộc";
    if (!cameraData.port) newErrors.port = "Port là bắt buộc";
    else if (isNaN(cameraData.port) || Number(cameraData.port) <= 0) newErrors.port = "Port phải là số dương";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validateForm()) {
      toast.error("Vui lòng điền đầy đủ và đúng thông tin!");
      return;
    }
    updateCamera(id, {
      name: cameraData.name,
      ip: cameraData.ip,
      port: Number(cameraData.port)
    })
      .then(() => {
        toast.success("Cập nhật camera thành công!");
        navigate('/rentaler/camera-management');
      })
      .catch((error) => {
        toast.error((error && error.message) || 'Cập nhật thất bại!');
      });
  };

  if (!authenticated) {
    return (
      <Navigate
        to={{
          pathname: "/login-rentaler",
          state: { from: location }
        }}
      />
    );
  }

  return (
    <>
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
                <h5 className="card-title fs-5">Edit Camera</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="form-section border">
                    <h6 className="text-capitalize fw-semibold bg-light py-2 rounded-2 mb-3 p-2">Camera information</h6>
                    <div className="row">
                      <div className="mb-3 col-md-4 col-sm-12">
                        <label className="form-labe p-2" htmlFor="name">Camera name</label>
                        <input
                          type="text"
                          className={`form-control ${errors.name ? "is-invalid ml-2" : ""}`}
                          id="name"
                          name="name"
                          value={cameraData.name}
                          onChange={handleInputChange}
                        />
                        {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                      </div>
                      <div className="mb-3 col-md-4 col-sm-12">
                        <label className="form-label p-2" htmlFor="ip">IP Address</label>
                        <input
                          type="text"
                          className={`form-control ${errors.ip ? "is-invalid" : ""}`}
                          id="ip"
                          name="ip"
                          value={cameraData.ip}
                          onChange={handleInputChange}
                        />
                        {errors.ip && <div className="invalid-feedback">{errors.ip}</div>}
                      </div>
                      <div className="mb-3 col-md-4 col-sm-12">
                        <label className="form-label p-2" htmlFor="port">Port</label>
                        <input
                          type="number"
                          className={`form-control ${errors.port ? "is-invalid" : ""}`}
                          id="port"
                          name="port"
                          value={cameraData.port}
                          onChange={handleInputChange}
                          min="1"
                        />
                        {errors.port && <div className="invalid-feedback">{errors.port}</div>}
                      </div>
                    </div>
                  </div>
                  <div className="form-buttons">
                    <button type="submit" className="btn btn-primary mr-3">Save</button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => navigate('/rentaler/camera-management')}
                    >
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
}

export default EditCamera;