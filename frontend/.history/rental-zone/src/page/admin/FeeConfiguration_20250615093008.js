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
  const [saving, setSaving] = useState(false);

  // Fetch initial fee data
  useEffect(() => {
    const fetchFees = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log("Fetching configurations..."); // Debug log
        const response = await getAllConfigurations(0, 10);
        console.log("API Response:", response); // Debug log
        
        // Check if response has expected structure
        if (!response || !response.content) {
          throw new Error("Invalid response structure");
        }
        
        const feeData = response.content.reduce((acc, item) => {
          console.log("Processing item:", item); // Debug log
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
        
        console.log("Processed fee data:", feeData); // Debug log
        setFees(feeData);
        
      } catch (err) {
        console.error("Error fetching configurations:", err); // Debug log
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

      console.log("Saving configurations:", configurations); // Debug log
      await updateConfigurations(configurations);
      toast.success("Fees updated successfully!");
      
    } catch (err) {
      console.error("Error saving configurations:", err); // Debug log
      toast.error(`Failed to update fees: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2">Loading configurations...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-10">
          <div className="text-red-500 mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
              min="0"
              required
              placeholder="Enter regular posting fee"
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
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
              min="0"
              required
              placeholder="Enter VIP posting fee"
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
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
              min="0"
              required
              placeholder="Enter regular admin fee"
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
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
              min="0"
              required
              placeholder="Enter VIP admin fee"
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving || (
              !fees.regularPostingFee ||
              !fees.vipPostingFee ||
              !fees.regularAdminFee ||
              !fees.vipAdminFee
            )}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeeConfiguration;