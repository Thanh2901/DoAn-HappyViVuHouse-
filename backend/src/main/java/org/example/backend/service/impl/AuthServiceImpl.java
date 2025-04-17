package org.example.backend.service.impl;

import jakarta.mail.IllegalWriteException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.example.backend.dto.request.*;
import org.example.backend.dto.response.MessageResponse;
import org.example.backend.enums.AuthProvider;
import org.example.backend.enums.RoleName;
import org.example.backend.exception.BadRequestException;
import org.example.backend.model.Role;
import org.example.backend.model.User;
import org.example.backend.repository.MessageRepository;
import org.example.backend.repository.RoleRepository;
import org.example.backend.repository.UserRepository;
import org.example.backend.security.TokenProvider;
import org.example.backend.service.AuthService;
import org.example.backend.service.BaseService;
import org.example.backend.service.FileStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.ResourceUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.Collections;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl extends BaseService implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenProvider tokenProvider;
    private final JavaMailSender mailSender;
    private final FileStorageService fileStorageService;
    private final MessageRepository messageRepository;
    private final RoleRepository roleRepository;
    @Value("thanhvuworkspace@gmail.com")
    private String from;


    @Override
    public URI registerAccount(SignUpRequest signUpRequest) throws MessagingException, IOException {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new BadRequestException("Email đã được sử dụng");
        }

        if (userRepository.findByPhone(signUpRequest.getPhone()).isPresent()) {
            throw new BadRequestException("Số điện thoại đã được sử dụng");
        }

        if (!signUpRequest.getPassword().equals(signUpRequest.getConfirmPassword())) {
            throw new BadRequestException("Mật khẩu không khớp. Vui lòng thử lại.");
        }

        User user = new User();
        user.setName(signUpRequest.getName());
        user.setEmail(signUpRequest.getEmail()); // Thêm dòng này để gán email
        user.setPhone(signUpRequest.getPhone());
        user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
        user.setAuthProvider(AuthProvider.local);
        user.setIsLocked(false);
        user.setIsConfirm(false);

        if (RoleName.ROLE_USER.equals(signUpRequest.getRole())) {
            Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                    .orElseThrow(() -> new IllegalArgumentException("User role not set."));
            user.setRoles(Collections.singleton(userRole));
        } else if (RoleName.ROLE_RENTALER.equals(signUpRequest.getRole())) {
            Role userRole = roleRepository.findByName(RoleName.ROLE_RENTALER)
                    .orElseThrow(() -> new IllegalArgumentException("User role not set."));
            user.setAddress(signUpRequest.getAddress());
            user.setRoles(Collections.singleton(userRole));
        } else {
            throw new IllegalWriteException("Bạn không có quyền tạo tài khoản!!!");
        }

        User result = userRepository.save(user);
        sendEmailConfirmed(signUpRequest.getEmail(), signUpRequest.getName());

        return ServletUriComponentsBuilder
                .fromCurrentContextPath().path("/user/me")
                .buildAndExpand(result.getId()).toUri();
    }

    @Override
    public String login(LoginRequest loginRequest) {
        if (!StringUtils.hasText(loginRequest.getEmail())) {
            throw new BadRequestException("Email không được để trống");
        }
        if (!StringUtils.hasText(loginRequest.getPassword())) {
            throw new BadRequestException("Mật khẩu không được để trống");
        }
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(()->new BadRequestException("Email này không tồn tại!"));

        if (user.getIsConfirm().equals(false)) {
            throw new BadRequestException("Tài khoản chưa được xác thực. Vui lòng kiểm tra mail của bạn");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        return tokenProvider.createToken(authentication);
    }

    @Override
    public MessageResponse forgotPassword(EmailRequest emailRequest) throws MessagingException, IOException {
        userRepository.findByEmail(emailRequest.getEmail())
                .orElseThrow(()-> new BadRequestException("Email này không tồn tại."));
        sendEmailFromTemplate(emailRequest.getEmail());
        return MessageResponse.builder().message("Gửi yêu cầu thành công").build();
    }

    @Override
    public MessageResponse resetPassword(ResetPasswordRequest resetPasswordRequest) throws MessagingException, IOException {
        if (!resetPasswordRequest.getPassword().equals(resetPasswordRequest.getConfirmPassword())) {
            throw new BadRequestException("Mật khẩu không trùng khớp");
        }
        User user = userRepository.findByEmail(resetPasswordRequest.getEmail())
                .orElseThrow(()->new BadRequestException("Email này không tồn tại"));
        user.setPassword(resetPasswordRequest.getPassword());
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return MessageResponse.builder().message("Thay đổi mật khẩu thành công").build();
    }

    @Override
    public MessageResponse confirmedAccount(EmailRequest emailRequest) {
        User user = userRepository.findByEmail(emailRequest.getEmail())
                .orElseThrow(() -> new BadRequestException("Email này không tồn tại."));
        user.setIsConfirm(true);
        userRepository.save(user);
        return MessageResponse.builder().message("Tài khoản đã được xác thực. Vui lòng đăng nhập").build();
    }

    @Override
    public MessageResponse changePassword(ChangePasswordRequest changePasswordRequest) {
        User user = userRepository.findById(getUserId())
                .orElseThrow(() -> new BadRequestException("Tài khoảng không tồn tại"));
        boolean passwordMatch = BCrypt.checkpw(changePasswordRequest.getOldPassword(), user.getPassword());
        if (!passwordMatch) {
            throw new BadRequestException("Mật khẩu cũ không chính xác");
        }
        if (!changePasswordRequest.getNewPassword().equals(changePasswordRequest.getConfirmPassword())) {
            throw new BadRequestException("Mật khẩu không trùng khớp");
        }

        user.setPassword(passwordEncoder.encode(changePasswordRequest.getNewPassword()));
        userRepository.save(user);
        return MessageResponse.builder().message("Cập nhật mật khẩu thành công").build();
    }

    @Override
    public MessageResponse changeImage(MultipartFile file) {
        User user = userRepository.findById(getUserId())
                .orElseThrow(() -> new BadRequestException("Tài khoảng không tồn tại"));
        if (Objects.nonNull(file)) {
            String image = fileStorageService.storeFile(file).replace("photographer/files/", "");
            user.setImageUrl("http://localhost:8080/image/" + image);
        }
        userRepository.save(user);
        return MessageResponse.builder().message("Thay ảnh đại diện thành công.").build();
    }

    @Override
    public MessageResponse lockAccount(Long id) {
        User user = userRepository.findById(id).orElseThrow();
        if (user.getIsLocked().equals(true)) {
            user.setIsLocked(false);
        } else {
            user.setIsLocked(true);
        }
        userRepository.save(user);
        return MessageResponse.builder().message("Cập nhật trạng thái của tài khoản thành công").build();
    }

    @Override
    public MessageResponse uploadProfile(MultipartFile file, String zalo, String facebook, String address) {
        User user = userRepository.findById(getUserId())
                .orElseThrow(() -> new BadRequestException("Tài khoảng không tồn tại"));
        user.setZaloUrl(zalo);
        user.setFacebookUrl(facebook);
        user.setAddress(address);
        if (Objects.nonNull(file)) {
            String image = fileStorageService.storeFile(file).replace("photographer/files/", "");
            user.setImageUrl("http://localhost:8080/image/" + image);
        }
        userRepository.save(user);
        return MessageResponse.builder().message("Thay thông tin cá nhân thành công.").build();
    }

    private void sendEmailFromTemplate(String email) throws MessagingException, IOException {
        MimeMessage message = mailSender.createMimeMessage();
        message.setFrom(new InternetAddress(from));
        message.setRecipients(MimeMessage.RecipientType.TO, email);
        message.setSubject("Yêu cầu cấp lại mật khẩu");

        String htmlTemplate = readFile("forgot-password.html");

        htmlTemplate = htmlTemplate.replace("EMAILINFO", email);

        message.setContent(htmlTemplate, "text/html;charset=utf-8");
        mailSender.send(message);
    }

    private void sendEmailConfirmed(String email, String name) throws MessagingException, IOException {
        MimeMessage message = mailSender.createMimeMessage();
        message.setFrom(new InternetAddress(from));
        message.setRecipients(MimeMessage.RecipientType.TO, email);
        message.setSubject("Xác thực tài khoản");

        String htmlTemplate = readFileConfirmed("confirm-email.html");

        htmlTemplate = htmlTemplate.replace("NAME", name);
        htmlTemplate = htmlTemplate.replace("EMAIL", email);

        message.setContent(htmlTemplate, "text/html; charset=utf-8");
        mailSender.send(message);
    }

    private static String readFile(String fileName) throws IOException {
        File file = ResourceUtils.getFile("classpath:forgot-password.html");
        byte[] encoded = Files.readAllBytes(file.toPath());
        return new String(encoded, StandardCharsets.UTF_8);
    }

    private static String readFileConfirmed(String fileName) throws IOException {
        File file = ResourceUtils.getFile("classpath:confirm-email.html");
        byte[] encoded = Files.readAllBytes(file.toPath());
        return new String(encoded, StandardCharsets.UTF_8);
    }
}
