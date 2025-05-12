import { Navigate } from 'react-router-dom';
import Nav from './Nav';
import SidebarNav from './SidebarNav';
import { useState } from 'react';
import RoomService from "../../services/axios/RoomService";
import { toast } from 'react-toastify';
import PlacesWithStandaloneSearchBox from './map/StandaloneSearchBox';

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
  .asset-row {
    align-items: flex-end;
    margin-bottom: 1rem;
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

function AddRoom(props) {
    const { authenticated, role, currentUser, location, onLogout } = props;

    const [roomData, setRoomData] = useState({
        title: '',
        description: '',
        price: 0,
        latitude: 0.0,
        longitude: 0.0,
        address: '',
        locationId: 0,
        categoryId: 0,
        assets: [{ name: '', number: '' }],
        files: [],
        waterCost: 0,
        publicElectricCost: 0,
        internetCost: 0
    });

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setRoomData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleRemoveAsset = (indexToRemove) => {
        setRoomData(prevState => ({
            ...prevState,
            assets: prevState.assets.filter((asset, index) => index !== indexToRemove)
        }));
    };

    const handleAssetChange = (event, index) => {
        const { name, value } = event.target;
        setRoomData(prevState => ({
            ...prevState,
            assets: prevState.assets.map((asset, i) =>
                i === index ? { ...asset, [name]: value } : asset
            )
        }));
    };

    const handleFileChange = (event) => {
        setRoomData(prevState => ({
            ...prevState,
            files: [...prevState.files, ...event.target.files]
        }));
    };

    const setLatLong = (lat, long, address) => {
        setRoomData((prevRoomData) => ({
            ...prevRoomData,
            latitude: lat,
            longitude: long,
            address: address,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('title', roomData.title);
        formData.append('description', roomData.description);
        formData.append('price', roomData.price);
        formData.append('latitude', roomData.latitude);
        formData.append('longitude', roomData.longitude);
        formData.append('address', roomData.address);
        formData.append('locationId', roomData.locationId);
        formData.append('categoryId', roomData.categoryId);
        formData.append('asset', roomData.assets.length);
        formData.append('waterCost', roomData.waterCost);
        formData.append('publicElectricCost', roomData.publicElectricCost);
        formData.append('internetCost', roomData.internetCost);
        roomData.assets.forEach((asset, index) => {
            formData.append(`assets[${index}][name]`, asset.name);
            formData.append(`assets[${index}][number]`, asset.number);
        });
        roomData.files.forEach((file, index) => {
            formData.append(`files`, file);
        });

        RoomService.addNewRoom(formData)
            .then(response => {
                toast.success(response.message);
                toast.success("Đăng tin thành công!!");
                setRoomData({
                    title: '',
                    description: '',
                    price: 0,
                    latitude: 0.0,
                    longitude: 0.0,
                    address: '',
                    locationId: 0,
                    categoryId: 0,
                    assets: [{ name: '', number: '' }],
                    files: [],
                    waterCost: 0,
                    publicElectricCost: 0,
                    internetCost: 0
                });
            })
            .catch(error => {
                toast.error((error && error.message) || 'Oops! Có điều gì đó xảy ra. Vui lòng thử lại!');
            });
    };

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
                                <h5 className="card-title fs-5">Add room</h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    {/* Basic Information Section */}
                                    <div className="form-section border">
                                        <h6 className="text-capitalize fw-semibold bg-light py-2 rounded-2 mb-3">Basic information</h6>
                                        <div className="row">
                                            <div className="mb-3 col-md-6">
                                                <label className="form-label" htmlFor="title">Room name</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="title"
                                                    name="title"
                                                    value={roomData.title}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="mb-3 col-md-6">
                                                <label className="form-label" htmlFor="description">Description</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="description"
                                                    name="description"
                                                    value={roomData.description}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cost Information Section */}
                                    <div className="form-section border">
                                        <h6 className="text-capitalize fw-semibold bg-light py-2 rounded-2 mb-3">Cost information</h6>
                                        <div className="row">
                                            <div className="mb-3 col-md-4 col-sm-6">
                                                <label className="form-label" htmlFor="price">Rental price</label>
                                                <input
                                                    type="number"
                                                    className="form-control compact-input"
                                                    id="price"
                                                    name="price"
                                                    value={roomData.price}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="mb-3 col-md-4 col-sm-6">
                                                <label className="form-label" htmlFor="waterCost">Electric cost</label>
                                                <input
                                                    type="number"
                                                    className="form-control compact-input"
                                                    id="waterCost"
                                                    name="waterCost"
                                                    value={roomData.waterCost}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="mb-3 col-md-4 col-sm-6">
                                                <label className="form-label" htmlFor="internetCost">Internet cost</label>
                                                <input
                                                    type="number"
                                                    className="form-control compact-input"
                                                    id="internetCost"
                                                    name="internetCost"
                                                    value={roomData.internetCost}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Location Information Section */}
                                    <div className="form-section border">
                                        <h6 className="text-capitalize fw-semibold bg-light py-2 rounded-2 mb-3">Location information</h6>
                                        <div className="row">
                                            <div className="mb-3 col-md-4 col-sm-6">
                                                <label className="form-label" htmlFor="locationId">Area</label>
                                                <select
                                                    className="form-select"
                                                    id="locationId"
                                                    name="locationId"
                                                    value={roomData.locationId}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value={0}>Chọn...</option>
                                                    <option value={1}>Hà Nội</option>
                                                </select>
                                            </div>
                                            <div className="mb-3 col-md-4 col-sm-6">
                                                <label className="form-label" htmlFor="categoryId">Category</label>
                                                <select
                                                    className="form-select"
                                                    id="categoryId"
                                                    name="categoryId"
                                                    value={roomData.categoryId}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value={0}>Chọn...</option>
                                                    <option value={1}>Bất động sản</option>
                                                    <option value={2}>Phòng trọ</option>
                                                    <option value={3}>Chung cư mini</option>
                                                </select>
                                            </div>
                                            <div className="mb-3 col-md-4 col-sm-12">
                                                <label className="form-label" htmlFor="address">Address</label>
                                                <PlacesWithStandaloneSearchBox latLong={setLatLong} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* File Upload Section */}
                                    <div className="form-section border">
                                        <h6 className="text-capitalize fw-semibold bg-light py-2 rounded-2 mb-3">Image</h6>
                                        <div className="mb-3">
                                            <label className="form-label">Upload room image</label>
                                            <input
                                                className="form-control"
                                                type="file"
                                                name="files"
                                                multiple
                                                onChange={handleFileChange}
                                            />
                                        </div>
                                    </div>

                                    {/* Assets Section */}
                                    <div className="form-section border">
                                        <h6 className="text-capitalize fw-semibold bg-light py-2 rounded-2 mb-3">Tài sản của phòng</h6>
                                        {roomData.assets.map((asset, index) => (
                                            <div key={index} className="row asset-row">
                                                <div className="mb-3 col-md-5 col-sm-6">
                                                    <label className="form-label" htmlFor={`assetName${index}`}>Tên tài sản {index + 1}</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id={`assetName${index}`}
                                                        name="name"
                                                        value={asset.name}
                                                        onChange={(event) => handleAssetChange(event, index)}
                                                    />
                                                </div>
                                                <div className="mb-3 col-md-3 col-sm-4">
                                                    <label className="form-label" htmlFor={`assetNumber${index}`}>Số lượng</label>
                                                    <input
                                                        min="1"
                                                        type="number"
                                                        className="form-control compact-input"
                                                        id={`assetNumber${index}`}
                                                        name="number"
                                                        value={asset.number}
                                                        onChange={(event) => handleAssetChange(event, index)}
                                                    />
                                                </div>
                                                <div className="col-md-2 col-sm-2 mb-3">
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger"
                                                        onClick={() => handleRemoveAsset(index)}
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={() => setRoomData(prevState => ({
                                                ...prevState,
                                                assets: [...prevState.assets, { name: '', number: '' }]
                                            }))}
                                        >
                                            Thêm tài sản
                                        </button>
                                    </div>

                                    {/* Form Buttons */}
                                    <div className="form-buttons">
                                        <button type="submit" className="btn btn-primary">Đăng tin</button>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => setRoomData({
                                                title: '',
                                                description: '',
                                                price: 0,
                                                latitude: 0.0,
                                                longitude: 0.0,
                                                address: '',
                                                locationId: 0,
                                                categoryId: 0,
                                                assets: [{ name: '', number: '' }],
                                                files: [],
                                                waterCost: 0,
                                                publicElectricCost: 0,
                                                internetCost: 0
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

export default AddRoom;