package org.example.backend.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.model.UserMessageCount;
import org.example.backend.repository.UserMessageCountRepository;
import org.example.backend.service.MessageCountService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Date;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageCountServiceImpl implements MessageCountService {

    private final UserMessageCountRepository userMessageCountRepository;

    @Override
    @Transactional
    public UserMessageCount createOrUpdateUserMessageCount(Long userId, String username) {
        Optional<UserMessageCount> existingCount = userMessageCountRepository.findByUserId(userId);

        if (existingCount.isPresent()) {
            UserMessageCount userCount = existingCount.get();
            userCount.setUsername(username); // Update username nếu có thay đổi
            userCount.setUpdatedAt(new Date());
            return userMessageCountRepository.save(userCount);
        } else {
            UserMessageCount newCount = new UserMessageCount();
            newCount.setUserId(userId);
            newCount.setUsername(username);
            newCount.setUnreadCount(0);
            newCount.setCreatedAt(new Date());
            newCount.setUpdatedAt(new Date());
            return userMessageCountRepository.save(newCount);
        }
    }


    @Override
    @Transactional
    public void incrementUnreadCount(Long userId) {
        try {
            userMessageCountRepository.incrementUnreadCount(userId, new Date());
            log.info("Incremented unread count for user: {}", userId);
        } catch (Exception e) {
            log.error("Error incrementing unread count for user: {}", userId, e);
        }
    }

    @Override
    @Transactional
    public void resetUnreadCount(Long userId) {
        try {
            userMessageCountRepository.resetUnreadCount(userId, new Date(), new Date());
            log.info("Reset unread count for user: {}", userId);
        } catch (Exception e) {
            log.error("Error resetting unread count for user: {}", userId, e);
        }
    }

    @Override
    public UserMessageCount getUserMessageCount(Long userId) {
        return userMessageCountRepository.findByUserId(userId)
                .orElse(new UserMessageCount(null, userId, "", 0, null, new Date(), new Date()));
    }

    @Override
    @Transactional
    public void deleteUserMessageCount(Long userId) {
        try {
            userMessageCountRepository.deleteByUserId(userId);
            log.info("Deleted message count record for user: {}", userId);
        } catch (Exception e) {
            log.error("Error deleting message count for user: {}", userId, e);
        }
    }
}
