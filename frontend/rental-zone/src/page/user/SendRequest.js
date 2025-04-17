import {Navigate, useNavigate, useParams} from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import SidebarNav from './SidebarNav';
import { getContract, sendRequestForRentaler } from '../../services/fetch/ApiUtils';
import Header from '../../common/Header';
import Footer from '../../common/Footer';


function SendRequest(props) {
    const { authenticated, role, currentUser, location, onLogout } = props;
    const { id } = useParams();
    const navigate = useNavigate();

    const [contractData, setContractData] = useState({
        description: '',
        nameOfRent: '',
        roomId: '',
        nameRoom: '',
        phone: ''
    });

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setContractData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };



    const handleSubmit = (event) => {
        event.preventDefault();
        const request = Object.assign({}, contractData);
        sendRequestForRentaler(request)
            .then(response => {
                toast.success(response.message)
                setContractData({
                    description: '',
                });
                navigate("/request-status")
            })
            .catch(error => {
                toast.error((error && error.message) || 'Oops! Có điều gì đó xảy ra. Vui lòng thử lại!');
            });
    };

    useEffect(() => {
        getContract(id)
            .then(response => {
                setContractData({
                    roomId: response.room.id,
                    phone: response.phone,
                    nameOfRent: response.nameOfRent,
                    nameRoom : response.room.title
                })
            })
            .catch(error => {
                toast.error((error && error.message) || 'Oops! Có điều gì đó xảy ra. Vui lòng thử lại!');
            });
    }, [id]);



    if (!authenticated) {
        return <Navigate
            to={{
                pathname: "/login",
                state: { from: location }
            }} />;
    }
    return (

        <>
            <Header authenticated={authenticated} currentUser={currentUser} onLogout={onLogout} />
            <div style={{ marginTop: "90px" }}>
            </div>
            <main id="main">
                <div className="wrapper">
                    <nav id="sidebar" className="sidebar js-sidebar">
                        <div className="sidebar-content js-simplebar">
                            <a className="sidebar-brand" href="/profile">
                                USER
                            </a>
                            <SidebarNav />
                        </div>
                    </nav>

                    <div className="main">

                        <br />
                        <div className="container-fluid p-0">
                            <div className="card">
                                <div className="card-header">
                                    <h5 className="card-title">Yêu cầu lắp đặt</h5>
                                </div>
                                <div className="card-body">
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <label className="form-label" htmlFor="price">Mô tả yêu cầu</label>
                                            <input type="text" className="form-control" id="price" name="description" value={contractData.description}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label" htmlFor="price">Tên phòng</label>
                                            <input type="text" className="form-control" id="price" name="nameRoom" value={contractData.nameRoom}
                                                onChange={handleInputChange} disabled
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label" htmlFor="price">Người thuê</label>
                                            <input type="text" className="form-control" id="price" name="nameOfRent" value={contractData.nameOfRent}
                                                onChange={handleInputChange} disabled
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label" htmlFor="price">Số điện thoại</label>
                                            <input type="text" className="form-control" id="price" name="phone" value={contractData.phone}
                                                onChange={handleInputChange} disabled
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-primary">Gửi</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div >
                </div >
            </main>
            <Footer />
        </>
    )
}

export default SendRequest;