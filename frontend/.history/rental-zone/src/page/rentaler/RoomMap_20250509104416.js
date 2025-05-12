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
                zoomAnimation: true, // Bật animation zoom để trải nghiệm tốt hơn
                markerZoomAnimation: true,
                preferCanvas: true, // Dùng renderer canvas để cải thiện hiệu suất
            }).setView([21.0285, 105.8542], 12); // Default center (Hà Nội)
            
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
                detectRetina: true, // Đề hiển thị trên màn hình Retina
                tileSize: 256,      // Kích thước tile mặc định
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
                        ? "<span style='color:green; font-weight:bold'>Đã duyệt</span>"
                        : "<span style='color:red; font-weight:bold'>Chưa duyệt</span>"
                }`
            );
            markersRef.current.push(marker);
        });

        // Fit bounds nếu có nhiều phòng
        if (validRooms.length > 1) {
            const bounds = L.latLngBounds(
                validRooms.map(item => [parseFloat(item.latitude), parseFloat(item.longitude)])
            );
            map.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 }); // Giới hạn zoom tối đa khi fitBounds
        } else if (validRooms.length === 1) {
            map.setView([
                parseFloat(validRooms[0].latitude),
                parseFloat(validRooms[0].longitude)
            ], 12); // zoom nhỏ hơn để nhìn rộng hơn
        }

        // invalidateSize sau thời gian ngắn để đảm bảo map được render đúng
        // Thời gian lâu hơn (300ms) để đảm bảo DOM đã cập nhật
        setTimeout(() => {
            if (map) {
                map.invalidateSize({ animate: false, pan: false });
                // Gọi lần nữa sau thời gian dài hơn (đề phòng một số trường hợp chậm)
                setTimeout(() => {
                    if (map) map.invalidateSize({ animate: false });
                }, 500);
            }
        }, 300);

    }, [rooms]);

    // Effect xử lý khi component xuất hiện trong DOM (trở nên visible)
    useEffect(() => {
        // Observer để xử lý khi component trở nên visible trong view
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && mapInstanceRef.current) {
                        // Khi hiển thị trong view, gọi invalidateSize
                        setTimeout(() => {
                            mapInstanceRef.current.invalidateSize();
                        }, 200);
                    }
                });
            },
            { threshold: 0.1 } // Kích hoạt khi ít nhất 10% component hiển thị
        );

        // Bắt đầu quan sát container map
        if (mapRef.current) {
            observer.observe(mapRef.current);
        }

        // Cleanup function
        return () => {
            if (mapRef.current) {
                observer.unobserve(mapRef.current);
            }
        };
    }, []);

    return (
        <div
            ref={mapRef}
            style={{
                width: "100%",
                height: "400px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                overflow: "hidden", // Ẩn overflow nếu có
                position: "relative", // Đảm bảo positioning đúng
                zIndex: 1, // Đủ cao để hiển thị
                backgroundColor: "#f8f9fa", // Màu nền khi loading
            }}
        />
    );
};

export default RoomMap;