import { getByMonth } from "../services/fetch/ApiUtils";

export const RevenueData = async () => {
  try {
    const response = await getByMonth();
    const revenueData = response.map((data, index) => ({
      month: data.month,
      revenue: data.revenue
    }));
    return revenueData;
  } catch (error) {
    console.log(error);
    return []; // Return an empty array or handle the error accordingly
  }
};