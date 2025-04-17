package org.example.backend.dto.request;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class SendEmailRequest {
    @Email
    private String toEmail;
    private String title;
    private String nameOfRentaler;
    private String description;
}
