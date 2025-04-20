package org.example.backend.controller;

import java.math.BigDecimal;

import org.example.backend.service.BlogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class BlogController {
    private final BlogService blogService;

    @GetMapping("/room/all")
    private ResponseEntity<?> getAllRoom(@RequestParam(required = false) String title,
            @RequestParam(required = false) Boolean approve,
            @RequestParam Integer pageNo,
            @RequestParam Integer pageSize) {
        return ResponseEntity.ok(blogService.getAllRoomForAdmin(title, approve, pageNo, pageSize));
    }

    @GetMapping("/customer/room")
    private ResponseEntity<?> getAllRoomForCustomer(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) BigDecimal price,
            @RequestParam(required = false) Long categoryId,
            @RequestParam Integer pageNo,
            @RequestParam Integer pageSize) {
        return ResponseEntity.ok(blogService.getAllRoomForCustomer(title, price, categoryId, pageNo, pageSize));
    }

    // room order price asc
    @GetMapping("/blog/order/price-asc")
    public ResponseEntity<?> getRoomByPriceAsc(@RequestParam(required = false) String title,
            @RequestParam(required = false) Boolean approve,
            @RequestParam Integer pageNo,
            @RequestParam Integer pageSize) {
        return ResponseEntity.ok(blogService.getAdminRoomOrderByPriceAsc(title, approve, pageNo, pageSize));
    }

    // room order price desc
    @GetMapping("/blog/order/price-desc")
    public ResponseEntity<?> getRoomByPriceDesc(@RequestParam(required = false) String title,
            @RequestParam(required = false) Boolean approve,
            @RequestParam Integer pageNo,
            @RequestParam Integer pageSize) {
        return ResponseEntity.ok(blogService.getAdminRoomOrderByPriceDesc(title, approve, pageNo, pageSize));
    }

    // priority status: CHUA THUE
    @GetMapping("/blog/order/status-asc")
    public ResponseEntity<?> getRoomByStatusAsc(@RequestParam(required = false) String title,
            @RequestParam(required = false) Boolean approve,
            @RequestParam Integer pageNo,
            @RequestParam Integer pageSize) {
        return ResponseEntity.ok(blogService.getAdminRoomOrderByStatusAsc(title, approve, pageNo, pageSize));
    }

    // priority status: DA THUE
    @GetMapping("/blog/order/status-desc")
    public ResponseEntity<?> getRoomByStatusDesc(@RequestParam(required = false) String title,
            @RequestParam(required = false) Boolean approve,
            @RequestParam Integer pageNo,
            @RequestParam Integer pageSize) {
        return ResponseEntity.ok(blogService.getAdminRoomOrderByStatusDesc(title, approve, pageNo, pageSize));
    }
}
