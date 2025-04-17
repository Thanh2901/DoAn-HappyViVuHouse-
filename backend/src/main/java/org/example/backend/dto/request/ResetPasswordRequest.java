package org.example.backend.dto.request;

import lombok.Data;

@Data
public class ResetPasswordRequest {
    private String email;
    private String password;
    private String confirmPassword;
}
