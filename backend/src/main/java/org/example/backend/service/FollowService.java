package org.example.backend.service;

import org.example.backend.dto.request.FollowRequest;
import org.example.backend.dto.response.FollowResponse;
import org.example.backend.dto.response.MessageResponse;
import org.springframework.data.domain.Page;

public interface FollowService {
    MessageResponse addFollow(FollowRequest followRequest);

    Page<FollowResponse> getAllFollowOfCustomer(Integer pageNo, Integer pageSize);
}
