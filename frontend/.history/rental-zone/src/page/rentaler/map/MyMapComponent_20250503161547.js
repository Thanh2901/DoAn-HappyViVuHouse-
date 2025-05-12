import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Sửa lỗi icon cho Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const MyMapComponent = ({ latitude, longitude }) => {
  useEffect(() => {
    // Giải quyết vấn đề invalidate size sau khi render
    const timeoutId = setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, []);

  if (!latitude || !longitude) {
    return <div>Error: Invalid latitude or longitude.</div>;
  }

  const position = [parseFloat(latitude), parseFloat(longitude)];

  return (
    <div className="map-container" style={{ height: "300px", width: "100%", marginTop: "10px" }}>
      <MapContainer 
        center={position} 
        zoom={15} 
        style={{ height: "100%", width: "100%" }}
        whenCreated={(map) => {
          setTimeout(() => {
            map.invalidateSize();
          }, 100);
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            Vị trí đã chọn<br />Lat: {latitude}, Lng: {longitude}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MyMapComponent;