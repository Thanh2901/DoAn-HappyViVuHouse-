import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function ProtectedRoute({ children, authenticated, role, allowedRole }) {
    if (!authenticated) {
        toast.error("Vui lòng đăng nhập để truy cập trang này!", {
            toastId: "not-authenticated", // Gán toastId để tránh trùng lặp
        });
        return <Navigate to="/login" />;
    }

    if (role !== allowedRole) {
        toast.error("Bạn không có quyền truy cập trang này!", {
            toastId: "not-authorized", // Gán toastId để tránh trùng lặp
        });
        return <Navigate to="/" />;
    }

    return children;
}

export default ProtectedRoute;