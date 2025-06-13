import { Navigate, useNavigate } from 'react-router-dom';
import Nav from './Nav';
import SidebarNav from './SidebarNav';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { createCamera } from '../../services/fetch/ApiUtils';

// Custom CSS for form styling
const formStyles = `
  .compact-input {
    max-width: 200px;
  }
  .form-section {
    margin-bottom: 2rem;
    padding: 1rem;
    border-radius: 8px;
    background-color: #f8f9fa;
  }
  .form-buttons {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }
  .form-label {
    font-weight: 500;
  }
`;

function AddCamera(props) {
  const { authenticated, role, currentUser, location, onLogout } = props;
  const navigate = useNavigate();

  const [cameraData, setCameraData] = useState({
    name: '',
    ip: '',
    port: ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setCameraData(prevState => ({
      ...prevState,
      [name]: value
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      toast.error("Vui lòng điền đầy đủ và đúng thông tin!");
      return;
    }
    try {
      await createCamera({
        name: cameraData.name,
        ip: cameraData.ip,
        port: Number(cameraData.port)
      });
      toast.success("Thêm camera thành công!");
      setCameraData({ name: '', ip: '', port: '' });
      navigate('/rentaler/camera-management');
    } catch (error) {
      toast.error(
        (error && error.message) ||
        "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!"
      );
    }
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
    <>
      <style>{formStyles}</style>
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
          <br />
          <div className="container-fluid p-0">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title fs-5">Camera creation</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="form-section border">
                    <h6 className="text-capitalize fw-semibold bg-light py-2 rounded-2 mb-3">Camera information</h6>
                    <div className="row">
                      <div className="mb-3 col-md-4 col-sm-12">
                        <label className="form-label" htmlFor="name">Camera name</label>
                        <input
                          type="text"
                          className={`form-control ${errors.name ? "is-invalid" : ""}`}
                          id="name"
                          name="name"
                          value={cameraData.name}
                          onChange={handleInputChange}
                        />
                        {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                      </div>
                      <div className="mb-3 col-md-4 col-sm-12">
                        <label className="form-label" htmlFor="ip">IP Address</label>
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
                        <label className="form-label" htmlFor="port">Port</label>
                        <input
                          type="number"
                          className={`form-control compact-input ${errors.port ? "is-invalid" : ""}`}
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
                    <button type="submit" className="btn btn-primary">Save camera</button>
                    <button
                      type="button"
                      className="btn btn-info"
                      onClick={() => setCameraData({ name: '', ip: '', port: '' })}
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
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

export default AddCamera;