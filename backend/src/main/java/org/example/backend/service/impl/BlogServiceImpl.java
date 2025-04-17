package org.example.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.response.RoomResponse;
import org.example.backend.repository.RoomRepository;
import org.example.backend.service.BlogService;
import org.example.backend.utils.MapperUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class BlogServiceImpl implements BlogService {

    private final RoomRepository roomRepository;
    private final MapperUtils mapperUtils;

    @Override
    public Page<RoomResponse> getAllRoomForAdmin(String title, Boolean approve, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        // Add sorting by title (ascending by default)
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("title").ascending());
        return mapperUtils.convertToResponsePage(
                roomRepository.searchingRoomForAdmin(title, approve, pageable),
                RoomResponse.class,
                pageable
        );
    }

    @Override
    public Page<RoomResponse> getAllRoomForCustomer(String title, BigDecimal price, Long categoryId, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("title").ascending());
        return mapperUtils.convertToResponsePage(
                roomRepository.searchingRoomForCustomer(title,price,categoryId,null,pageable),
                RoomResponse.class,
                pageable);
    }

    // room order by price asc
    @Override
    public Page<RoomResponse> getAdminRoomOrderByPriceAsc(String title, Boolean approve, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("price").ascending());
        return mapperUtils.convertToResponsePage(
                roomRepository.searchingRoomForAdmin(title, approve, pageable),
                RoomResponse.class,
                pageable
        );
    }

    // room order by price desc
    @Override
    public Page<RoomResponse> getAdminRoomOrderByPriceDesc(String title, Boolean approve, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("price").descending());
        return mapperUtils.convertToResponsePage(
                roomRepository.searchingRoomForAdmin(title, approve, pageable),
                RoomResponse.class,
                pageable
        );
    }

    // priority: status (CHUA THUE)
    @Override
    public Page<RoomResponse> getAdminRoomOrderByStatusAsc(String title, Boolean approve, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("status").ascending());
        return mapperUtils.convertToResponsePage(
                roomRepository.searchingRoomForAdmin(title, approve, pageable),
                RoomResponse.class,
                pageable
        );
    }

    // priority: status (DA THUE)
    @Override
    public Page<RoomResponse> getAdminRoomOrderByStatusDesc(String title, Boolean approve, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("status").descending());
        return mapperUtils.convertToResponsePage(
                roomRepository.searchingRoomForAdmin(title, approve, pageable),
                RoomResponse.class,
                pageable
        );
    }
}
