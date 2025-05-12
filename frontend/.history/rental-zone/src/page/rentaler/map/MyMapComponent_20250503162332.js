import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Sử dụng Leaflet trực tiếp thay vì react-leaflet để tránh các vấn đề tương thích
const SimpleMapComponent = ({ latitude, longitude }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    // Kiểm tra điều kiện hợp lệ
    if (!latitude || !longitude || !mapContainerRef.current) {
      return;
    }

    // Parse các giá trị thành số
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // Nếu đã có instance map, hủy nó để tạo mới
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    // Fix icon issues
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png"
    });

    // Tạo một instance map mới
    const map = L.map(mapContainerRef.current).setView([lat, lng], 15);
    mapInstanceRef.current = map;

    // Thêm layer bản đồ
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    // Thêm marker
    const marker = L.marker([lat, lng]).addTo(map);
    marker.bindPopup(`<b>Vị trí đã chọn</b><br>Lat: ${lat}, Lng: ${lng}`).openPopup();

    // Đảm bảo bản đồ hiển thị đúng kích thước
    setTimeout(() => {
      map.invalidateSize();
    }, 300);

    // Cleanup khi component unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude]);

  return (
    <div 
      ref={mapContainerRef} 
      style={{ 
        height: "300px", 
        width: "100%", 
        marginTop: "10px",
        border: "1px solid #ddd",
        borderRadius: "4px" 
      }}
    />
  );
};

export default SimpleMapComponent;