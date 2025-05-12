import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Sử dụng Leaflet trực tiếp thay vì react-leaflet để tránh các vấn đề tương thích
const SimpleMapComponent = ({ latitude, longitude }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    // Nếu không có tọa độ, mặc định là Hà Nội
    const lat = latitude && longitude
      ? parseFloat(latitude)
      : 21.028511; // Hà Nội
    const lng = latitude && longitude
      ? parseFloat(longitude)
      : 105.804817; // Hà Nội

    if (!mapContainerRef.current) {
      return;
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    const houseIcon = L.icon({
      iconUrl: "https://cdn-icons-png.flaticon.com/512/69/69524.png",
      iconSize: [20, 20],
      iconAnchor: [19, 38],
      popupAnchor: [0, -38],
      shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      shadowSize: [30, 30],
      shadowAnchor: [13, 41]
    });

    const map = L.map(mapContainerRef.current).setView([lat, lng], 12);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    // Chỉ thêm marker nếu có tọa độ truyền vào
    if (latitude && longitude) {
      const marker = L.marker([lat, lng], { icon: houseIcon }).addTo(map);
      marker.bindPopup(`<b>Vị trí đã chọn</b><br>Lat: ${lat}, Lng: ${lng}`).openPopup();
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 300);

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