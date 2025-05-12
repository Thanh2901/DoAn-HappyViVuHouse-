import React, { useState, useCallback } from "react";
import { Input, List, message, Spin } from "antd";
import debounce from "lodash/debounce";
import { geocodingService } from "../../../services/axios/MapService"; // Đường dẫn có thể cần điều chỉnh

const StandaloneSearchBox = ({ latLong }) => {
  const [value, setValue] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounce để tránh gọi API quá nhiều lần khi người dùng gõ
  const debouncedSearch = useCallback(
    debounce(async (searchText) => {
      if (!searchText) {
        setResults([]);
        setHasSearched(false);
        return;
      }
      
      try {
        setLoading(true);
        setHasSearched(true);
        console.log("Đang tìm kiếm địa chỉ:", searchText);
        
        const data = await geocodingService.search(searchText);
        console.log("Kết quả tìm kiếm:", data);
        
        // Đảm bảo data là một mảng
        if (Array.isArray(data)) {
          setResults(data);
        } else {
          console.warn("Dữ liệu trả về không phải mảng:", data);
          setResults([]);
        }
      } catch (error) {
        console.error("Lỗi khi tìm kiếm địa chỉ:", error);
        
        // Hiển thị thông báo lỗi chi tiết hơn
        if (error.response) {
          message.error(`Lỗi từ server: ${error.response.status} - ${error.response.statusText}`);
        } else if (error.request) {
          message.error("Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối mạng.");
        } else {
          message.error("Không thể tìm kiếm địa chỉ: " + error.message);
        }
        
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500), // Đợi 500ms sau khi người dùng dừng gõ
    []
  );

  const handleSearch = (searchText) => {
    setValue(searchText);
    if (!searchText) {
      setResults([]);
      setHasSearched(false);
    } else {
      debouncedSearch(searchText);
    }
  };

  const handleSelect = (item) => {
    setValue(item.display_name);
    setResults([]);
    setHasSearched(false);
    latLong(parseFloat(item.lat), parseFloat(item.lon), item.display_name);
  };

  return (
    <div style={{ width: "100%" }}>
      <Input.Search
        value={value}
        placeholder="Nhập địa chỉ cần tìm"
        onChange={(e) => handleSearch(e.target.value)}
        loading={loading}
        allowClear
      />
      
      <div style={{ marginTop: 20 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Spin tip="Đang tìm kiếm..." />
          </div>
        ) : results.length > 0 ? (
          <List
            dataSource={results.slice(0, 5)}
            renderItem={(item) => (
              <List.Item 
                onClick={() => handleSelect(item)} 
                style={{ 
                  cursor: "pointer",
                  padding: '10px',
                  transition: 'background-color 0.3s'
                }}
                className="address-item"
              >
                <List.Item.Meta 
                  title={item.display_name} 
                  description={`Loại: ${item.type || 'Không xác định'}`}
                />
              </List.Item>
            )}
            style={{
              maxHeight: 250,
              overflowY: results.length > 5 ? "auto" : "unset"
            }}
          />
        ) : hasSearched && value ? (
          <div style={{ padding: '10px', color: '#999', textAlign: 'center' }}>
            Không tìm thấy kết quả
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default StandaloneSearchBox;