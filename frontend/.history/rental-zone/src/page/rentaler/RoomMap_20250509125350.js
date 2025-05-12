import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Helper function để tạo custom pane với zIndex
const createCustomPane = (map, name, zIndex) => {
    const pane = map.createPane(name);
    pane.style.zIndex = zIndex;
    return pane;
};

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
                zoomAnimation: true,
                markerZoomAnimation: true,
                preferCanvas: true,
            }).setView([21.0285, 105.8542], 12);

            // Chỉ dùng 1 tileLayer để không che marker
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                detectRetina: true
            }).addTo(mapInstanceRef.current);

            // invalidateSize ngay sau khi tạo map
            setTimeout(() => {
                if (mapInstanceRef.current) {
                    mapInstanceRef.current.invalidateSize();
                }
            }, 100);
        }

        // resize window
        const handleResize = () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.invalidateSize();
            }
        };
        window.addEventListener('resize', handleResize);

        // visibility thay đổi
        const handleVisibilityChange = () => {
            if (!document.hidden && mapInstanceRef.current) {
                setTimeout(() => {
                    mapInstanceRef.current.invalidateSize();
                }, 100);
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
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
            iconUrl: "https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-green.png",
            iconSize: [30, 48],
            iconAnchor: [15, 48],
            popupAnchor: [1, -40],
            shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
            shadowSize: [50, 50],
            className: 'marker-icon'
        });

        const redIcon = L.icon({
            iconUrl: "https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-red.png",
            iconSize: [30, 48],
            iconAnchor: [15, 48],
            popupAnchor: [1, -40],
            shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
            shadowSize: [50, 50],
            className: 'marker-icon'
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

            // Nội dung popup với font size lớn hơn
            const popupContent = `
                <div class="custom-popup">
                    <h3>${item.title}</h3>
                    <p class="address">${item.address || ""}</p>
                    <p class="price"><strong>Giá:</strong> ${
                        item.price
                            ? item.price.toLocaleString("vi-VN", {
                                style: "currency",
                                currency: "VND",
                            })
                            : "Không có thông tin"
                    }</p>
                    <p class="status"><strong>Trạng thái:</strong> ${
                        isApproved
                            ? "<span class='status-approved'>Đã duyệt</span>"
                            : "<span class='status-pending'>Chưa duyệt</span>"
                    }</p>
                </div>
            `;

            marker.bindPopup(popupContent, {
                minWidth: 300,
                maxWidth: 380,
                className: "large-popup",
                autoPan: true,
                closeButton: true,
                autoClose: false,
                closeOnClick: false
            });

            markersRef.current.push(marker);
        });

        // Fit bounds nếu có nhiều phòng
        if (validRooms.length > 1) {
            const bounds = L.latLngBounds(
                validRooms.map(item => [parseFloat(item.latitude), parseFloat(item.longitude)])
            );
            map.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });
        } else if (validRooms.length === 1) {
            map.setView([
                parseFloat(validRooms[0].latitude),
                parseFloat(validRooms[0].longitude)
            ], 12);
        }

        setTimeout(() => {
            if (map) {
                map.invalidateSize({ animate: false, pan: false });
                setTimeout(() => {
                    if (map) map.invalidateSize({ animate: false });
                }, 500);
            }
        }, 300);

    }, [rooms]);

    // Effect xử lý khi component xuất hiện trong DOM (trở nên visible)
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && mapInstanceRef.current) {
                        setTimeout(() => {
                            mapInstanceRef.current.invalidateSize();
                        }, 200);
                    }
                });
            },
            { threshold: 0.1 }
        );

        if (mapRef.current) {
            observer.observe(mapRef.current);
        }

        return () => {
            if (mapRef.current) {
                observer.unobserve(mapRef.current);
            }
        };
    }, []);

    return (
        <>
            <div
                ref={mapRef}
                style={{
                    width: "100%",
                    height: "400px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    overflow: "hidden",
                    position: "relative",
                    zIndex: 1,
                    backgroundColor: "#f8f9fa",
                }}
            />
            <style>
                {`
                .leaflet-popup-content {
                    font-size: 18px !important;
                    line-height: 1.6 !important;
                    margin: 14px !important;
                }
                .custom-popup h3 {
                    font-size: 22px !important;
                    font-weight: bold;
                    margin: 0 0 12px 0;
                    color: #333;
                    border-bottom: 2px solid #eee;
                    padding-bottom: 6px;
                }
                .custom-popup p {
                    font-size: 18px !important;
                    margin: 8px 0;
                }
                .custom-popup .address {
                    font-size: 18px !important;
                    margin-bottom: 12px;
                    color: #555;
                }
                .custom-popup .price {
                    font-size: 20px !important;
                    margin: 10px 0;
                }
                .custom-popup .status {
                    margin-top: 12px;
                    font-size: 18px !important;
                }
                .custom-popup .status-approved {
                    color: green;
                    font-weight: bold;
                    font-size: 20px !important;
                    background-color: rgba(0,255,0,0.1);
                    padding: 2px 6px;
                    border-radius: 4px;
                }
                .custom-popup .status-pending {
                    color: red;
                    font-weight: bold;
                    font-size: 20px !important;
                    background-color: rgba(255,0,0,0.1);
                    padding: 2px 6px;
                    border-radius: 4px;
                }
                .large-popup .leaflet-popup-content-wrapper {
                    font-size: 18px !important;
                    border-radius: 10px;
                    box-shadow: 0 4px 16px rgba(0,0,0,0.3);
                    min-width: 300px;
                    max-width: 380px !important;
                }
                .leaflet-popup-close-button {
                    font-size: 26px !important;
                    width: 30px !important;
                    height: 30px !important;
                    padding: 4px !important;
                    color: #555 !important;
                    font-weight: bold !important;
                }
                .leaflet-popup-tip {
                    width: 20px !important;
                    height: 20px !important;
                }
                .leaflet-control-zoom a {
                    font-size: 22px !important;
                    width: 40px !important;
                    height: 40px !important;
                    line-height: 40px !important;
                }
                .leaflet-container .leaflet-control-attribution {
                    font-size: 14px !important;
                }
                .leaflet-marker-icon {
                    transition: transform 0.2s ease;
                }
                .leaflet-marker-icon:hover {
                    transform: scale(1.2);
                    z-index: 1000 !important;
                }
                `}
            </style>
        </>
    );
};

export default RoomMap;