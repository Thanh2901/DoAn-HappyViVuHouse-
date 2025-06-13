import { Navigate, useParams } from "react-router-dom";
import { getAccountById, setAuthorization } from "../../services/fetch/ApiUtils";
import { useEffect, useState } from "react";
import SidebarNav from "./SidebarNav";
import Nav from "./Nav";
import { toast } from "react-toastify";


const Authorization = (props) => {
    const { authenticated, role, currentUser, location, onLogout } = props;
    const { userId } = useParams();


    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [roleId, setRoleId] = useState(1);
    const [imageUrl, setImageUrl] = useState();
    const [roleName, setRoleName] = useState();

    const handleSubmit = (event) => {
        event.preventDefault();
        let roleRequest = "";
        if (roleId === 1) {
            roleRequest = { 'roleName' : "USER" };
        } else {
            roleRequest = { 'roleName' : "RENTALER" };
        }

        setAuthorization(userId, roleRequest).then(response => {
            toast.success(response.message)
        }).catch(
            error => {
                toast.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
            }
        )
    };

    useEffect(() => {
        getAccountById(userId).then(response => {
            setEmail(response.email)
            setName(response.name)
            setAddress(response.address)
            setImageUrl(response.imageUrl)
            setPhone(response.phone)
            setRoleName(response.roles[0].name)
            console.log(response);
        }).catch(
            error => {
                toast.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
            }
        )
    }, [userId])



    if (!authenticated) {
        return <Navigate
            to={{
                pathname: "/login-admin",
                state: { from: location }
            }} />;
    }

    console.log("ID", userId)


    return (
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

                <main style={{ margin: "20px 20px 20px 20px" }}>
                    <div className="profile-info">
                        <div className="profile-avatar">
                            {
                                imageUrl ? (
                                    <img src={imageUrl} alt={currentUser.name} />
                                ) : (
                                    <div className="text-avatar">
                                        <span>{name[0]}</span>
                                    </div>
                                )
                            }
                        </div>
                        <div className="profile-name">
                            <h2>{name}</h2>
                            <p className="profile-email">{email}</p>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="mb-3 col-md-6">
                                        <label className="form-label">Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            name="email"
                                            id="inputEmail4"
                                            placeholder="Email"
                                            disabled
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-3 col-md-6">
                                        <label className="form-label">Phone Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="phone"
                                            id="inputPassword4"
                                            placeholder="Phone Number"
                                            disabled
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label" htmlFor="inputAddress">Full Name</label>
                                    <input type="text" className="form-control" name='name' id="inputAddress" placeholder="Peter Parker" value={name}
                                        onChange={(e) => setName(e.target.value)} disabled />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label" htmlFor="inputAddress">Address</label>
                                    <input type="text" className="form-control" name='address' id="inputAddress" placeholder="Address" value={address}
                                        onChange={(e) => setAddress(e.target.value)} disabled />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label" htmlFor="inputAddress">Role</label>
                                    <input type="text" className="form-control" name='role' id="inputAddress" placeholder="Role" value={roleName === "ROLE_RENTALER" ? "Rentaler" : "User"}
                                         disabled />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label" htmlFor="locationId">
                                        Role
                                    </label>
                                    <select
                                        className="form-select"
                                        id="locationId"
                                        name="roleId"
                                        value={roleId}
                                        onChange={(e) => setRoleId(Number(e.target.value))}
                                    >
                                        <option value={1}>User</option>
                                        <option value={3}>Rentaler</option>
                                    </select>
                                </div>
                                <button type="submit" className="btn btn-primary">Submit</button>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}



export default Authorization;