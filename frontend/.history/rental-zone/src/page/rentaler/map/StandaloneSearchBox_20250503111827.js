import React, { useState, useCallback } from "react";
import { Input, List, message } from "antd";
import debounce from "lodash/debounce";

const StandaloneSearchBox = ({ latLong }) => {
  const [value, setValue] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Debounce để tránh gọi API quá nhiều lần khi người dùng gõ
  const debouncedSearch = useCallback(
    debounce(async (searchText) => {
      if (!searchText) {
        setResults([]);
        return;
      }
      
      try {
        setLoading(true);
        console.log("Đang gửi yêu cầu tìm kiếm:", searchText);
        
        // Sử dụng đường dẫn tuyệt đối nếu proxy không hoạt động
        // const apiUrl = `http://localhost:8080/api/geocode?query=${encodeURIComponent(searchText)}`;
        
        // Sử dụng đường dẫn tương đối nếu đã cấu hình proxy
        const apiUrl = `/api/geocode?query=${encodeURIComponent(searchText)}`;
        
        console.log("URL API:", apiUrl);
        
        const res = await fetch(apiUrl);
        
        console.log("Status code:", res.status);
        console.log("Content-Type:", res.headers.get("content-type"));
        
        // Kiểm tra status code
        if (!res.ok) {
          const errorText = await res.text();
          console.error("Error response:", errorText);
          throw new Error(`API trả về lỗi: ${res.status} ${res.statusText}`);
        }
        
        // Kiểm tra content-type
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await res.text();
          console.error("Response is not JSON:", text.substring(0, 500)); // Log phần đầu response để debug
          throw new Error("Server trả về dữ liệu không phải JSON");
        }
        
        const data = await res.json();
        console.log("Kết quả tìm kiếm:", data);
        
        // Đảm bảo data là một mảng
        if (Array.isArray(data)) {
          setResults(data);
        } else if (data.error) {
          throw new Error(data.error);
        } else {
          setResults([]);
          console.warn("Dữ liệu trả về không phải mảng:", data);
        }
      } catch (error) {
        console.error("Lỗi khi tìm kiếm địa chỉ:", error);
        message.error("Không thể tìm kiếm địa chỉ: " + error.message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500), // Đợi 500ms sau khi người dùng dừng gõ
    []
  );

  const handleSearch = (searchText) => {
    setValue(searchText);
    debouncedSearch(searchText);
  };

  const handleSelect = (item) => {
    setValue(item.display_name);
    setResults([]);
    latLong(parseFloat(item.lat), parseFloat(item.lon), item.display_name);
  };

  return (
    <div style={{ width: "100%" }}>
      <Input.Search
        value={value}
        placeholder="Nhập địa chỉ cần tìm"
        onChange={(e) => handleSearch(e.target.value)}
        loading={loading}
      />
      <div style={{ marginTop: 20 }}>
        {results.length > 0 ? (
          <List
            dataSource={results}
            renderItem={(item) => (
              <List.Item onClick={() => handleSelect(item)} style={{ cursor: "pointer" }}>
                <List.Item.Meta title={item.display_name} />
              </List.Item>
            )}
          />
        ) : (
          loading ? <p>Đang tìm kiếm...</p> : null
        )}
      </div>
    </div>
  );
};

export default StandaloneSearchBox;