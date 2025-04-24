import { Navigate, useNavigate } from 'react-router-dom';
import Nav from './Nav';
import SidebarNav from './SidebarNav';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getAllRoomOfRentaler } from '../../services/fetch/ApiUtils';
import MaintenanceService from '../../services/axios/MaintenanceService';

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

function AddMaintence(props) {
    const { authenticated, role, currentUser, location, onLogout } = props;
    const navigate = useNavigate();
    const [roomOptions, setRoomOptions] = useState([]);

    const [contractData, setContractData] = useState({
        maintenanceDate: '',
        roomId: '',
        price: '',
        files: []
    });

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setContractData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleFileChange = (event) => {
        setContractData(prevState => ({
            ...prevState,
            files: [...prevState.files, ...event.target.files]
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('maintenanceDate', contractData.maintenanceDate);
        formData.append('roomId', contractData.roomId);
        formData.append('price', contractData.price);
        contractData.files.forEach((file, index) => {
            formData.append(`files`, file);
        });

        MaintenanceService.addNewMaintenance(formData)
            .then(response => {
                toast.success(response.message);
                toast.success("Phiếu bảo trì lưu thành công!!");
                setContractData({
                    maintenanceDate: '',
                    roomId: '',
                    price: '',
                    files: []
                });
                navigate('/rentaler/maintenance-management');
            })
            .catch(error => {
                toast.error((error && error.message) || 'Oops! Có điều gì đó xảy ra. Vui lòng thử lại!');
            });
    };

    useEffect(() => {
        getAllRoomOfRentaler(1, 1000, '')
            .then(response => {
                const room = response.content;
                setRoomOptions(room);
            })
            .catch(error => {
                toast.error((error && error.message) || 'Oops! Có điều gì đó xảy ra. Vui lòng thử lại!');
            });
    }, []);

    if (!authenticated) {
        return <Navigate
            to={{
                pathname: "/login-rentaler",
                state: { from: location }
            }} />;
    }

    return (
        <>
            <style>{formStyles}</style>
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
                                <h5 className="card-title fs-5">Ticket creation</h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    {/* Maintenance Information Section */}
                                    <div className="form-section border">
                                        <h6 className="text-capitalize fw-semibold bg-light py-2 rounded-2 mb-3">Maintenance information</h6>
                                        <div className="row">
                                            <div className="mb-3 col-md-4 col-sm-6">
                                                <label className="form-label" htmlFor="roomId">Choose rooms</label>
                                                <select
                                                    className="form-select"
                                                    id="roomId"
                                                    name="roomId"
                                                    value={contractData.roomId}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="">Chọn...</option>
                                                    {roomOptions.map(roomOption => (
                                                        <option key={roomOption.id} value={roomOption.id}>
                                                            {roomOption.title}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="mb-3 col-md-4 col-sm-6">
                                                <label className="form-label" htmlFor="price">Chi phí bảo trì</label>
                                                <input
                                                    type="number"
                                                    className="form-control compact-input"
                                                    id="price"
                                                    name="price"
                                                    value={contractData.price}
                                                    onChange={handleInputChange}
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div className="mb-3 col-md-4 col-sm-6">
                                                <label className="form-label" htmlFor="maintenanceDate">Thời gian</label>
                                                <input
                                                    type="datetime-local"
                                                    className="form-control compact-input"
                                                    id="maintenanceDate"
                                                    name="maintenanceDate"
                                                    value={contractData.maintenanceDate}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* File Upload Section */}
                                    <div className="form-section border">
                                        <h6 className="text-capitalize fw-semibold bg-light py-2 rounded-2 mb-3">Tài liệu bảo trì</h6>
                                        <div className="mb-3">
                                            <label className="form-label">Tải phiếu bảo trì (PDF)</label>
                                            <input
                                                className="form-control"
                                                type="file"
                                                accept=".pdf"
                                                name="files"
                                                multiple
                                                onChange={handleFileChange}
                                            />
                                        </div>
                                    </div>

                                    {/* Form Buttons */}
                                    <div className="form-buttons">
                                        <button type="submit" className="btn btn-primary">Lưu phiếu</button>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => setContractData({
                                                maintenanceDate: '',
                                                roomId: '',
                                                price: '',
                                                files: []
                                            })}
                                        >
                                            Hủy
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

export default AddMaintence;