package org.example.backend.service;

import org.example.backend.model.UserMessageCount;

public interface MessageCountService {
    UserMessageCount createOrUpdateUserMessageCount(Long userId, String username);
    void incrementUnreadCount(Long userId);
    void resetUnreadCount(Long userId);
    UserMessageCount getUserMessageCount(Long userId);
    void deleteUserMessageCount(Long userId);
}
