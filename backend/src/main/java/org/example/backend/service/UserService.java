package org.example.backend.service;

import org.example.backend.dto.MessageDTO;
import org.example.backend.dto.response.UserResponse;
import org.example.backend.model.Message;
import org.example.backend.model.MessageChat;
import org.example.backend.model.User;

import java.util.List;

public interface UserService {
    User getUserById(Long id);

    String updateImageUser(Long id, String image);

    String updateUser(User user);

    List<MessageDTO> getMessageUser();

    MessageDTO toMessageDTO(User user, Message message);

    List<User> findMessageUser(String userName);

    Message getMessageChatUser(Long userId, Long guestId);

    String addChatUser(Long id, Long userId, MessageChat messageChat);
}
