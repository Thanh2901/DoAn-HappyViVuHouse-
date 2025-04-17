package org.example.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.request.FollowRequest;
import org.example.backend.dto.response.FollowResponse;
import org.example.backend.dto.response.MessageResponse;
import org.example.backend.exception.BadRequestException;
import org.example.backend.model.Follow;
import org.example.backend.model.User;
import org.example.backend.repository.FollowRepository;
import org.example.backend.repository.UserRepository;
import org.example.backend.service.BaseService;
import org.example.backend.service.FollowService;
import org.example.backend.utils.MapperUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FollowServiceImpl extends BaseService implements FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final MapperUtils mapperUtils;

    @Override
    public MessageResponse addFollow(FollowRequest followRequest) {
        User customer = userRepository.findById(getUserId()).orElseThrow(() -> new BadRequestException("Tài khoảng không tồn tại"));
        User rentaler = userRepository.findById(followRequest.getRentalerId()).orElseThrow(() -> new BadRequestException("Tài khoảng không tồn tại"));
        Optional<Follow> followOptional = followRepository.findByCustomerAndRentaler(customer, rentaler);
        if (followOptional.isPresent()) {
            throw new BadRequestException("Người cho thuê đã được theo dõi.");
        }
        Follow follow = new Follow();
        follow.setCustomer(customer);
        follow.setRentaler(rentaler);
        followRepository.save(follow);
        return MessageResponse.builder().message("Đã theo dõi.").build();
    }

    @Override
    public Page<FollowResponse> getAllFollowOfCustomer(Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize);
        return mapperUtils.convertToResponsePage(followRepository.getPageFollow(getUserId(),pageable),FollowResponse.class, pageable);
    }
}
