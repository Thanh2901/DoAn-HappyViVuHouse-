package org.example.backend.service;

import jakarta.mail.MessagingException;
import org.example.backend.dto.request.*;
import org.example.backend.dto.response.MessageResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;

public interface AuthService {
    URI registerAccount(SignUpRequest signUpRequest) throws MessagingException, IOException;

    String login(LoginRequest loginRequest);

    MessageResponse forgotPassword(EmailRequest emailRequest) throws MessagingException, IOException;

    MessageResponse resetPassword(ResetPasswordRequest resetPasswordRequest) throws MessagingException, IOException;

    MessageResponse confirmedAccount(EmailRequest emailRequest);

    MessageResponse changePassword(ChangePasswordRequest changePasswordRequest);

    MessageResponse changeImage(MultipartFile file);

    MessageResponse lockAccount(Long id);

    MessageResponse uploadProfile(MultipartFile file, String zalo, String facebook, String address);
}
