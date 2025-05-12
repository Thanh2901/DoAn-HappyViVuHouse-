import axios from 'axios';

// Tạo instance của axios với cấu hình mặc định
const apiService = axios.create({
  baseURL: process.env.NODE_ENV === 'development' 
    ? '' // Để trống để sử dụng proxy trong development
    : 'http://your-production-api-url.com', // URL cho môi trường production
  timeout: 10000, // Timeout 10 giây
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor để xử lý lỗi
apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    // Kiểm tra nếu response có dữ liệu
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      console.error('No response received:', error.request);
    } else {
      // Có lỗi khi thiết lập request
      console.error('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Service riêng cho các cuộc gọi liên quan đến geocoding
const geocodingService = {
  search: async (query) => {
    try {
      const response = await apiService.get(`/api/geocode?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Geocoding search error:', error);
      throw error;
    }
  }
};

export { apiService, geocodingService };