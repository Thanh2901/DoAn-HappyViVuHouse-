package org.example.backend.repository;

import org.example.backend.model.Maintenance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@Repository
public interface MaintenanceRepository extends JpaRepository<Maintenance, Long> {
    @Query(value = "SELECT m FROM Maintenance m " +
            "JOIN m.room r " +
            "WHERE (:keyword IS NULL OR :keyword = '' OR r.title LIKE CONCAT('%', :keyword, '%')) " +
            "AND (:userId IS NULL OR r.user.id = :userId)",
            countQuery = "SELECT COUNT(m) FROM Maintenance m " +
                    "JOIN m.room r " +
                    "WHERE (:keyword IS NULL OR :keyword = '' OR r.title LIKE CONCAT('%', :keyword, '%')) " +
                    "AND (:userId IS NULL OR r.user.id = :userId)")
    Page<Maintenance> searchingMaintenance(@Param("keyword") String keyword,
                                           @Param("userId") Long userId,
                                           Pageable pageable);

    @Query(value = "SELECT COALESCE(SUM(m.price), 0) FROM maintenance m " +
            "INNER JOIN room r ON m.room_id = r.id " +
            "WHERE (:userId IS NULL OR r.user_id = :userId)",
            nativeQuery = true)
    BigDecimal sumPriceOfMaintenance(@Param("userId") Long userId);
}
