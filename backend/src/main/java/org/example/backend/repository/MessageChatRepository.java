package org.example.backend.repository;

import org.example.backend.model.MessageChat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageChatRepository extends JpaRepository<MessageChat, Long> {
    List<MessageChat> findMessageChatByMessageIsNull();

    // Added method to get recent messages
    List<MessageChat> findTop50ByMessageIsNullOrderBySentAtDesc();

    // Add this to your repository interface
    List<MessageChat> findTop50ByCreatedByNotAndMessageIsNullOrderBySentAtDesc(String createdBy);
}