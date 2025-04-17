package org.example.backend.service;

import jakarta.mail.MessagingException;
import org.example.backend.dto.request.RoleRequest;
import org.example.backend.dto.request.SendEmailRequest;
import org.example.backend.dto.response.MessageResponse;
import org.example.backend.dto.response.UserResponse;
import org.example.backend.model.User;
import org.springframework.data.domain.Page;

import java.io.IOException;
import java.util.List;

public interface AccountService {

    Page<User> getAllAccount(String keyword, Integer pageNo, Integer pageSize);

    User getAccountById(Long id);

    MessageResponse sendEmailForRentaler(Long id, SendEmailRequest sendEmailRequest) throws MessagingException, IOException;

    MessageResponse divideAuthorization(Long id, RoleRequest roleRequest) throws MessagingException, IOException;

    MessageResponse sendEmailForRentaler(SendEmailRequest sendEmailRequest) throws MessagingException, IOException;

    MessageResponse sendEmailOfCustomer(SendEmailRequest sendEmailRequest) throws MessagingException, IOException;

    UserResponse getAccountRoleUserByName(String name);
}
