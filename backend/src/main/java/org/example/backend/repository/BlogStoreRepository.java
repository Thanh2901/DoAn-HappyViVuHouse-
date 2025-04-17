package org.example.backend.repository;

import org.example.backend.model.BlogStore;
import org.example.backend.model.Room;
import org.example.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BlogStoreRepository extends JpaRepository<BlogStore, Long> {
    Optional<BlogStore> findByRoomAndUser(Room room, User user);

    @Query(value = "SELECT * FROM blog_store bs WHERE 1=1 " +
                    "AND (:userId IS NULL OR bs.user_id = :userId)",
            countQuery = "SELECT COUNT(DISTINCT bs.id) FROM blog_store bs WHERE 1=1 " +
                    "AND (:userId IS NOT NULL OR bs.user_id = :userId)",
            nativeQuery = true)
    Page<BlogStore> getPageOfBlogStore(Long userId, Pageable pageable);
}
