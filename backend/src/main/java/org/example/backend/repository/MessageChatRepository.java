package org.example.backend.repository;

import org.example.backend.model.MessageChat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageChatRepository extends JpaRepository<MessageChat, Long> {
}
