import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Hàm debounce để giảm số lần gọi cập nhật
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

const RoomMap = ({ rooms }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);

    useEffect(() => {
        // Cleanup bản đồ cũ nếu có
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }

        if (!rooms || rooms.length === 0) return;

        const timer = setTimeout(() => {
            const validRooms = rooms.filter(
                (item) =>
                    item.latitude &&
                    item.longitude &&
                    !isNaN(parseFloat(item.latitude)) &&
                    !isNaN(parseFloat(item.longitude))
            );

            if (validRooms.length === 0 || !mapRef.current) return;

            mapRef.current.style.height = "400px";
            mapRef.current.style.width = "100%";
            mapRef.current.style.position = "relative";
            mapRef.current.style.outline = "none";

            const center = [
                parseFloat(validRooms[0].latitude),
                parseFloat(validRooms[0].longitude),
            ];

            const greenIcon = L.icon({
                iconUrl: "https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-green.png",
                iconSize: [20, 30],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
                shadowSize: [41, 41],
            });

            const redIcon = L.icon({
                iconUrl: "https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-red.png",
                iconSize: [20, 30],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
                shadowSize: [41, 41],
            });

            try {
                const map = L.map(mapRef.current, {
                    attributionControl: false,
                    zoomControl: true,
                    fadeAnimation: false,
                    zoomAnimation: false,
                    markerZoomAnimation: false,
                }).setView(center, 12);

                mapInstanceRef.current = map;

                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    maxZoom: 19,
                }).addTo(map);

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
                });

                const updateMapSize = () => {
                    if (mapInstanceRef.current) {
                        mapInstanceRef.current.invalidateSize({ animate: false, pan: false });
                    }
                };

                const debouncedUpdateSize = debounce(updateMapSize, 250);

                setTimeout(updateMapSize, 500);
                window.addEventListener("resize", debouncedUpdateSize);

                const handleVisibilityChange = () => {
                    if (!document.hidden && mapInstanceRef.current) {
                        setTimeout(updateMapSize, 200);
                    }
                };

                document.addEventListener("visibilitychange", handleVisibilityChange);

                return () => {
                    window.removeEventListener("resize", debouncedUpdateSize);
                    document.removeEventListener("visibilitychange", handleVisibilityChange);
                    if (mapInstanceRef.current) {
                        mapInstanceRef.current.remove();
                        mapInstanceRef.current = null;
                    }
                };
            } catch (error) {
                console.error("Error initializing map:", error);
                if (mapInstanceRef.current) {
                    mapInstanceRef.current.remove();
                    mapInstanceRef.current = null;
                }
            }
        }, 500);

        return () => {
            clearTimeout(timer);
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [rooms]);

    return (
        <div
            ref={mapRef}
            style={{
                width: "100%",
                height: "400px",
                border: "1px solid #ddd",
                borderRadius: "8px",
            }}
        />
    );
};

export default RoomMap;