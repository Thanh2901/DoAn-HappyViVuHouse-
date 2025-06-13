package org.example.backend.controller;


import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.example.backend.dto.request.RoleRequest;
import org.example.backend.dto.request.SendEmailRequest;
import org.example.backend.dto.response.UserResponse;
import org.example.backend.service.AccountService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/account")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @GetMapping
    private ResponseEntity<?> getAllAccount(@RequestParam(required = false) String keyword,
                                            @RequestParam Integer pageNo,
                                            @RequestParam Integer pageSize) {
        return ResponseEntity.ok(accountService.getAllAccount(keyword,pageNo,pageSize));
    }

    @GetMapping("/customer")
    private ResponseEntity<?> getAllAccountForCustomer(@RequestParam(required = false) String keyword,
                                                       @RequestParam Integer pageNo,
                                                       @RequestParam Integer pageSize) {
        return ResponseEntity.ok(accountService.getAllAccount(keyword,pageNo,pageSize));
    }

    @GetMapping("/{id}")
    private ResponseEntity<?> getAccountById(@PathVariable Long id) {
        return ResponseEntity.ok(accountService.getAccountById(id));
    }

    @PostMapping("/send-email/{id}")
    private ResponseEntity<?> sendEmail(@PathVariable Long id, @RequestBody SendEmailRequest sendEmailRequest) throws MessagingException, IOException {
        return ResponseEntity.ok(accountService.sendEmailForRentaler(id, sendEmailRequest));
    }

    @PostMapping("/send-mail/contact")
    private ResponseEntity<?> sendEmailForContact(@RequestBody SendEmailRequest sendEmailRequest) throws MessagingException, IOException {
        return ResponseEntity.ok(accountService.sendEmailForRentaler(sendEmailRequest));
    }

    @PostMapping("/send-mail-rentaler")
    private ResponseEntity<?> sendEmailForRentaler(@RequestBody SendEmailRequest sendEmailRequest) throws MessagingException, IOException {
        return ResponseEntity.ok(accountService.sendEmailForRentaler(sendEmailRequest));
    }

    @PostMapping("/{id}/authorization")
    private ResponseEntity<?> divideAuthorization(@PathVariable Long id, @RequestBody RoleRequest roleRequest) throws MessagingException, IOException {
        return ResponseEntity.ok(accountService.divideAuthorization(id, roleRequest));
    }

    @GetMapping("/role/user")
    public ResponseEntity<UserResponse> getAllAccountRoleUser(@RequestParam(value = "name") String name) {
        return ResponseEntity.ok(accountService.getAccountRoleUserByName(name));
    }
}