package org.example.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.request.RequestRequest;
import org.example.backend.dto.response.MessageResponse;
import org.example.backend.dto.response.RequiredResponse;
import org.example.backend.exception.BadRequestException;
import org.example.backend.model.Request;
import org.example.backend.model.Room;
import org.example.backend.repository.RequestRepository;
import org.example.backend.repository.RoomRepository;
import org.example.backend.service.BaseService;
import org.example.backend.service.RequestService;
import org.example.backend.utils.MapperUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RequestServiceImpl extends BaseService implements RequestService {

    private final RequestRepository requestRepository;
    private final RoomRepository roomRepository;
    private final MapperUtils mapperUtils;

    @Override
    public Page<RequiredResponse> getRequestOfRentHome(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("room.title").ascending());
        Long userId = getUserId();

        // Điều chỉnh keyword để sử dụng với LIKE
        String searchKeyword = keyword != null ? "%" + keyword + "%" : null;

        return mapperUtils.convertToResponsePage(
                requestRepository.searchingOfRequest(searchKeyword, userId, pageable),
                RequiredResponse.class,
                pageable
        );
    }
    @Override
    public MessageResponse changeStatusOfRequest(Long id) {
        Request request = requestRepository.findById(id).orElseThrow(() -> new BadRequestException("Yêu cầu này không tồn tại"));
        request.setIsAnswer(Boolean.TRUE);
        requestRepository.save(request);
        return MessageResponse.builder().message("Yêu cầu đã được xử lý").build();
    }

    @Override
    public RequiredResponse getRequest(Long id) {
        return mapperUtils.convertToResponse(requestRepository.findById(id).orElseThrow(() -> new BadRequestException("Yêu cầu này không tồn tại")), RequiredResponse.class);
    }

    @Override
    public Page<RequiredResponse> getRequestOfCustomer(String keyword, String phone, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize);
        return mapperUtils.convertToResponsePage(requestRepository.searchingOfRequest(keyword,phone,pageable), RequiredResponse.class, pageable);
    }

    @Override
    public MessageResponse addRequest(RequestRequest request) {
        Room room = roomRepository.findById(request.getRoomId()).orElseThrow(() -> new BadRequestException("Thông tin phòng không tồn tại."));
        Request result = new Request(request.getNameOfRent(),request.getPhone(),request.getDescription(), room);
        result.setIsAnswer(false);
        requestRepository.save(result);
        return MessageResponse.builder().message("Gửi yêu cầu thành công.").build();
    }

    @Override
    public Page<RequiredResponse> getRequestByTitleAsc(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("title").ascending());
        Long userId = getUserId();

        // Điều chỉnh keyword để sử dụng với LIKE
        String searchKeyword = keyword != null ? "%" + keyword + "%" : null;

        return mapperUtils.convertToResponsePage(
                requestRepository.searchingOfRequest(searchKeyword, userId, pageable),
                RequiredResponse.class,
                pageable
        );
    }

    @Override
    public Page<RequiredResponse> getRequestByAnswerAsc(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("isAnswer").ascending());
        Long userId = getUserId();

        // Điều chỉnh keyword để sử dụng với LIKE
        String searchKeyword = keyword != null ? "%" + keyword + "%" : null;

        return mapperUtils.convertToResponsePage(
                requestRepository.searchingOfRequest(searchKeyword, userId, pageable),
                RequiredResponse.class,
                pageable
        );
    }

    @Override
    public Page<RequiredResponse> getRequestByAnswerDesc(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("isAnswer").descending());
        Long userId = getUserId();

        // Điều chỉnh keyword để sử dụng với LIKE
        String searchKeyword = keyword != null ? "%" + keyword + "%" : null;

        return mapperUtils.convertToResponsePage(
                requestRepository.searchingOfRequest(searchKeyword, userId, pageable),
                RequiredResponse.class,
                pageable
        );
    }
}
