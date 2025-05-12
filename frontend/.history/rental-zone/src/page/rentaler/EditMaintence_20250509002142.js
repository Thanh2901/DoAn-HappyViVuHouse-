import { Navigate, useParams, useNavigate } from 'react-router-dom'; // Added useNavigate
import Nav from './Nav';
import SidebarNav from './SidebarNav';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getMaintenance } from '../../services/fetch/ApiUtils';
import MaintenanceService from '../../services/axios/MaintenanceService';
import { translate } from "../../utils/i18n/translate";

function EditMaintenance(props) {
    const { authenticated, role, currentUser, location, onLogout } = props;
    const { id } = useParams();
    const navigate = useNavigate(); // Added navigate hook

    const [contractData, setContractData] = useState({
        maintenanceDate: '',
        roomId: '',
        price: '',
        files: [],
        room: ''
    });
    const [roomId, setRoomId] = useState();

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
        formData.append('roomId', roomId);
        formData.append('price', contractData.price);
        contractData.files && contractData.files.forEach((file, index) => {
            formData.append(`files`, file);
        });

        MaintenanceService.editMaintenanceInfo(id, formData)
            .then(response => {
                toast.success(response.message);
                toast.success("Cập nhật hợp đồng thành công!!");
                navigate('/rentaler/maintenance-management'); // Fixed navigation syntax and placement
            })
            .catch(error => {
                toast.error((error && error.message) || 'Oops! Có điều gì đó xảy ra. Vui lòng thử lại!');
            });
    };

    useEffect(() => {
        getMaintenance(id)
            .then(response => {
                const contract = response;
                setContractData(prevState => ({
                    ...prevState,
                    ...contract
                }));
                setRoomId(response.room.id);
            })
            .catch(error => {
                toast.error((error && error.message) || 'Oops! Có điều gì đó xảy ra. Vui lòng thử lại!');
            });
    }, [id]);

    if (!authenticated) {
        return <Navigate
            to={{
                pathname: "/login-rentaler",
                state: { from: location }
            }} />;
    }

    return (
        <>
            <div className="wrapper">
                <nav id="sidebar" className="sidebar js-sidebar">
                    <div className="sidebar-content js-simplebar">
                        <a className="sidebar-brand" href="index.html">
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
                                <h5 className="card-title">Chỉnh sửa phiếu bảo trì</h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="locationId">Chọn phòng</label>
                                        <select className="form-select" id="locationId" name="roomId" value={contractData.roomId} onChange={handleInputChange} disabled>
                                            <option key={contractData.room.id} value={contractData.room.id}>{contractData.room.title}</option>
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="price">Chi Phí Bảo Trì</label>
                                        <input type="number" className="form-control" id="price" name="price" value={contractData.price}
                                               onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="price">Thời Gian</label>
                                        <input type="datetime-local" className="form-control" id="price" name="maintenanceDate" value={contractData.maintenanceDate}
                                               onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="row">
                                        <div className="mb-3">
                                            <label className="form-label">Tải Phiếu Bảo Trì</label>
                                            <input className="form-control" type="file" accept=".pdf" name="files" multiple onChange={handleFileChange} />
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-primary">Submit</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default EditMaintenance;