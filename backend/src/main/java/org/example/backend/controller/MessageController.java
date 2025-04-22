package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.model.MessageChat;
import org.example.backend.repository.MessageChatRepository;
import org.example.backend.security.UserPrincipal;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.Date;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class MessageController {
    private final MessageChatRepository messageChatRepository;

    // chat all used to publish notification for all people
    @MessageMapping("/chat/public")
    @SendTo("/topic/public")
    public MessageChat sendPublicMessage(MessageChat messageChat) {
        if (messageChat.getContent() == null || messageChat.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("Message content cannot be empty");
        }
        messageChat.setSendBy(true);
        messageChat.setSentAt(new Date());
        messageChat.setRead(false);
        messageChat.setType("CHAT");
        messageChatRepository.save(messageChat);
        return messageChat;
    }

    @MessageMapping("/join")
    @SendTo("/topic/public")
    public MessageChat join(UserPrincipal currentUser) {
        MessageChat messageChat = new MessageChat();
        messageChat.setContent(currentUser.getUsername() + " join in conversation");
        messageChat.setType("JOIN");
        messageChat.setUserName(currentUser.getUsername());
        messageChat.setCreatedBy("system");
        messageChat.setSendBy(true);
        messageChat.setSentAt(new Date());
        messageChat.setRead(false);
        messageChatRepository.save(messageChat);
        return messageChat;
    }

    @MessageMapping("/leave")
    @SendTo("/topic/public")
    public MessageChat leave(UserPrincipal currentUser) {
        MessageChat messageChat = new MessageChat();
        messageChat.setContent(currentUser.getUsername() + " leave conversation");
        messageChat.setType("LEAVE");
        messageChat.setUserName(currentUser.getUsername());
        messageChat.setCreatedBy("system");
        messageChat.setSendBy(true);
        messageChat.setSentAt(new Date());
        messageChat.setRead(false);
        messageChatRepository.save(messageChat);
        return messageChat;
    }

    // load public chat history
    @MessageMapping("/chat/public/history")
    @SendTo("/topic/public/history")
    public List<MessageChat> loadHistory() {
        List<MessageChat> history = messageChatRepository.findTop50ByMessageIsNullOrderBySentAtDesc();
        Collections.reverse(history);
        return history;
    }
}