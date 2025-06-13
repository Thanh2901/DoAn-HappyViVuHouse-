import React, { useState, useEffect } from "react";
import Footer from "../../common/Footer";
import { toast } from 'react-toastify';
import { Link } from "react-router-dom";
const UserUpdateProfile = () => {

    const [userData, setUserData] = useState({
        name: "",
        email: "",
        phone: "",
        createdAt: "",
        address: "",
        role: "",
    });

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setUserData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleUpdateClick = () => {
        const token = localStorage.getItem("accessToken");
    
        fetch("http://localhost:8080/user/update", {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        })
        .then((response) => {
            if (response.status === 200) {
                //return response.json();
            } else {
                throw new Error("Update failed");
            }
        })
        .then((data) => {
            console.log("Update successful:", data);
            // Cập nhật lại dữ liệu trong userData
            //setUserData(data);
            // Hiển thị thông báo cập nhật thành công
            toast.success("Cập nhật thông tin thành công", { autoClose: 750 });
            // Làm mới trang sau 1.5s
            setTimeout(() => {
                window.location.href = "/profile";
            }, 1500);
        })
        .catch((error) => {
            console.error("Error updating profile:", error);
            // Hiển thị thông báo cập nhật thất bại
            toast.error("Cập nhật thông tin thất bại", { autoClose: 1500 });
        });
    };
    
    
    


    useEffect(() => {
        // Lấy token từ local storage
        const token = localStorage.getItem("accessToken");

        // Gọi API để lấy thông tin người dùng
        fetch("http://localhost:8080/user/me/", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then(data => {
                setUserData(data); // Cập nhật dữ liệu người dùng
                console.log("User Data:", data);
            })
            .catch(error => {
                console.error("Error fetching user profile:", error);
            });

    }, []);

    return (
        <>
            <section style={{ backgroundColor: "#eee" }}>
                <div className="container py-5">
                    <div className="row">
                        <div className="col">
                            <nav aria-label="breadcrumb" className="bg-light rounded-3 p-3 mb-4">
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item"><a href="/">Home</a></li>
                                    <li className="breadcrumb-item"><a href="/profile">User</a></li>
                                    <li className="breadcrumb-item active" aria-current="page">User Information</li>
                                </ol>
                            </nav>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-lg-4">
                            <div className="card mb-4">
                                <div className="card-body text-center">
                                    <img src={userData && userData.imageUrl} alt="avatar" className="rounded-circle img-fluid" style={{ width: "150px" }} />
                                    <hr />
                                    <div className="d-flex justify-content-center mb-2">
                                        <button type="button" className="btn btn-primary" onClick={handleUpdateClick}>
                                            Update Information
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="card mb-4 mb-lg-0">
                                <div className="card-body p-0">
                                    <ul className="list-group list-group-flush rounded-3">
                                        <li className="list-group-item d-flex justify-content-between align-items-center p-3">
                                            <i className="fas fa-globe fa-lg text-warning"></i>
                                            <p className="mb-0">Facebook: </p>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between align-items-center p-3">
                                            <i className="fab fa-github fa-lg" style={{ color: "#333333" }}></i>
                                            <p className="mb-0">Email: </p>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between align-items-center p-3">
                                            <i className="fab fa-twitter fa-lg" style={{ color: "#55acee" }}></i>
                                            <p className="mb-0">Instagram</p>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between align-items-center p-3">
                                            <i className="fab fa-instagram fa-lg" style={{ color: "#ac2bac" }}></i>
                                            <p className="mb-0">Twitter</p>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between align-items-center p-3">
                                            <i className="fab fa-facebook-f fa-lg" style={{ color: "#3b5998" }}></i>
                                            <p className="mb-0">Zalo: </p>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-8">
                            <div className="card mb-4">
                                <div className="card-body">
                                <div className="row">
                                        <div className="col-sm-3">
                                            <p className="mb-0">Email</p>
                                        </div>
                                        <div className="col-sm-9">
                                            <input
                                                className="form-control"
                                                name="email"
                                                value={userData && userData.email ? userData.email : ""}
                                            />
                                        </div>
                                    </div>
                                    <hr />
                                    <hr />
                                    <hr />
                                    <div className="row">
                                        <div className="col-sm-3">
                                            <p className="mb-0">Full Name</p>
                                        </div>
                                        <div className="col-sm-9">
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="name"
                                                value={userData && userData.name ? userData.name : ""}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                    <hr />
                                    <hr />
                                    <hr />
                                    <div className="row">
                                        <div className="col-sm-3">
                                            <p className="mb-0">Phone Number</p>
                                        </div>
                                        <div className="col-sm-9">
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="phone"
                                                value={userData && userData.phone ? userData.phone : ""}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                    <hr />
                                    <hr />
                                    <hr />
                                    
                                    <div className="row">
                                        <div className="col-sm-3">
                                            <p className="mb-0">Address</p>
                                        </div>
                                        <div className="col-sm-9">
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="address"
                                                value={userData && userData.address ? userData.address : ""}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                    <hr />
                                    <hr />
                                    <hr />
                                    <hr />
                                    <hr />
                                    <hr />

                                    {/* ... (other parts in card body) */}
                                </div>

                            </div>
                            {/* ... (other parts in col-lg-8) */}
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </>
    );
};

export default UserUpdateProfile;
