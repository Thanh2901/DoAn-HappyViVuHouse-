package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.exception.ResourceNotFoundException;
import org.example.backend.model.User;
import org.example.backend.repository.UserRepository;
import org.example.backend.security.CurrentUser;
import org.example.backend.security.UserPrincipal;
import org.example.backend.service.impl.FileStorageServiceImpl;
import org.example.backend.service.impl.UserServiceImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final FileStorageServiceImpl fileStorageServiceImpl;
    private final UserServiceImpl userServiceImpl;

    @GetMapping("/user/me")
    @PreAuthorize("hasRole('USER')")
    public User getCurrentUser(@CurrentUser UserPrincipal userPrincipal) {
        return userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userPrincipal.getId()));
    }

    @GetMapping("/rentaler/me")
    @PreAuthorize("hasRole('RENTALER')")
    public User getRecruiter(@CurrentUser UserPrincipal userPrincipal) {
        return userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userPrincipal.getId()));
    }

    @GetMapping("/admin/me")
    @PreAuthorize("hasRole('ADMIN')")
    public User getAdmin(@CurrentUser UserPrincipal userPrincipal) {
        return userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userPrincipal.getId()));
    }

    @PostMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> updateImage(@CurrentUser UserPrincipal userPrincipal, @ModelAttribute MultipartFile image){
        String path = fileStorageServiceImpl.storeFile(image);
        String result = userServiceImpl.updateImageUser(userPrincipal.getId(), path);
        return new ResponseEntity<String>(result, result.equals("Cập nhật hình ảnh thất bại!!!") == true ? HttpStatus.BAD_REQUEST : HttpStatus.OK);
    }

    @PutMapping("/user/update")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> updateInforUser(@CurrentUser UserPrincipal userPrincipal, @RequestBody User user){
        String result = userServiceImpl.updateUser(user);
        System.out.println(user.getEmail());
        System.out.println(user.getName());
        System.out.println(result);
        return new ResponseEntity<String>(result, result.equals("Cập nhật thông tin thành công!!!")? HttpStatus.OK : HttpStatus.BAD_GATEWAY);
    }
}
