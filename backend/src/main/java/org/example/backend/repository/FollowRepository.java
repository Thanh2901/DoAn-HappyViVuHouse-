package org.example.backend.repository;

import org.example.backend.model.Follow;
import org.example.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {
    Optional<Follow> findByCustomerAndRentaler(User customer, User rental);

    @Query(value = "SELECT * FROM follow f WHERE 1=1 " +
            "AND (:userId IS NULL OR f.customer_id = :userId)",
            countQuery = "SELECT COUNT(DISTINCT f.id) FROM follow f WHERE 1=1 " +
                    "AND (:userId IS NULL OR f.customer_id = :userId)",
            nativeQuery = true)
    Page<Follow> getPageFollow(@Param("userId") Long userId, Pageable pageable);
}
