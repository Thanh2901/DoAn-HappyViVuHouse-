package org.example.backend.dto.response;

import lombok.Data;

@Data
public class FollowResponse {
    private UserResponse customer;
    private UserResponse rentaler;
}
