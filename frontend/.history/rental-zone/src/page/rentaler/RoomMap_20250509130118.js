import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const RoomMap = ({ rooms }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);

    // Khởi tạo map chỉ 1 lần
    useEffect(() => {
        if (!mapRef.current) return;

        if (!mapInstanceRef.current) {
            mapInstanceRef.current = L.map(mapRef.current, {
                attributionControl: false,
                zoomControl: true,
                fadeAnimation: false,
                zoomAnimation: false,
                markerZoomAnimation: false,
            }).setView([21.0285, 105.8542], 12); // default center (Hà Nội)
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
                detectRetina: true, // Bật retina cho tiles nét hơn
            }).addTo(mapInstanceRef.current);
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Cập nhật marker khi rooms thay đổi
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        // Xóa marker cũ
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        const validRooms = (rooms || []).filter(
            (item) =>
                item.latitude &&
                item.longitude &&
                !isNaN(parseFloat(item.latitude)) &&
                !isNaN(parseFloat(item.longitude))
        );

        if (validRooms.length === 0) return;

        const greenIcon = L.icon({
            iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png", // Icon 2x
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
            shadowSize: [41, 41],
        });

        const redIcon = L.icon({
            iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png", // Icon 2x
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
            shadowSize: [41, 41],
        });

        validRooms.forEach((item) => {
            const isApproved =
                item.isApprove === true ||
                item.isApprove === "true" ||
                item.isApprove === 1;
            const icon = isApproved ? greenIcon : redIcon;
            const marker = L.marker(
                [parseFloat(item.latitude), parseFloat(item.longitude)],
                { icon }
            ).addTo(map);
            marker.bindPopup(
                `<b>${item.title}</b><br>${item.address || ""}<br>Giá: ${
                    item.price
                        ? item.price.toLocaleString("vi-VN", {
                              style: "currency",
                              currency: "VND",
                          })
                        : ""
                }<br>Trạng thái: ${
                    isApproved
                        ? "<span style='color:green'>Đã duyệt</span>"
                        : "<span style='color:red'>Chưa duyệt</span>"
                }`
            );
            markersRef.current.push(marker);
        });

        // Fit bounds nếu có nhiều phòng
        if (validRooms.length > 1) {
            const bounds = L.latLngBounds(
                validRooms.map(item => [parseFloat(item.latitude), parseFloat(item.longitude)])
            );
            map.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });
        } else if (validRooms.length === 1) {
            map.setView(
                [parseFloat(validRooms[0].latitude), parseFloat(validRooms[0].longitude)],
                12
            );
        }

        map.invalidateSize(); // Gọi ngay lập tức để đảm bảo tiles hiển thị đúng
    }, [rooms]);

    return (
        <div
            ref={mapRef}
            style={{
                width: "100%",
                height: "400px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                imageRendering: "auto", // Đảm bảo chất lượng hình ảnh
            }}
        />
    );
};

export default RoomMap;