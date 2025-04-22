package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.CommentDTO;
import org.example.backend.dto.request.AssetRequest;
import org.example.backend.dto.request.RoomRequest;
import org.example.backend.enums.RoomStatus;
import org.example.backend.security.CurrentUser;
import org.example.backend.security.UserPrincipal;
import org.example.backend.service.RoomService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/room")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @GetMapping("/{userId}/rentaler")
    public ResponseEntity<?> getAllRoomOfUserId(@PathVariable Long userId,
                                                @RequestParam Integer pageNo,
                                                @RequestParam Integer pageSize) {
        return ResponseEntity.ok(roomService.getRoomByUserId(userId, pageNo, pageSize));
    }

    // default sort title asc
    @GetMapping
    public ResponseEntity<?> getRoomByRentaler(@RequestParam(required = false) String title,
                                               @RequestParam Integer pageNo,
                                               @RequestParam Integer pageSize) {
        return ResponseEntity.ok(roomService.getRoomByRentaler(title, pageNo, pageSize));
    }

    @GetMapping("/rent-home")
    public ResponseEntity<?> getRentOfHome() {
        return ResponseEntity.ok(roomService.getRentOfHome());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRoomById(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.getRoomById(id));
    }

    @PostMapping("/{id}")
    public ResponseEntity<?> disableRoom(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.disableRoom(id));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateRoomInfo(@PathVariable Long id, MultipartHttpServletRequest request) {
        try {
            RoomRequest roomRequest = putRoomRequest(request);
            return ResponseEntity.ok(roomService.updateRoomInfo(id, roomRequest));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addRoom(MultipartHttpServletRequest request) {
        try {
            RoomRequest roomRequest = putRoomRequest(request);
            System.out.println("RoomRequest: " + roomRequest);
            return ResponseEntity.ok(roomService.addNewRoom(roomRequest));
        } catch (IllegalArgumentException e) {
            System.out.println("Validation error: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            System.out.println("Unexpected error: " + e.getMessage());
            return ResponseEntity.badRequest().body("Unexpected error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> removeRoom(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.removeRoom(id));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> isApprove(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.isApproveRoom(id));
    }

    @PostMapping("/{id}/checkout")
    public ResponseEntity<?> checkoutRoom(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.checkoutRoom(id));
    }

    @GetMapping("/{roomId}/comments")
    public List<CommentDTO> getAllComment(@PathVariable Long roomId) {
        return roomService.getAllCommentRoom(roomId);
    }

    @PostMapping("/{roomId}/comments")
    public ResponseEntity<?> addComment(@CurrentUser UserPrincipal userPrincipal, @PathVariable Long roomId,
                                        @RequestBody CommentDTO commentDTO) {
        System.out.println(commentDTO.getRateRating());
        return roomService.addComment(userPrincipal.getId(), commentDTO).equals("Thêm bình luận thành công")
                ? ResponseEntity.ok("Thêm bình luận thành công")
                : new ResponseEntity<>("Thêm bình luận thất bại", HttpStatus.BAD_REQUEST);
    }

    private RoomRequest putRoomRequest(MultipartHttpServletRequest request) {
        System.out.println("Request parameters: " + request.getParameterMap());

        String title = request.getParameter("title");
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Title is required");
        }

        String description = request.getParameter("description");

        String priceStr = request.getParameter("price");
        BigDecimal price;
        try {
            price = (priceStr != null && !priceStr.trim().isEmpty()) ? BigDecimal.valueOf(Double.parseDouble(priceStr)) : BigDecimal.ZERO;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid price format: " + priceStr);
        }

        String latitudeStr = request.getParameter("latitude");
        Double latitude;
        try {
            latitude = (latitudeStr != null && !latitudeStr.trim().isEmpty()) ? Double.parseDouble(latitudeStr) : 0.0;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid latitude format: " + latitudeStr);
        }

        String longitudeStr = request.getParameter("longitude");
        Double longitude;
        try {
            longitude = (longitudeStr != null && !longitudeStr.trim().isEmpty()) ? Double.parseDouble(longitudeStr) : 0.0;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid longitude format: " + longitudeStr);
        }

        String address = request.getParameter("address");

        String locationIdStr = request.getParameter("locationId");
        Long locationId;
        try {
            locationId = (locationIdStr != null && !locationIdStr.trim().isEmpty()) ? Long.parseLong(locationIdStr) : null;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid locationId format: " + locationIdStr);
        }
        if (locationId == null) {
            throw new IllegalArgumentException("Location ID is required");
        }

        String categoryIdStr = request.getParameter("categoryId");
        Long categoryId;
        try {
            categoryId = (categoryIdStr != null && !categoryIdStr.trim().isEmpty()) ? Long.parseLong(categoryIdStr) : null;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid categoryId format: " + categoryIdStr);
        }
        if (categoryId == null) {
            throw new IllegalArgumentException("Category ID is required");
        }

        String waterCostStr = request.getParameter("waterCost");
        BigDecimal waterCost;
        try {
            waterCost = (waterCostStr != null && !waterCostStr.trim().isEmpty()) ? BigDecimal.valueOf(Double.parseDouble(waterCostStr)) : BigDecimal.ZERO;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid waterCost format: " + waterCostStr);
        }

        String publicElectricCostStr = request.getParameter("publicElectricCost");
        BigDecimal publicElectricCost;
        try {
            publicElectricCost = (publicElectricCostStr != null && !publicElectricCostStr.trim().isEmpty()) ? BigDecimal.valueOf(Double.parseDouble(publicElectricCostStr)) : BigDecimal.ZERO;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid publicElectricCost format: " + publicElectricCostStr);
        }

        String internetCostStr = request.getParameter("internetCost");
        BigDecimal internetCost;
        try {
            internetCost = (internetCostStr != null && !internetCostStr.trim().isEmpty()) ? BigDecimal.valueOf(Double.parseDouble(internetCostStr)) : BigDecimal.ZERO;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid internetCost format: " + internetCostStr);
        }

        // Xử lý assets động (không cần tham số asset)
        List<AssetRequest> assets = new ArrayList<>();
        int i = 0;
        while (true) {
            String assetName = request.getParameter("assets[" + i + "][name]");
            String assetNumberStr = request.getParameter("assets[" + i + "][number]");
            if (assetName == null || assetNumberStr == null) break;
            try {
                Integer assetNumber = Integer.parseInt(assetNumberStr);
                assets.add(new AssetRequest(assetName, assetNumber));
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("Invalid asset number format at index " + i + ": " + assetNumberStr);
            }
            i++;
        }

        String statusParam = request.getParameter("status");
        RoomStatus status;
        try {
            status = (statusParam != null && !statusParam.trim().isEmpty())
                    ? RoomStatus.valueOf(statusParam)
                    : RoomStatus.ROOM_RENT; // Mặc định là "Chưa thuê"
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid room status value: " + statusParam);
        }

        List<MultipartFile> files = request.getFiles("files");

        return new RoomRequest(title, description, price, latitude, longitude, address, locationId, categoryId,
                status, assets, files, waterCost, publicElectricCost, internetCost);
    }

    // room order by price desc
    @GetMapping("/filter/order/price-desc")
    public ResponseEntity<?> getRoomRentalerByPriceDesc(@RequestParam(required = false) String title,
                                                        @RequestParam Integer pageNo,
                                                        @RequestParam Integer pageSize) {
        return ResponseEntity.ok(roomService.getRoomRentalerByPriceDesc(title, pageNo, pageSize));
    }

    // room order by price asc
    @GetMapping("/filter/order/price-asc")
    public ResponseEntity<?> getRoomRentalerByPriceAsc(@RequestParam(required = false) String title,
                                                        @RequestParam Integer pageNo,
                                                        @RequestParam Integer pageSize) {
        return ResponseEntity.ok(roomService.getRoomRentalerByPriceAsc(title, pageNo, pageSize));
    }

    // priority: status: CHUA THUE
    @GetMapping("/filter/order/status-asc")
    public ResponseEntity<?> getRoomRentalerByStatusAsc(@RequestParam(required = false) String title,
                                                       @RequestParam Integer pageNo,
                                                       @RequestParam Integer pageSize) {
        return ResponseEntity.ok(roomService.getRoomRentalerByStatusAsc(title, pageNo, pageSize));
    }

    // priority: status: DA THUE
    @GetMapping("/filter/order/status-desc")
    public ResponseEntity<?> getRoomRentalerByStatusDesc(@RequestParam(required = false) String title,
                                                         @RequestParam Integer pageNo,
                                                         @RequestParam Integer pageSize) {
        return ResponseEntity.ok(roomService.getRoomRentalerByStatusDesc(title, pageNo, pageSize));
    }

    // priority: isApprove: CHUA DUYET
    @GetMapping("/filter/order/approve-asc")
    public ResponseEntity<?> getRoomRentalerByApproveAsc(@RequestParam(required = false) String title,
                                                        @RequestParam Integer pageNo,
                                                        @RequestParam Integer pageSize) {
        return ResponseEntity.ok(roomService.getRoomRentalerByApproveAsc(title, pageNo, pageSize));
    }


    // priority: isApprove: DA DUYET
    @GetMapping("/filter/order/approve-desc")
    public ResponseEntity<?> getRoomRentalerByApproveDesc(@RequestParam(required = false) String title,
                                                         @RequestParam Integer pageNo,
                                                         @RequestParam Integer pageSize) {
        return ResponseEntity.ok(roomService.getRoomRentalerByApproveDesc(title, pageNo, pageSize));
    }
}