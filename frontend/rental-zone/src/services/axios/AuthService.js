import axios from "axios";
import { ACCESS_TOKEN } from "../../constants/Connect";

const BASE_URL = "http://localhost:8080/";

class AuthService {
    getToken() {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token || token === "undefined") {
            console.error("No valid token found in localStorage");
            return null;
        }
        return token;
    }

    uploadAvatar(formData) {
        const token = this.getToken();
        if (!token) {
            return Promise.reject(new Error("No valid token available"));
        }
        return axios.post(BASE_URL + 'auth/upload-avatar', formData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    uploadProfile(formData) {
        const token = this.getToken();
        if (!token) {
            return Promise.reject(new Error("No valid token available"));
        }
        return axios.post(BASE_URL + 'auth/upload-profile', formData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }
}

export default new AuthService();