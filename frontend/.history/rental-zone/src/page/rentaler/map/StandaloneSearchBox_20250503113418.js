import React, { useState, useCallback } from "react";
import { Input, List, message, Spin } from "antd";
import debounce from "lodash/debounce";
import { geocodingService } from "../../../services/axios/MapService";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const StandaloneSearchBox = ({ latLong }) => {
  const [value, setValue] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  // Debounce để tránh gọi API quá nhiều lần khi người dùng gõ
  const debouncedSearch = useCallback(
    debounce(async (searchText) => {
      if (!searchText) {
        setResults([]);
        setSelected(null);
        return;
      }
      try {
        setLoading(true);
        const data = await geocodingService.search(searchText);
        if (Array.isArray(data)) {
          setResults(data);
        } else {
          setResults([]);
        }
      } catch (error) {
        setResults([]);
        setSelected(null);
        message.error("Không thể tìm kiếm địa chỉ: " + (error.message || "Lỗi không xác định"));
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  const handleSearch = (searchText) => {
    setValue(searchText);
    debouncedSearch(searchText);
  };

  const handleSelect = (item) => {
    setValue(item.display_name);
    setResults([]);
    setSelected(item);
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
            dataSource={results}
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
          />
        ) : value ? (
          <div style={{ padding: '10px', color: '#999', textAlign: 'center' }}>
            Không tìm thấy kết quả
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default StandaloneSearchBox;