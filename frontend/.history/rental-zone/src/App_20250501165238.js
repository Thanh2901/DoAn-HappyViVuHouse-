import { useEffect, useState } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ForgotPassword from "./common/ForgotPassword";
import LoadingIndicator from "./common/LoadingIndicator";
import NotFound from "./common/NotFound";
import ResetPassword from "./common/ResetPassword";
import SuccessConfirmed from "./common/SuccessConfirmed";
import { ACCESS_TOKEN } from "./constants/Connect";
import OAuth2RedirectHandler from "./oauth2/OAuth2RedirectHandler";
import AccountManagement from "./page/admin/AccountManagement";
import Authorization from "./page/admin/Authorization";
import DashboardAdmin from "./page/admin/DashboardAdmin";
import RoomManagementAdmin from "./page/admin/RoomManagerment";
import SendEmail from "./page/admin/SendEmail";
import Login from "./page/login/Login";
import LoginAdmin from "./page/login/LoginAdmin";
import LoginRentaler from "./page/login/LoginRentaler";
import AddContract from "./page/rentaler/AddContract";
import AddElectricAndWater from "./page/rentaler/AddElectricAndWater";
import AddMaintence from "./page/rentaler/AddMaintence";
import AddRoom from "./page/rentaler/AddRoom";
import ChangePassword from "./page/rentaler/ChangePassword";
import Chat from "./page/rentaler/Chat";
import ContractManagement from "./page/rentaler/ContractManagement";
import DashboardRentaler from "./page/rentaler/DashboardRentaler";
import EditContract from "./page/rentaler/EditContract";
import EditElectricAndWater from "./page/rentaler/EditElectricAndWater";
import EditMaintenance from "./page/rentaler/EditMaintence";
import EditRoom from "./page/rentaler/EditRoom";
import ElectricAndWaterManagement from "./page/rentaler/ElectricAndWaterManagement";
import ExportBillRequier from "./page/rentaler/ExportBillRequier";
import ExportCheckoutRoom from "./page/rentaler/ExportCheckoutRoom";
import MaintenceManagement from "./page/rentaler/MaintenceManagement";
import ProfileRentaler from "./page/rentaler/ProfileRentaler";
import RequierManagement from "./page/rentaler/RequierManagement";
import RoomManagement from "./page/rentaler/RoomManagement";
import Signup from "./page/signup/Signup";
import SignupRentaler from "./page/signup/SignupRentaler";
import About from "./page/user/About";
import AgentsGird from "./page/user/AgentsGird";
import AgentSingle from "./page/user/AgentSingle";
import ChangePasswordOfUser from "./page/user/ChangePassword";
import ChatOfUser from "./page/user/ChatOfUser";
import Contact from "./page/user/Contact";
import Follow from "./page/user/Follow";
import Main from "./page/user/Main";
import Profile from "./page/user/Profile";
import RentailHomeDetail from "./page/user/RentailHomeDetail";
import RentalHome from "./page/user/RentalHome";
import RequestManagement from "./page/user/RequestManagement";
import RoomHired from "./page/user/RoomHired";
import SaveBlog from "./page/user/SaveBlog";
import SendRequest from "./page/user/SendRequest";
import ProtectedRoute from "./ProtectedRoute";
import {
  getCurrentAdmin,
  getCurrentRentaler,
  getCurrentUser,
} from "./services/fetch/ApiUtils";
import CameraManagement from "./page/rentaler/CameraManagement";
import AddCamera from "./page/rentaler/AddCamera";
import EditCamera from "./page/rentaler/EditCamera";
import DetailCamera from "./page/rentaler/DetailCamera";
import Playback from "./page/rentaler/Playback";

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN);
    setAuthenticated(false);
    setCurrentUser(null);
    setRole("");
    setUsername("");
    toast.success("Bạn đăng xuất thành công!!!");
  };

  const exitLogoutChangePassword = () => {
    localStorage.removeItem(ACCESS_TOKEN);
    setAuthenticated(false);
    setCurrentUser(null);
    setRole("");
    setUsername("");
  };

  useEffect(() => {
    // Chỉ kiểm tra token khi khởi động ứng dụng
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      // Gọi API để lấy thông tin người dùng
      // Vì không biết vai trò, bạn có thể thử gọi từng endpoint
      const tryFetchUser = async () => {
        try {
          let user;
          // Thử gọi /admin/me
          try {
            user = await getCurrentAdmin();
            setCurrentUser(user);
            setUsername(user.name);
            setRole(user.roles[0].name);
            setAuthenticated(true);
            setLoading(false);
            return;
          } catch (error) {
            // Nếu /admin/me thất bại, thử /rentaler/me
            try {
              user = await getCurrentRentaler();
              setCurrentUser(user);
              setUsername(user.name);
              setRole(user.roles[0].name);
              setAuthenticated(true);
              setLoading(false);
              return;
            } catch (error) {
              // Nếu /rentaler/me thất bại, thử /user/me
              user = await getCurrentUser();
              setCurrentUser(user);
              setUsername(user.name);
              setRole(user.roles[0].name);
              setAuthenticated(true);
              setLoading(false);
            }
          }
        } catch (error) {
          console.error("Failed to load user:", error);
          setLoading(false);
        }
      };

      tryFetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <LoadingIndicator />;
  }

  console.log({ authenticated, username, currentUser, role, loading });

  return (
    <>
      <Router>
        <Routes>
          {/* Các route công khai */}
          <Route
            exact
            path="/"
            element={
              <Main
                authenticated={authenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            exact
            path="/rental-home"
            element={
              <RentalHome
                authenticated={authenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            exact
            path="/rental-home/:id"
            element={
              <RentailHomeDetail
                authenticated={authenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            exact
            path="/angent-gird"
            element={
              <AgentsGird
                authenticated={authenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            exact
            path="/angent-single/:id"
            element={
              <AgentSingle
                authenticated={authenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            exact
            path="/send-request/:id"
            element={
              <SendRequest
                authenticated={authenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            exact
            path="/request-status"
            element={
              <RequestManagement
                authenticated={authenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            exact
            path="/follow-agents"
            element={
              <Follow
                authenticated={authenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            exact
            path="/save-blog"
            element={
              <SaveBlog
                authenticated={authenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            exact
            path="/about-us"
            element={
              <About
                authenticated={authenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            exact
            path="/contact"
            element={
              <Contact
                authenticated={authenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            exact
            path="/forgot-password"
            element={
              <ForgotPassword
                authenticated={authenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            exact
            path="/message"
            element={
              <ChatOfUser
                authenticated={authenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            exact
            path="/room-hired"
            element={
              <RoomHired
                authenticated={authenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            exact
            path="/reset-password/:email"
            element={<ResetPassword />}
          />
          <Route
            exact
            path="/success-comfirmed/:email"
            element={<SuccessConfirmed />}
          />
          <Route
            exact
            path="/profile"
            element={
              <Profile
                authenticated={authenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            exact
            path="/change-password"
            element={
              <ChangePasswordOfUser
                authenticated={authenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            exact
            path="/login"
            element={
              <Login
                authenticated={authenticated}
                setAuthenticated={setAuthenticated}
                setRole={setRole}
                setCurrentUser={setCurrentUser}
                setUsername={setUsername}
              />
            }
          />
          <Route
            exact
            path="/login-rentaler"
            element={
              <LoginRentaler
                authenticated={authenticated}
                currentUser={currentUser}
                role={role}
                setAuthenticated={setAuthenticated}
                setRole={setRole}
                setCurrentUser={setCurrentUser}
                setUsername={setUsername}
              />
            }
          />
          <Route
            exact
            path="/login-admin"
            element={
              <LoginAdmin
                authenticated={authenticated}
                currentUser={currentUser}
                role={role}
                setAuthenticated={setAuthenticated}
                setRole={setRole}
                setCurrentUser={setCurrentUser}
                setUsername={setUsername}
              />
            }
          />
          <Route
            exact
            path="/signup"
            element={
              <Signup
                authenticated={authenticated}
                currentUser={currentUser}
                role={role}
              />
            }
          />
          <Route
            exact
            path="/signup-rentaler"
            element={<SignupRentaler authenticated={authenticated} />}
          />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

          {/* Các route của ADMIN (bọc quyền ROLE_ADMIN) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute
                authenticated={authenticated}
                role={role}
                allowedRole="ROLE_ADMIN"
              >
                <DashboardAdmin
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/room-management"
            element={
              <ProtectedRoute
                authenticated={authenticated}
                role={role}
                allowedRole="ROLE_ADMIN"
              >
                <RoomManagementAdmin
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/authorization/:userId"
            element={
              <ProtectedRoute
                authenticated={authenticated}
                role={role}
                allowedRole="ROLE_ADMIN"
              >
                <Authorization
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/account-management"
            element={
              <ProtectedRoute
                authenticated={authenticated}
                role={role}
                allowedRole="ROLE_ADMIN"
              >
                <AccountManagement
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/send-email/:id"
            element={
              <ProtectedRoute
                authenticated={authenticated}
                role={role}
                allowedRole="ROLE_ADMIN"
              >
                <SendEmail
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          />

          {/* Các route của RENTALER (bọc quyền ROLE_RENTALER) */}
          <Route
            path="/rentaler/change-password"
            element={
              <ProtectedRoute
                authenticated={authenticated}
                role={role}
                allowedRole="ROLE_RENTALER"
              >
                <ChangePassword
                  authenticated={authenticated}
                  exit={exitLogoutChangePassword}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rentaler/profile"
            element={
              <ProtectedRoute
                authenticated={authenticated}
                role={role}
                allowedRole="ROLE_RENTALER"
              >
                <ProfileRentaler
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rentaler"
            element={
              <ProtectedRoute
                authenticated={authenticated}
                role={role}
                allowedRole="ROLE_RENTALER"
              >
                <DashboardRentaler
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rentaler/chat"
            element={
              <ProtectedRoute
                authenticated={authenticated}
                role={role}
                allowedRole="ROLE_RENTALER"
              >
                <Chat
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rentaler/add-room"
            element={
              <ProtectedRoute
                authenticated={authenticated}
                role={role}
                allowedRole="ROLE_RENTALER"
              >
                <AddRoom
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rentaler/edit-room/:id"
            element={
              <ProtectedRoute
                authenticated={authenticated}
                role={role}
                allowedRole="ROLE_RENTALER"
              >
                <EditRoom
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rentaler/add-contract"
            element={
              <ProtectedRoute
                authenticated={authenticated}
                role={role}
                allowedRole="ROLE_RENTALER"
              >
                <AddContract
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rentaler/electric_water/add"
            element={
              <ProtectedRoute
                authenticated={authenticated}
                role={role}
                allowedRole="ROLE_RENTALER"
              >
                <AddElectricAndWater
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rentaler/edit-contract/:id"
            element={
              <ProtectedRoute
                authenticated={authenticated}
                role={role}
                allowedRole="ROLE_RENTALER"
              >
                <EditContract
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rentaler/add-maintenance"
            element={
              <ProtectedRoute
                authenticated={authenticated}
                role={role}
                allowedRole="ROLE_RENTALER"
              >
                <AddMaintence
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rentaler/edit-maintenance/:id"
            element={
              <ProtectedRoute
                authenticated={authenticated}
                role={role}
                allowedRole="ROLE_RENTALER"
              >
                <EditMaintenance
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rentaler/contract-management"
            element={
              <ProtectedRoute
                authenticated={authenticated}
                role={role}
                allowedRole="ROLE_RENTALER"
              >
                <ContractManagement
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rentaler/room-management"
            element={
              <ProtectedRoute
                authenticated={authenticated}
                role={role}
                allowedRole="ROLE_RENTALER"
              >
                <RoomManagement
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rentaler/maintenance-management"
            element={
              <ProtectedRoute
                authenticated={authenticated}
                role={role}
                allowedRole="ROLE_RENTALER"
              >
                <MaintenceManagement
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rentaler/request-management"
            element={
              <ProtectedRoute
                authenticated={authenticated}
                role={role}
                allowedRole="ROLE_RENTALER"
              >
                <RequierManagement
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rentaler/export-bill/:id"
            element={
              <ProtectedRoute
                authenticated={authenticated}
                role={role}
                allowedRole="ROLE_RENTALER"
              >
                <ExportBillRequier
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rentaler/export-contract/:id"
            element={
              <ProtectedRoute
                authenticated={authenticated}
                role={role}
                allowedRole="ROLE_RENTALER"
              >
                <ExportCheckoutRoom
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rentaler/electric_water-management"
            element={
              <ProtectedRoute
                authenticated={authenticated}
                role={role}
                allowedRole="ROLE_RENTALER"
              >
                <ElectricAndWaterManagement
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rentaler/electric_water/edit/:id"
            element={
              <ProtectedRoute
                authenticated={authenticated}
                role={role}
                allowedRole="ROLE_RENTALER"
              >
                <EditElectricAndWater
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rentaler/camera-management"
            element={
              <ProtectedRoute
                authenticated={authenticated}
                role={role}
                allowedRole="ROLE_RENTALER"
              >
                <CameraManagement
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rentaler/camera/add"
            element={
              <ProtectedRoute
                authenticated={authenticated}
                role={role}
                allowedRole="ROLE_RENTALER"
              >
                <AddCamera
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rentaler/camera/edit/:id"
            element={
              <ProtectedRoute
                authenticated={authenticated}
                role={role}
                allowedRole="ROLE_RENTALER"
              >
                <EditCamera
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rentaler/camera/detail/:id"
            element={
              <ProtectedRoute
                authenticated={authenticated}
                role={role}
                allowedRole="ROLE_RENTALER"
              >
                <DetailCamera
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rentaler/playback/:id"
            element={
              <ProtectedRoute
                authenticated={authenticated}
                role={role}
                allowedRole="ROLE_RENTALER"
              >
                <Playback
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rentaler/playback"
            element={
              <ProtectedRoute
                authenticated={authenticated}
                role={role}
                allowedRole="ROLE_RENTALER"
              >
                <Playback
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          />

          {/* Route cho NotFound */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;
