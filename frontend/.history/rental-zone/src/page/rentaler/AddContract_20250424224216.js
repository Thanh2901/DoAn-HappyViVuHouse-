import { Navigate, useNavigate } from 'react-router-dom';
import Nav from './Nav';
import SidebarNav from './SidebarNav';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getRentOfHome, getAllAccountRoleUser } from '../../services/fetch/ApiUtils';
import ContractService from '../../services/axios/ContractService';
import { differenceInMonths, parseISO } from 'date-fns';

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

function AddContract(props) {
    const { authenticated, role, currentUser, location, onLogout } = props;
    const navigate = useNavigate();
    const [roomOptions, setRoomOptions] = useState([]);
    const [searchName, setSearchName] = useState('');
    const [deadlineError, setDeadlineError] = useState('');

    const [contractData, setContractData] = useState({
        name: '',
        roomId: '',
        nameRentHome: '',
        phone: '',
        numOfPeople: '',
        deadline: '',
        files: []
    });

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setContractData(prevState => ({
            ...prevState,
            [name]: value
        }));

        if (name === 'deadline' && value) {
            const selectedDate = parseISO(value);
            const now = new Date();
            const monthsDiff = differenceInMonths(selectedDate, now);

            if (monthsDiff <= 0) {
                setDeadlineError('Thời hạn hợp đồng phải lớn hơn thời điểm hiện tại ít nhất 1 tháng!');
            } else {
                setDeadlineError('');
            }
        }
    };

    const handleFileChange = (event) => {
        setContractData(prevState => ({
            ...prevState,
            files: [...prevState.files, ...event.target.files]
        }));
    };

    const handleSearchUser = () => {
        if (!searchName) {
            toast.error('Vui lòng nhập tên để tìm kiếm!');
            return;
        }

        getAllAccountRoleUser(searchName)
            .then(response => {
                const user = Array.isArray(response) ? response[0] : response;
                const phone = user?.phone;
                const name = user?.name;

                if (phone) {
                    setContractData(prevState => ({
                        ...prevState,
                        phone: phone,
                        nameRentHome: name || prevState.nameRentHome
                    }));
                    toast.success('Tìm thấy thông tin người dùng!');
                } else {
                    toast.error('Không tìm thấy số điện thoại!');
                }
            })
            .catch(error => {
                console.error('Error fetching user:', error);
                toast.error((error?.message) || 'Không tìm thấy người dùng!');
            });
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (contractData.deadline) {
            const selectedDate = parseISO(contractData.deadline);
            const now = new Date();
            const monthsDiff = differenceInMonths(selectedDate, now);

            if (monthsDiff <= 0) {
                toast.error('Thời hạn hợp đồng phải lớn hơn thời điểm hiện tại ít nhất 1 tháng!');
                return;
            }
        } else {
            toast.error('Vui lòng chọn thời hạn hợp đồng!');
            return;
        }

        const formData = new FormData();
        formData.append('name', contractData.name);
        formData.append('roomId', contractData.roomId);
        formData.append('nameOfRent', contractData.nameRentHome);
        formData.append('numOfPeople', contractData.numOfPeople);
        formData.append('phone', contractData.phone);
        formData.append('deadlineContract', contractData.deadline);
        contractData.files.forEach.map((file, index) => {
            formData.append(`files`, file);
        });

        ContractService.addNewContract(formData)
            .then(response => {
                toast.success(response.message);
                toast.success('Hợp đồng lưu thành công!!');
                setContractData({
                    name: '',
                    roomId: '',
                    nameRentHome: '',
                    phone: '',
                    numOfPeople: '',
                    deadline: '',
                    files: []
                });
                navigate('/rentaler/contract-management');
            })
            .catch(error => {
                toast.error((error?.message) || 'Oops! Có điều gì đó xảy ra. Vui lòng thử lại!');
            });
    };

    useEffect(() => {
        getRentOfHome()
            .then(response => {
                const room = response.content;
                setRoomOptions(room);
            })
            .catch(error => {
                toast.error((error?.message) || 'Oops! Có điều gì đó xảy ra. Vui lòng thử lại!');
            });
    }, []);

    if (!authenticated) {
        return <Navigate
            to={{
                pathname: '/login-rentaler',
                state: { from: location }
            }}
        />;
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
                                <h5 className="card-title fs-5">Contract creation</h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    {/* Contract Information Section */}
                                    <div className="form-section border">
                                        <h6 className="text-capitalize fw-semibold bg-light py-2 rounded-2 mb-3">Contract information</h6>
                                        <div className="row">
                                            <div className="mb-3 col-md-6 col-sm-12">
                                                <label className="form-label" htmlFor="name">Contract title</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="name"
                                                    name="name"
                                                    value={contractData.name}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="mb-3 col-md-6 col-sm-12">
                                                <label className="form-label" htmlFor="roomId">Choose room</label>
                                                <select
                                                    className="form-select"
                                                    id="roomId"
                                                    name="roomId"
                                                    value={contractData.roomId}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="">Choose...</option>
                                                    {roomOptions.map(roomOption => (
                                                        <option key={roomOption.id} value={roomOption.id}>
                                                            {roomOption.title}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="mb-3 col-md-6 col-sm-12">
                                                <label className="form-label" htmlFor="deadline">Contract duration</label>
                                                <input
                                                    type="datetime-local"
                                                    className={`form-control compact-input ${deadlineError ? 'is-invalid' : ''}`}
                                                    id="deadline"
                                                    name="deadline"
                                                    value={contractData.deadline}
                                                    onChange={handleInputChange}
                                                />
                                                {deadlineError && (
                                                    <div className="invalid-feedback">
                                                        {deadlineError}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="mb-3 col-md-6 col-sm-12">
                                                <label className="form-label" htmlFor="numOfPeople">Number of tenants</label>
                                                <input
                                                    type="number"
                                                    className="form-control compact-input"
                                                    id="numOfPeople"
                                                    name="numOfPeople"
                                                    value={contractData.numOfPeople}
                                                    onChange={handleInputChange}
                                                    min="1"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tenant Information Section */}
                                    <div className="form-section border">
                                        <h6 className="text-capitalize fw-semibold bg-light py-2 rounded-2 mb-3">Tenant information</h6>
                                        <div className="row">
                                            <div className="mb-3 col-md-6 col-sm-12">
                                                <label className="form-label" htmlFor="searchName">Tenant search</label>
                                                <div className="input-group">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="searchName"
                                                        value={searchName}
                                                        onChange={(e) => setSearchName(e.target.value)}
                                                        placeholder="Enter tenant name"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary"
                                                        onClick={handleSearchUser}
                                                    >
                                                        <i className="bi bi-search"></i>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="mb-3 col-md-6 col-sm-12">
                                                <label className="form-label" htmlFor="nameRentHome">Tenant</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="nameRentHome"
                                                    name="nameRentHome"
                                                    value={contractData.nameRentHome}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="mb-3 col-md-6 col-sm-12">
                                                <label className="form-label" htmlFor="phone">Phone number</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="phone"
                                                    name="phone"
                                                    value={contractData.phone}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* File Upload Section */}
                                    <div className="form-section border">
                                        <h6 className="text-capitalize fw-semibold bg-light py-2 rounded-2 mb-3">Contract Document</h6>
                                        <div className="mb-3">
                                            <label className="form-label">Upload contract (PDF)</label>
                                            <p className="text-muted">
                                            Download a contract template, fill it out for the tenant, and upload it to the system for storage. Then convert it into a PDF file before uploading.{' '}
                                                <a href="https://image.luatvietnam.vn/uploaded/Others/2021/04/08/hop-dong-thue-nha-o_2810144434_2011152916_0804150405.doc">
                                                    Download template
                                                </a>
                                            </p>
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
                                        <button type="submit" className="btn btn-primary">Save contract</button>
                                        <button
                                            type="button"
                                            className="btn btn-info"
                                            onClick={() => {
                                                setContractData({
                                                    name: '',
                                                    roomId: '',
                                                    nameRentHome: '',
                                                    phone: '',
                                                    numOfPeople: '',
                                                    deadline: '',
                                                    files: []
                                                });
                                                setSearchName('');
                                                setDeadlineError('');
                                            }}
                                        >
                                            Reset
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-danger">
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

export default AddContract;