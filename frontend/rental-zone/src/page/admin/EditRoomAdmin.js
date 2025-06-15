import { Navigate, useParams, useNavigate } from 'react-router-dom';
import Nav from './Nav';
import SidebarNav from './SidebarNav';
import { useEffect, useState } from 'react';
import RoomService from "../../services/axios/RoomService";
import { toast } from 'react-toastify';
import { getRoom } from '../../services/fetch/ApiUtils';
import PlacesWithStandaloneSearchBox from './map/StandaloneSearchBox';
import MyMapComponent from './map/MyMapComponent';
import { translate } from "../../utils/i18n/translate";

const formStyles = `
  .compact-input { max-width: 200px; }
  .form-section { margin-bottom: 2rem; padding: 1rem; border-radius: 8px; background-color: #f8f9fa; }
  .asset-row { align-items: flex-end; margin-bottom: 1rem; }
  .form-buttons { display: flex; gap: 1rem; justify-content: flex-end; }
  .form-label { font-weight: 500; }
  .error-text { color: red; font-size: 0.875rem; margin-top: 0.25rem; }
`;

function EditRoomAdmin(props) {
  const { authenticated, role, currentUser, location, onLogout } = props;
  const { id } = useParams();
  const navigate = useNavigate();

  const [roomData, setRoomData] = useState({
    title: '',
    description: '',
    price: 0,
    latitude: 0.0,
    longitude: 0.0,
    address: '',
    locationId: 0,
    categoryId: 0,
    type: 'REGULAR',
    assets: [{ name: '', number: '' }],
    files: [],
    waterCost: 0,
    publicElectricCost: 0,
    internetCost: 0,
    roomMedia: []
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!roomData.title.trim()) newErrors.title = translate("rentaler:rental_rooms_management:title_required");
    if (roomData.locationId === 0) newErrors.locationId = translate("rentaler:rental_rooms_management:location_required");
    if (roomData.categoryId === 0) newErrors.categoryId = translate("rentaler:rental_rooms_management:category_required");
    if (!roomData.type) newErrors.type = translate("rentaler:rental_rooms_management:type_required");
    if (roomData.price < 0) newErrors.price = translate("rentaler:rental_rooms_management:price_invalid");
    if (roomData.waterCost < 0) newErrors.waterCost = translate("rentaler:rental_rooms_management:water_cost_invalid");
    if (roomData.publicElectricCost < 0) newErrors.publicElectricCost = translate("rentaler:rental_rooms_management:electric_cost_invalid");
    if (roomData.internetCost < 0) newErrors.internetCost = translate("rentaler:rental_rooms_management:internet_cost_invalid");
    if (roomData.files.length === 0 && roomData.roomMedia.length === 0) newErrors.files = translate("rentaler:rental_rooms_management:files_required");
    roomData.assets.forEach((asset, index) => {
      if (asset.name.trim() && !asset.number) {
        newErrors[`assetNumber${index}`] = translate("rentaler:rental_rooms_management:asset_quantity_required");
      }
      if (!asset.name.trim() && asset.number) {
        newErrors[`assetName${index}`] = translate("rentaler:rental_rooms_management:asset_name_required");
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setRoomData(prevState => ({
      ...prevState,
      [name]: name === 'locationId' || name === 'categoryId' ? parseInt(value) : value
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleRemoveAsset = (indexToRemove) => {
    setRoomData(prevState => ({
      ...prevState,
      assets: prevState.assets.filter((_, index) => index !== indexToRemove)
    }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`assetName${indexToRemove}`];
      delete newErrors[`assetNumber${indexToRemove}`];
      return newErrors;
    });
  };

  const handleAssetChange = (event, index) => {
    const { name, value } = event.target;
    setRoomData(prevState => ({
      ...prevState,
      assets: prevState.assets.map((asset, i) =>
        i === index ? { ...asset, [name]: name === 'number' ? (value ? parseInt(value) : '') : value } : asset
      )
    }));
    setErrors(prev => ({ ...prev, [`asset${name.charAt(0).toUpperCase() + name.slice(1)}${index}`]: '' }));
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files).filter(file => file.type.startsWith('image/'));
    if (files.length === 0) {
      setErrors(prev => ({ ...prev, files: translate("rentaler:rental_rooms_management:files_required") }));
    } else {
      setErrors(prev => ({ ...prev, files: '' }));
    }
    setRoomData(prevState => ({
      ...prevState,
      files: files
    }));
  };

  useEffect(() => {
    getRoom(id)
      .then(response => {
        const room = response;
        setRoomData(prevState => ({
          ...prevState,
          title: room.title || "",
          description: room.description || "",
          price: room.price ? parseFloat(room.price) : 0,
          latitude: room.latitude ? parseFloat(room.latitude) : 0.0,
          longitude: room.longitude ? parseFloat(room.longitude) : 0.0,
          address: room.address || "",
          locationId: room.locationId ? parseInt(room.locationId) : 0,
          categoryId: room.categoryId ? parseInt(room.categoryId) : 0,
          type: room.type || "REGULAR",
          assets: room.assets && Array.isArray(room.assets)
            ? room.assets.map(asset => ({
                name: asset.name || "",
                number: asset.number ? parseInt(asset.number) : 0
              }))
            : [{ name: "", number: "" }],
          files: [],
          waterCost: room.waterCost ? parseFloat(room.waterCost) : 0,
          publicElectricCost: room.publicElectricCost ? parseFloat(room.publicElectricCost) : 0,
          internetCost: room.internetCost ? parseFloat(room.internetCost) : 0,
          roomMedia: room.roomMedia || []
        }));
      })
      .catch(error => {
        toast.error((error && error.message) || translate("rentaler:rental_rooms_management:fetch_error"));
      });
  }, [id]);

  const setLatLong = (lat, long, address) => {
    setRoomData(prevState => ({
      ...prevState,
      latitude: lat,
      longitude: long,
      address: address
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validateForm()) {
      console.log("Form validation failed");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('title', roomData.title || "");
    formData.append('description', roomData.description || "");
    formData.append('price', roomData.price ? roomData.price.toString() : "0");
    formData.append('latitude', roomData.latitude ? roomData.latitude.toString() : "0.0");
    formData.append('longitude', roomData.longitude ? roomData.longitude.toString() : "0.0");
    formData.append('address', roomData.address || "");
    formData.append('locationId', roomData.locationId ? roomData.locationId.toString() : "0");
    formData.append('categoryId', roomData.categoryId ? roomData.categoryId.toString() : "0");
    formData.append('type', roomData.type || "REGULAR");
    formData.append('waterCost', roomData.waterCost ? roomData.waterCost.toString() : "0");
    formData.append('publicElectricCost', roomData.publicElectricCost ? roomData.publicElectricCost.toString() : "0");
    formData.append('internetCost', roomData.internetCost ? roomData.internetCost.toString() : "0");

    if (roomData.assets && Array.isArray(roomData.assets)) {
      roomData.assets
        .filter(asset => asset.name.trim() && asset.number !== '')
        .forEach((asset, index) => {
          formData.append(`assets[${index}][name]`, asset.name || "");
          formData.append(`assets[${index}][number]`, asset.number ? asset.number.toString() : "0");
        });
    }

    if (roomData.files && Array.isArray(roomData.files)) {
      roomData.files.forEach((file) => {
        if (file instanceof File) {
          formData.append('files', file);
        }
      });
    }

    console.log("FormData entries:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    RoomService.updateRoom(id, formData)
      .then(response => {
        toast.success(response.message || translate("rentaler:rental_rooms_management:update_success"));
        navigate('/admin/room-management');
      })
      .catch(error => {
        console.error("Backend error:", error);
        toast.error((error.response && error.response.data && error.response.data.message) || translate("rentaler:rental_rooms_management:update_error"));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (!authenticated) {
    return <Navigate to={{ pathname: "/login-admin", state: { from: location } }} />;
  }

  return (
    <>
      <style>{formStyles}</style>
      <div className="wrapper">
        <nav id="sidebar" className="sidebar js-sidebar">
          <div className="sidebar-content js-simplebar">
            <a className="sidebar-brand" href="/admin">
              <span className="align-middle">ADMIN PRO</span>
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
                <h5 className="card-title fs-5">{translate("rentaler:rental_rooms_management:update_rental_room")}</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  {/* Basic Information Section */}
                  <div className="form-section border">
                    <h6 className="text-capitalize fw-semibold bg-light py-2 rounded-2 mb-3">{translate("rentaler:rental_rooms_management:basicInfo")}</h6>
                    <div className="row">
                      <div className="mb-3 col-md-6">
                        <label className="form-label" htmlFor="title">{translate("rentaler:rental_rooms_management:room_name")}</label>
                        <input
                          type="text"
                          className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                          id="title"
                          name="title"
                          value={roomData.title}
                          onChange={handleInputChange}
                        />
                        {errors.title && <div className="error-text">{errors.title}</div>}
                      </div>
                      <div className="mb-3 col-md-6">
                        <label className="form-label" htmlFor="description">{translate("rentaler:rental_rooms_management:description")}</label>
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
                    <div className="row">
                      <div className="mb-3 col-md-6">
                        <label className="form-label" htmlFor="type">{translate("rentaler:rental_rooms_management:room_type")}</label>
                        <select
                          className={`form-select ${errors.type ? 'is-invalid' : ''}`}
                          id="type"
                          name="type"
                          value={roomData.type}
                          onChange={handleInputChange}
                        >
                          <option value="REGULAR">{translate("rentaler:rental_rooms_management:regular")}</option>
                          <option value="VIP">{translate("rentaler:rental_rooms_management:vip")}</option>
                        </select>
                        {errors.type && <div className="error-text">{errors.type}</div>}
                      </div>
                    </div>
                  </div>

                  {/* Cost Information Section */}
                  <div className="form-section border">
                    <h6 className="text-capitalize fw-semibold bg-light py-2 rounded-2 mb-3">{translate("rentaler:rental_rooms_management:costInfo")}</h6>
                    <div className="row">
                      <div className="mb-3 col-md-4 col-sm-6">
                        <label className="form-label" htmlFor="price">{translate("rentaler:rental_rooms_management:rentalPrice")}</label>
                        <input
                          type="number"
                          className={`form-control compact-input ${errors.price ? 'is-invalid' : ''}`}
                          id="price"
                          name="price"
                          value={roomData.price}
                          onChange={handleInputChange}
                          min="0"
                        />
                        {errors.price && <div className="error-text">{errors.price}</div>}
                      </div>
                      <div className="mb-3 col-md-4 col-sm-6">
                        <label className="form-label" htmlFor="waterCost">{translate("rentaler:rental_rooms_management:waterCost")}</label>
                        <input
                          type="number"
                          className={`form-control compact-input ${errors.waterCost ? 'is-invalid' : ''}`}
                          id="waterCost"
                          name="waterCost"
                          value={roomData.waterCost}
                          onChange={handleInputChange}
                          min="0"
                        />
                        {errors.waterCost && <div className="error-text">{errors.waterCost}</div>}
                      </div>
                      <div className="mb-3 col-md-4 col-sm-6">
                        <label className="form-label" htmlFor="publicElectricCost">{translate("rentaler:rental_rooms_management:electricCost")}</label>
                        <input
                          type="number"
                          className={`form-control compact-input ${errors.publicElectricCost ? 'is-invalid' : ''}`}
                          id="publicElectricCost"
                          name="publicElectricCost"
                          value={roomData.publicElectricCost}
                          onChange={handleInputChange}
                          min="0"
                        />
                        {errors.publicElectricCost && <div className="error-text">{errors.publicElectricCost}</div>}
                      </div>
                      <div className="mb-3 col-md-4 col-sm-6">
                        <label className="form-label" htmlFor="internetCost">{translate("rentaler:rental_rooms_management:internetCost")}</label>
                        <input
                          type="number"
                          className={`form-control compact-input ${errors.internetCost ? 'is-invalid' : ''}`}
                          id="internetCost"
                          name="internetCost"
                          value={roomData.internetCost}
                          onChange={handleInputChange}
                          min="0"
                        />
                        {errors.internetCost && <div className="error-text">{errors.internetCost}</div>}
                      </div>
                    </div>
                  </div>

                  {/* Location Information Section */}
                  <div className="form-section border">
                    <h6 className="text-capitalize fw-semibold bg-light py-2 rounded-2 mb-3">{translate("rentaler:rental_rooms_management:locationInfo")}</h6>
                    <div className="row">
                      <div className="mb-3 col-md-4 col-sm-6">
                        <label className="form-label" htmlFor="locationId">{translate("rentaler:rental_rooms_management:area")}</label>
                        <select
                          className={`form-select ${errors.locationId ? 'is-invalid' : ''}`}
                          id="locationId"
                          name="locationId"
                          value={roomData.locationId}
                          onChange={handleInputChange}
                        >
                          <option value={0}>{translate("rentaler:rental_rooms_management:select")}</option>
                          <option value={1}>Hà Nội</option>
                          <option value={2}>Hồ Chí Minh</option>
                          <option value={3}>Đà Nẵng</option>
                        </select>
                        {errors.locationId && <div className="error-text">{errors.locationId}</div>}
                      </div>
                      <div className="mb-3 col-md-4 col-sm-6">
                        <label className="form-label" htmlFor="categoryId">{translate("rentaler:rental_rooms_management:category")}</label>
                        <select
                          className={`form-select ${errors.categoryId ? 'is-invalid' : ''}`}
                          id="categoryId"
                          name="categoryId"
                          value={roomData.categoryId}
                          onChange={handleInputChange}
                        >
                          <option value={0}>{translate("rentaler:rental_rooms_management:select")}</option>
                          <option value={1}>Bất động sản</option>
                          <option value={2}>Phòng trọ</option>
                          <option value={3}>Chung cư mini</option>
                        </select>
                        {errors.categoryId && <div className="error-text">{errors.categoryId}</div>}
                      </div>
                      <div className="mb-3 col-md-4 col-sm-12">
                        <label className="form-label" htmlFor="address">{translate("rentaler:rental_rooms_management:address")}</label>
                        <PlacesWithStandaloneSearchBox latLong={setLatLong} />
                        {roomData.latitude !== 0.0 && roomData.longitude !== 0.0 && (
                          <div style={{ marginTop: 16 }}>
                            <MyMapComponent latitude={roomData.latitude} longitude={roomData.longitude} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* File Upload Section */}
                  <div className="form-section border">
                    <h6 className="text-capitalize fw-semibold bg-light py-2 rounded-2 mb-3">{translate("rentaler:rental_rooms_management:image")}</h6>
                    <div className="mb-3">
                      <label className="form-label">{translate("rentaler:rental_rooms_management:upload_room_image")}</label>
                      {roomData.roomMedia?.map((media, index) => (
                        <img
                          key={index}
                          src={`http://localhost:8080/document/${media.files}`}
                          style={{ width: "10%", marginLeft: "10px", border: "1px solid #ddd" }}
                          alt={`Media ${index}`}
                        />
                      ))}
                      <input
                        className={`form-control ${errors.files ? 'is-invalid' : ''}`}
                        id="fileInput"
                        type="file"
                        name="files"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      {errors.files && <div className="error-text">{errors.files}</div>}
                    </div>
                  </div>

                  {/* Assets Section */}
                  <div className="form-section border">
                    <h6 className="text-capitalize fw-semibold bg-light py-2 rounded-2 mb-3">{translate("rentaler:rental_rooms_management:assetInfo")}</h6>
                    {roomData.assets?.map((asset, index) => (
                      <div key={index} className="row asset-row">
                        <div className="mb-3 col-md-5 col-sm-6">
                          <label className="form-label" htmlFor={`assetName${index}`}>{translate("rentaler:rental_rooms_management:assetName")} {index + 1}</label>
                          <input
                            type="text"
                            className={`form-control ${errors[`assetName${index}`] ? 'is-invalid' : ''}`}
                            id={`assetName${index}`}
                            name="name"
                            value={asset.name}
                            onChange={(event) => handleAssetChange(event, index)}
                          />
                          {errors[`assetName${index}`] && <div className="error-text">{errors[`assetName${index}`]}</div>}
                        </div>
                        <div className="mb-3 col-md-3 col-sm-4">
                          <label className="form-label" htmlFor={`assetNumber${index}`}>{translate("rentaler:rental_rooms_management:quantity")}</label>
                          <input
                            min="1"
                            type="number"
                            className={`form-control compact-input ${errors[`assetNumber${index}`] ? 'is-invalid' : ''}`}
                            id={`assetNumber${index}`}
                            name="number"
                            value={asset.number}
                            onChange={(event) => handleAssetChange(event, index)}
                          />
                          {errors[`assetNumber${index}`] && <div className="error-text">{errors[`assetNumber${index}`]}</div>}
                        </div>
                        <div className="col-md-2 col-sm-2 mb-3">
                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => handleRemoveAsset(index)}
                          >
                            {translate("rentaler:rental_rooms_management:delete")}
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
                      {translate("rentaler:rental_rooms_management:addAsset")}
                    </button>
                  </div>

                  {/* Form Buttons */}
                  <div className="form-buttons">
                    <button
                      type="submit"
                      className="btn btn-primary"
                    >
                      {loading ? translate("rentaler:rental_rooms_management:updating") : translate("rentaler:rental_rooms_management:update")}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => navigate('/admin/room-management')}
                      disabled={loading}
                    >
                      {translate("rentaler:rental_rooms_management:cancel")}
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

export default EditRoomAdmin;