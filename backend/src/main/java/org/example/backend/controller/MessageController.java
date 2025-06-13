package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.model.MessageChat;
import org.example.backend.repository.MessageChatRepository;
import org.example.backend.security.UserPrincipal;
import org.example.backend.service.FileStorageService;
import org.example.backend.service.MessageCountService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.util.Collections;
import java.util.Date;
import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
public class MessageController {
    private final MessageChatRepository messageChatRepository;
    private final MessageCountService messageCountService;
    private final SimpMessagingTemplate messagingTemplate;
    private final FileStorageService fileStorageService;

    @MessageMapping("/chat/public")
    @SendTo("/topic/public")
    public MessageChat sendPublicMessage(MessageChat messageChat) {
        try {
            if (messageChat.getContent() == null || messageChat.getContent().trim().isEmpty()) {
                throw new IllegalArgumentException("Message content cannot be empty");
            }
            messageChat.setSendBy(true);
            messageChat.setSentAt(new Date());
            messageChat.setRead(false);
            messageChat.setType("CHAT");
            MessageChat savedMessage = messageChatRepository.save(messageChat);
            log.info("Public message sent by user: {}", messageChat.getCreatedBy());
            return savedMessage;
        } catch (Exception e) {
            log.error("Error sending public message", e);
            throw e;
        }
    }

    @PostMapping("/upload-file")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("createdBy") String createdBy,
            @RequestParam("clientId") String clientId
    ) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty");
            }
            if (file.getSize() > 10 * 1024 * 1024) { // 10MB limit
                return ResponseEntity.badRequest().body("File size exceeds 10MB");
            }
            String contentType = file.getContentType();
            if (contentType == null || (!contentType.startsWith("image/") && !contentType.equals("application/pdf"))) {
                return ResponseEntity.badRequest().body("Only images and PDFs are allowed");
            }

            String fileName = fileStorageService.storeFile(file);
            String filePath = fileStorageService.loadFileAsResource(fileName).getFile().getAbsolutePath();

            MessageChat messageChat = new MessageChat();
            messageChat.setType("FILE");
            messageChat.setCreatedBy(createdBy);
            messageChat.setSentAt(new Date());
            messageChat.setRead(false);
            messageChat.setSendBy(true);
            messageChat.setFileName(file.getOriginalFilename());
            messageChat.setFilePath(filePath);
            messageChat.setFileType(contentType);
            messageChat.setFileSize(file.getSize());
            messageChat.setClientId(clientId);

            MessageChat savedMessage = messageChatRepository.save(messageChat);

            messagingTemplate.convertAndSend("/topic/public", savedMessage);

            log.info("File uploaded by user: {}, file: {}", createdBy, file.getOriginalFilename());
            return ResponseEntity.ok(savedMessage);
        } catch (Exception e) {
            log.error("Error uploading file", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload file");
        }
    }

    @GetMapping("/files/{fileName:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String fileName) {
        try {
            Resource resource = fileStorageService.loadFileAsResource(fileName);
            String contentType = Files.probeContentType(resource.getFile().toPath());

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (Exception e) {
            log.error("Error serving file: {}", fileName, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @MessageMapping("/join")
    @SendTo("/topic/public")
    public MessageChat join(UserPrincipal currentUser) {
        try {
            MessageChat messageChat = new MessageChat();
            messageChat.setContent(currentUser.getUsername() + " joined the conversation");
            messageChat.setType("JOIN");
            messageChat.setUserName(currentUser.getUsername());
            messageChat.setCreatedBy("system");
            messageChat.setSendBy(true);
            messageChat.setSentAt(new Date());
            messageChat.setRead(false);
            MessageChat savedMessage = messageChatRepository.save(messageChat);
            messageCountService.createOrUpdateUserMessageCount(currentUser.getId(), currentUser.getUsername());
            log.info("User {} joined the conversation", currentUser.getUsername());
            return savedMessage;
        } catch (Exception e) {
            log.error("Error processing user join", e);
            throw e;
        }
    }

    @MessageMapping("/leave")
    @SendTo("/topic/public")
    public MessageChat leave(UserPrincipal currentUser) {
        try {
            MessageChat messageChat = new MessageChat();
            messageChat.setContent(currentUser.getUsername() + " left the conversation");
            messageChat.setType("LEAVE");
            messageChat.setUserName(currentUser.getUsername());
            messageChat.setCreatedBy("system");
            messageChat.setSendBy(true);
            messageChat.setSentAt(new Date());
            messageChat.setRead(false);
            MessageChat savedMessage = messageChatRepository.save(messageChat);
            log.info("User {} left the conversation", currentUser.getUsername());
            return savedMessage;
        } catch (Exception e) {
            log.error("Error processing user leave", e);
            throw e;
        }
    }

    @MessageMapping("/chat/public/history")
    @SendTo("/topic/public/history")
    public List<MessageChat> loadHistory() {
        try {
            List<MessageChat> history = messageChatRepository.findTop50ByMessageIsNullOrderBySentAtDesc();
            Collections.reverse(history);
            log.info("Chat history loaded, {} messages returned", history.size());
            return history;
        } catch (Exception e) {
            log.error("Error loading chat history", e);
            return Collections.emptyList();
        }
    }
}