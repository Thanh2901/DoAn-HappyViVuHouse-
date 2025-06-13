package org.example.backend.repository;

import org.example.backend.model.UserMessageCount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.Optional;

@Repository
public interface UserMessageCountRepository extends JpaRepository<UserMessageCount, Long> {

    Optional<UserMessageCount> findByUserId(Long userId);

    Optional<UserMessageCount> findByUsername(String username);

    @Modifying
    @Transactional
    @Query("UPDATE UserMessageCount u SET u.unreadCount = u.unreadCount + 1, u.updatedAt = :updatedAt WHERE u.userId = :userId")
    void incrementUnreadCount(@Param("userId") Long userId, @Param("updatedAt") Date updatedAt);

    @Modifying
    @Transactional
    @Query("UPDATE UserMessageCount u SET u.unreadCount = 0, u.lastReadAt = :lastReadAt, u.updatedAt = :updatedAt WHERE u.userId = :userId")
    void resetUnreadCount(@Param("userId") Long userId, @Param("lastReadAt") Date lastReadAt, @Param("updatedAt") Date updatedAt);

    @Modifying
    @Transactional
    @Query("DELETE FROM UserMessageCount u WHERE u.userId = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}

