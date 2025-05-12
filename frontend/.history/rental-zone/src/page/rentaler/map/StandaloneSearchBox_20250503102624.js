import React, { useState } from "react";
import { Input, List } from "antd";

const StandaloneSearchBox = ({ latLong }) => {
  const [value, setValue] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (val) => {
    setValue(val);
    if (!val) {
      setResults([]);
      return;
    }
    setLoading(true);
    const res = await fetch(
      `https://cors-anywhere.herokuapp.com/https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}`
    );
    const data = await res.json();
    setResults(data);
    setLoading(false);
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
        <List
          dataSource={results}
          renderItem={(item) => (
            <List.Item onClick={() => handleSelect(item)} style={{ cursor: "pointer" }}>
              <List.Item.Meta title={item.display_name} />
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};

export default StandaloneSearchBox;