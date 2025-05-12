import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const MyMapComponent = ({ latitude, longitude }) => {
  if (!latitude || !longitude) {
    return <div>Error: Invalid latitude or longitude.</div>;
  }

  return (
    <MapContainer center={[latitude, longitude]} zoom={13} style={{ height: "400px", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[latitude, longitude]}>
        <Popup>
          Vị trí đã chọn<br />Lat: {latitude}, Lng: {longitude}
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default MyMapComponent;