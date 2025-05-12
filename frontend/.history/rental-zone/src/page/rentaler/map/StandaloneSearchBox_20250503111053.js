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
        const res = await fetch(
          `/api/geocode?query=${encodeURIComponent(searchText)}`
        );
        
        const contentType = res.headers.get("content-type");
        
        // Kiểm tra xem response có phải JSON không
        if (!contentType || !contentType.includes("application/json")) {
          const text = await res.text();
          console.error("Response is not JSON:", text);
          throw new Error("Server returned non-JSON response");
        }
        
        const data = await res.json();
        
        // Kiểm tra nếu server trả về lỗi
        if (data.error) {
          throw new Error(data.error);
        }
        
        setResults(Array.isArray(data) ? data : []);
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
        placeholder="Địa chỉ"
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
        ) : null}
      </div>
    </div>
  );
};

export default StandaloneSearchBox;