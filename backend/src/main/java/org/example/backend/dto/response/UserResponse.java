package org.example.backend.dto.response;

import lombok.Data;

@Data
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private Boolean isLocked;
    private String address;
    private String phone;
    private String imageUrl;
    private String zaloUrl;
    private String facebookUrl;
}
