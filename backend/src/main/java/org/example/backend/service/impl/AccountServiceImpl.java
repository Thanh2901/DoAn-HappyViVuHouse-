package org.example.backend.service.impl;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.backend.dto.request.RoleRequest;
import org.example.backend.dto.request.SendEmailRequest;
import org.example.backend.dto.response.MessageResponse;
import org.example.backend.dto.response.UserResponse;
import org.example.backend.enums.RoleName;
import org.example.backend.exception.BadRequestException;
import org.example.backend.model.Role;
import org.example.backend.model.User;
import org.example.backend.repository.RoleRepository;
import org.example.backend.repository.UserRepository;
import org.example.backend.service.AccountService;
import org.example.backend.utils.MapperUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.ResourceUtils;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

    private final UserRepository userRepository;
    private final MapperUtils mapperUtils;
    private final JavaMailSender mailSender;
    private final RoleRepository roleRepository;
    @Value("${spring.mail.username}")
    private String from;

    @Override
    public Page<User> getAllAccount(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize);
        return userRepository.searchingAccount(keyword, pageable);
    }

    @Override
    public User getAccountById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new BadRequestException("Tài khoản không tồn tại"));
    }

    @Override
    public MessageResponse sendEmailForRentaler(Long id, SendEmailRequest sendEmailRequest) throws MessagingException, IOException {
        sendEmailFromTemplate(sendEmailRequest);
        return MessageResponse.builder().message("Gửi mail thành công").build();
    }

    @Transactional
    @Override
    public MessageResponse divideAuthorization(Long id, RoleRequest roleRequest) throws MessagingException, IOException {
        User user = userRepository.findById(id).orElseThrow(() -> new BadRequestException("Tài khoản không tồn tại"));
        userRepository.deleteRoleOfAccount(id);
        if (roleRequest.getRoleName().equals("RENTALER")) {
            Role userRole = roleRepository.findByName(RoleName.ROLE_RENTALER)
                    .orElseThrow(()-> new IllegalArgumentException("User role not set"));
            Set<Role> roleSet = new HashSet<>();
            roleSet.add(userRole);
            user.setRoles(roleSet);
            userRepository.save(user);
        } else {
            Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                    .orElseThrow(()-> new IllegalArgumentException("User role not set"));
            Set<Role> roleSet = new HashSet<>();
            roleSet.add(userRole);
            user.setRoles(roleSet);
            userRepository.save(user);
        }
        return MessageResponse.builder().message("Phân quyền thành công").build();
    }

    @Override
    public MessageResponse sendEmailForRentaler(SendEmailRequest sendEmailRequest) throws MessagingException, IOException {
        sendEmailOfCustomer(sendEmailRequest);
        return MessageResponse.builder().message("Liên hệ thành công").build();
    }

    @Override
    public MessageResponse sendEmailOfCustomer(SendEmailRequest sendEmailRequest) throws MessagingException, IOException {
        return null;
    }

    public UserResponse getAccountRoleUserByName(String userName) {
        User userRoleUserList = userRepository.getAccountRoleUserByName(userName);
        return mapperUtils.convertToResponse(userRoleUserList, UserResponse.class);
    }

    private void sendEmailFromTemplate(SendEmailRequest sendEmailRequest) throws MessagingException, IOException {
        MimeMessage message = mailSender.createMimeMessage();

        message.setFrom(new InternetAddress(from));
        message.setRecipients(MimeMessage.RecipientType.TO, sendEmailRequest.getToEmail());
        message.setSubject(sendEmailRequest.getTitle());

        // read the HTML template into a String value
        String htmlTemplate = readFile("send-email.html");

        // replace placeholder in the HTML template with dynamic values
        htmlTemplate = htmlTemplate.replace("NAM NGHIEM", sendEmailRequest.getNameOfRentaler());
        htmlTemplate = htmlTemplate.replace("DESCRIPTION", sendEmailRequest.getDescription());

        // set the email's content to be the HTML template
        message.setContent(htmlTemplate, "text/html;charset=utf-8");
        mailSender.send(message);
    }

    private void sendEmailFromTemplateCustomer(SendEmailRequest sendEmailRequest) throws MessagingException, IOException {
        MimeMessage message = mailSender.createMimeMessage();

        message.setRecipients(MimeMessage.RecipientType.TO, sendEmailRequest.getToEmail());
        message.setSubject("Tin thuê phòng");

        String htmlTemplate = readFile("send-email-customer.html");

        htmlTemplate = htmlTemplate.replace("NAM NGHIEM", sendEmailRequest.getNameOfRentaler());
        htmlTemplate = htmlTemplate.replace("DESCRIPTION", sendEmailRequest.getDescription() + "Email: " + sendEmailRequest.getTitle());

        message.setContent(htmlTemplate, "text/html;charset=utf-8");
        mailSender.send(message);
    }

    private void sendEmailFromTemplateForContact(SendEmailRequest sendEmailRequest) throws MessagingException, IOException {
        MimeMessage message = mailSender.createMimeMessage();

        message.setFrom(new InternetAddress(from));
        message.setRecipients(MimeMessage.RecipientType.TO, "thanhvupvt@gmail.com");
        message.setSubject(sendEmailRequest.getTitle());

        // read the html template into a String variable
        String htmlTemplate = readFile("send-email.html");

        htmlTemplate = htmlTemplate.replace("NAM NGHIEM", sendEmailRequest.getNameOfRentaler());
        htmlTemplate = htmlTemplate.replace("DESCRIPTION", sendEmailRequest.getDescription() + ".Email: "+ sendEmailRequest.getToEmail());

        message.setContent(htmlTemplate, "text/html;charset=utf-8");
        mailSender.send(message);
    }

    private String readFile(String fileName) throws IOException {
        File file = ResourceUtils.getFile("classpath:send-email.html");
        byte[] encoded = Files.readAllBytes(file.toPath());
        return new String(encoded, StandardCharsets.UTF_8);
    }

}
