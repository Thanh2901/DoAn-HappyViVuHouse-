import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png"
});

// Component để xử lý invalidateSize trong map
function MapResizer() {
  const map = useMap();
  
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);
  
  return null;
}

const MyMapComponent = ({ latitude, longitude }) => {
  const mapRef = useRef(null);

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
        ref={mapRef}
      >
        <MapResizer />
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