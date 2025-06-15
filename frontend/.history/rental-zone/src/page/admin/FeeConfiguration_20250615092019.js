import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  getAllConfigurations,
  updateConfigurations,
} from "../../services/fetch/ApiUtils";

const FeeConfiguration = () => {
  const [fees, setFees] = useState({
    regularPostingFee: "",
    vipPostingFee: "",
    regularAdminFee: "",
    vipAdminFee: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial fee data
  useEffect(() => {
    const fetchFees = async () => {
      try {
        const response = await getAllConfigurations(0, 10); // Lấy trang đầu tiên, 10 mục mỗi trang
        const feeData = response.content.reduce((acc, item) => {
          switch (item.key) {
            case "REGULAR_POSTING_FEE":
              acc.regularPostingFee = item.value;
              break;
            case "VIP_POSTING_FEE":
              acc.vipPostingFee = item.value;
              break;
            case "REGULAR_ADMIN_FEE":
              acc.regularAdminFee = item.value;
              break;
            case "VIP_ADMIN_FEE":
              acc.vipAdminFee = item.value;
              break;
            default:
              break;
          }
          return acc;
        }, {});
        setFees(feeData);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch fee configurations.");
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
      toast.error("Failed to update fees.");
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Fee Configuration</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Regular Posting Fee (VND)
            </label>
            <input
              type="number"
              name="regularPostingFee"
              value={fees.regularPostingFee}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              min="0"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              VIP Posting Fee (VND)
            </label>
            <input
              type="number"
              name="vipPostingFee"
              value={fees.vipPostingFee}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              min="0"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Regular Admin Fee (VND)
            </label>
            <input
              type="number"
              name="regularAdminFee"
              value={fees.regularAdminFee}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              min="0"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              VIP Admin Fee (VND)
            </label>
            <input
              type="number"
              name="vipAdminFee"
              value={fees.vipAdminFee}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              min="0"
              required
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={
              !fees.regularPostingFee ||
              !fees.vipPostingFee ||
              !fees.regularAdminFee ||
              !fees.vipAdminFee
            }
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeeConfiguration;