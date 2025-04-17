package org.example.backend.service;

import org.example.backend.dto.response.RoomResponse;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;

public interface BlogService {
    Page<RoomResponse> getAllRoomForAdmin(String title, Boolean approve, Integer pageNo, Integer pageSize);

    Page<RoomResponse> getAllRoomForCustomer(String title, BigDecimal price, Long categoryId, Integer pageNo, Integer pageSize);

    Page<RoomResponse> getAdminRoomOrderByPriceAsc(String title, Boolean approve, Integer pageNo, Integer pageSize);

    Page<RoomResponse> getAdminRoomOrderByPriceDesc(String title, Boolean approve, Integer pageNo, Integer pageSize);

    Page<RoomResponse> getAdminRoomOrderByStatusAsc(String title, Boolean approve, Integer pageNo, Integer pageSize);

    Page<RoomResponse> getAdminRoomOrderByStatusDesc(String title, Boolean approve, Integer pageNo, Integer pageSize);
}
