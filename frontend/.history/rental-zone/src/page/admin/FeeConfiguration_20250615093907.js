import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import Nav from "./Nav";
import SidebarNav from "./SidebarNav";
import {
  getAllConfigurations,
  updateConfigurations,
} from "../../services/fetch/ApiUtils";

const FeeConfiguration = (props) => {
  const { authenticated, role, currentUser, location, onLogout } = props;
  const [fees, setFees] = useState({
    regularPostingFee: "",
    vipPostingFee: "",
    regularAdminFee: "",
    vipAdminFee: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Fetch initial fee data
  useEffect(() => {
    const fetchFees = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAllConfigurations(0, 10);
        if (!response || !response.content) {
          throw new Error("Invalid response structure");
        }
        const feeData = response.content.reduce((acc, item) => {
          switch (item.key) {
            case "REGULAR_POSTING_FEE":
              acc.regularPostingFee = item.value || "";
              break;
            case "VIP_POSTING_FEE":
              acc.vipPostingFee = item.value || "";
              break;
            case "REGULAR_ADMIN_FEE":
              acc.regularAdminFee = item.value || "";
              break;
            case "VIP_ADMIN_FEE":
              acc.vipAdminFee = item.value || "";
              break;
            default:
              break;
          }
          return acc;
        }, {
          regularPostingFee: "",
          vipPostingFee: "",
          regularAdminFee: "",
          vipAdminFee: "",
        });
        setFees(feeData);
      } catch (err) {
        setError(`Failed to fetch fee configurations: ${err.message}`);
        toast.error("Failed to load fee configurations");
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFees((prev) => ({ ...prev, [name]: value }));
  };

  // Handle save changes
  const handleSave = async () => {
    setSaving(true);
    try {
      const configurations = [
        { key: "REGULAR_POSTING_FEE", value: fees.regularPostingFee },
        { key: "VIP_POSTING_FEE", value: fees.vipPostingFee },
        { key: "REGULAR_ADMIN_FEE", value: fees.regularAdminFee },
        { key: "VIP_ADMIN_FEE", value: fees.vipAdminFee },
      ];
      await updateConfigurations(configurations);
      toast.success("Fees updated successfully!");
    } catch (err) {
      toast.error(`Failed to update fees: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!authenticated) {
    return (
      <Navigate
        to={{
          pathname: "/login-admin",
          state: { from: location },
        }}
      />
    );
  }

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

        <main className="content">
          <div className="container-fluid p-0">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title fs-5">Fee Configuration</h5>
                <h6 className="card-subtitle text-muted">
                  Manage posting and admin fees for regular and VIP rooms.
                </h6>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-10">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading configurations...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-10">
                    <div className="text-danger mb-4">{error}</div>
                    <button
                      onClick={() => window.location.reload()}
                      className="btn btn-primary"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Regular Posting Fee (VND)</label>
                          <input
                            type="number"
                            name="regularPostingFee"
                            value={fees.regularPostingFee}
                            onChange={handleChange}
                            className="form-control"
                            min="0"
                            required
                            placeholder="Enter regular posting fee"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">VIP Posting Fee (VND)</label>
                          <input
                            type="number"
                            name="vipPostingFee"
                            value={fees.vipPostingFee}
                            onChange={handleChange}
                            className="form-control"
                            min="0"
                            required
                            placeholder="Enter VIP posting fee"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Regular Admin Fee (VND)</label>
                          <input
                            type="number"
                            name="regularAdminFee"
                            value={fees.regularAdminFee}
                            onChange={handleChange}
                            className="form-control"
                            min="0"
                            required
                            placeholder="Enter regular admin fee"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">VIP Admin Fee (VND)</label>
                          <input
                            type="number"
                            name="vipAdminFee"
                            value={fees.vipAdminFee}
                            onChange={handleChange}
                            className="form-control"
                            min="0"
                            required
                            placeholder="Enter VIP admin fee"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row mt-4">
                      <div className="col-12 text-end">
                        <button
                          onClick={handleSave}
                          disabled={
                            saving ||
                            !fees.regularPostingFee ||
                            !fees.vipPostingFee ||
                            !fees.regularAdminFee ||
                            !fees.vipAdminFee
                          }
                          className="btn btn-success"
                        >
                          {saving ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Saving...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FeeConfiguration;