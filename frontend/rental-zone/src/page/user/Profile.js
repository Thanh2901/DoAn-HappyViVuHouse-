import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Footer from "../../common/Footer";
import SidebarNav from "./SidebarNav";
import Header from "../../common/Header";
import AuthService from "../../services/axios/AuthService";
import "./UserProfile.css";

const UserProfile = ({ authenticated, currentUser, loadCurrentUser, onLogout }) => {
    const location = useLocation();
    const [imageFile, setImageFile] = useState(null);
    const [address, setAddress] = useState(currentUser?.address || "");
    const [profileImage, setProfileImage] = useState(currentUser?.profileImage || ""); // Thêm state cho ảnh

    // Đồng bộ state với prop currentUser khi nó thay đổi
    useEffect(() => {
        setAddress(currentUser?.address || "");
        setProfileImage(currentUser?.profileImage || "");
    }, [currentUser]);

    const handleAddressChange = (event) => {
        setAddress(event.target.value);
    };

    const onFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const allowedTypes = ["image/jpeg", "image/png"];
            const maxFileSize = 1 * 1024 * 1024;

            if (!allowedTypes.includes(file.type)) {
                toast.error("Chỉ hỗ trợ định dạng JPEG và PNG.");
                return;
            }
            if (file.size > maxFileSize) {
                toast.error("Kích thước tệp vượt quá giới hạn 1MB.");
                return;
            }
            setImageFile(file);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        if (imageFile) {
            formData.append("file", imageFile);
        }
        formData.append("address", address);

        try {
            const response = await AuthService.uploadProfile(formData);
            toast.success(response.message || "Cập nhật thông tin cá nhân thành công.");

            // Giả sử response trả về URL ảnh mới (nếu có)
            if (response.data?.profileImage) {
                setProfileImage(response.data.profileImage); // Cập nhật ảnh ngay lập tức
            }

            setImageFile(null);

            if (typeof loadCurrentUser === "function") {
                await loadCurrentUser(); // Đợi loadCurrentUser hoàn thành
            } else {
                console.log("loadCurrentUser not available, reloading...");
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        } catch (error) {
            toast.error(error?.message || "Có lỗi xảy ra. Vui lòng thử lại!");
        }
    };

    const getLastNameInitial = (name) => {
        if (!name) return "";
        const nameParts = name.trim().split(" ");
        const lastName = nameParts[nameParts.length - 1];
        return lastName[0] ? lastName[0].toUpperCase() : "";
    };

    if (!authenticated) {
        return <Navigate to="/login" state={{ from: location }} />;
    }

    return (
        <>
            <Header authenticated={authenticated} currentUser={currentUser} onLogout={onLogout} />
            <div style={{ marginTop: "90px" }}></div>
            <main id="main">
                <div className="wrapper">
                    <nav id="sidebar" className="sidebar js-sidebar">
                        <div className="sidebar-content js-simplebar">
                            <a className="sidebar-brand" href="/profile">
                                <span className="align-middle">USER</span>
                            </a>
                            <SidebarNav />
                        </div>
                    </nav>

                    <div className="main">
                        <main className="profile-main">
                            <div className="profile-header">
                                <div className="user-profile-avatar">
                                    {profileImage ? (
                                        <img
                                            src={`${profileImage}?t=${new Date().getTime()}`}
                                            alt="User Avatar"
                                            className="avatar-image"
                                        />
                                    ) : (
                                        <span className="fs-14">
                                            {getLastNameInitial(currentUser?.name)}
                                        </span>
                                    )}
                                </div>
                                <div className="profile-info">
                                    <h2>{currentUser?.name || "N/A"}</h2>
                                    <p className="profile-email">{currentUser?.email || "N/A"}</p>
                                </div>
                            </div>

                            <div className="card profile-card">
                                <div className="card-body">
                                    <form onSubmit={handleSubmit}>
                                        <div className="row">
                                            <div className="mb-3 col-md-6">
                                                <label className="form-label">Email</label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    value={currentUser?.email || ""}
                                                    disabled
                                                />
                                            </div>
                                            <div className="mb-3 col-md-6">
                                                <label className="form-label">Số điện thoại</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={currentUser?.phone || ""}
                                                    disabled
                                                />
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Họ và Tên</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={currentUser?.name || ""}
                                                disabled
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Địa chỉ</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={address}
                                                onChange={handleAddressChange}
                                                placeholder="Nhập địa chỉ của bạn"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Tải Hình Ảnh</label>
                                            <input
                                                className="form-control"
                                                accept="image/png, image/jpeg"
                                                type="file"
                                                onChange={onFileChange}
                                            />
                                            <small className="form-text text-muted">
                                                Chỉ chấp nhận định dạng JPG, PNG. Kích thước tối đa 1MB.
                                            </small>
                                        </div>
                                        <button type="submit" className="btn btn-primary">
                                            Cập nhật
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default UserProfile;