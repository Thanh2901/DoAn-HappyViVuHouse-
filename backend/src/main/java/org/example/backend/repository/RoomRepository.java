package org.example.backend.repository;

import org.example.backend.enums.RoomStatus;
import org.example.backend.model.Room;
import org.example.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    long countAllByUser(User user);

    long count();

    long countAllByStatusAndUser(RoomStatus status, User user);

    List<Room> findByUser(User user);

    long countByIsApprove(Boolean isApprove);

    // custom repository
    @Query(value = """
    SELECT r FROM Room r
    WHERE 1=1
    AND (:title IS NULL OR r.title LIKE CONCAT('%', :title, '%'))
    AND (:userId IS NULL OR r.user.id = :userId)
    ORDER BY CASE WHEN r.type = 'VIP' THEN 0 ELSE 1 END, r.id DESC
    """,
            countQuery = """
    SELECT COUNT(DISTINCT r.id) FROM Room r
    WHERE (:title IS NULL OR r.title LIKE CONCAT('%', :title, '%'))
    AND (:userId IS NULL OR r.user.id = :userId)
    """)
    Page<Room> searchingRoom(@Param("title") String title, @Param("userId") Long userId, Pageable pageable);

    @Query(value = """
    SELECT * FROM room r
    WHERE (:title IS NULL OR :title = '' OR LOWER(r.title) LIKE CONCAT('%', LOWER(:title), '%'))
    AND (CAST(:approve AS BOOLEAN) IS NULL OR r.is_approve = :approve)
    ORDER BY CASE WHEN r.type = 'VIP' THEN 0 ELSE 1 END, r.id DESC
    """,
            countQuery = """
    SELECT COUNT(DISTINCT r.id) FROM room r
    WHERE 1=1
    AND (:title IS NULL OR :title = '' OR LOWER(r.title) LIKE CONCAT('%', LOWER(:title), '%'))
    AND (CAST(:approve AS BOOLEAN) IS NULL OR r.is_approve = :approve)
    """,
            nativeQuery = true)
    Page<Room> searchingRoomForAdmin(@Param("title") String title, @Param("approve") Boolean approve, Pageable pageable);

    @Query(value = "SELECT r.* FROM room r " +
            "WHERE 1=1 " +
            "AND (:title IS NULL OR :title = '' OR r.title LIKE CONCAT('%', :title, '%')) " + // Sửa LIKE để phù hợp với native query
            "AND (CAST(:price AS numeric) IS NULL OR r.price = :price) " +
            "AND (CAST(:categoryId AS bigint) IS NULL OR CAST(:categoryId AS bigint) = 0 OR r.category_id = :categoryId) " +
            "AND (CAST(:userId AS bigint) IS NULL OR r.user_id = :userId) " +
            "AND r.is_approve = true " +
            "AND r.is_locked = 'ENABLE' " +
            "AND r.is_remove = false " +
            "ORDER BY CASE WHEN r.type = 'VIP' THEN 0 ELSE 1 END, r.id DESC",
            countQuery = "SELECT COUNT(DISTINCT r.id) FROM room r " +
                    "WHERE 1=1 " +
                    "AND (:title IS NULL OR :title = '' OR r.title LIKE CONCAT('%', :title, '%')) " + // Sửa LIKE
                    "AND (CAST(:price AS numeric) IS NULL OR r.price = :price) " +
                    "AND (CAST(:categoryId AS bigint) IS NULL OR CAST(:categoryId AS bigint) = 0 OR r.category_id = :categoryId) " +
                    "AND (CAST(:userId AS bigint) IS NULL OR r.user_id = :userId) " +
                    "AND r.is_approve = true " +
                    "AND r.is_locked = 'ENABLE' " +
                    "AND r.is_remove = false",
            nativeQuery = true)
    Page<Room> searchingRoomForCustomer(@Param("title") String title,
                                        @Param("price") BigDecimal price,
                                        @Param("categoryId") Long categoryId,
                                        @Param("userId") Long userId,
                                        Pageable pageable);

    @Query(value = """
                SELECT * FROM room r
                WHERE 1=1
                AND r.is_locked = 'ENABLE'
                AND (:userId IS NULL OR r.user_id = :userId)
                """,
            countQuery = """
                SELECT COUNT(DISTINCT r.id) FROM room r
                WHERE 1=1
                AND r.is_locked = 'ENABLE'
                AND (:userId IS NULL OR r.user_id = :userId)
                """,
            nativeQuery = true)
    Page<Room> getAllRentOfHome(@Param("userId") Long userId, Pageable pageable);

    @Query(value = """
        SELECT r FROM Room r
        WHERE 1=1
        AND r.isLocked = 'ENABLE'
        AND (:userId IS NULL OR r.user.id = :userId)
        AND r.status != 'HIRED'
        AND r.isApprove = true
        """,
            countQuery = """
        SELECT COUNT(DISTINCT r.id) FROM Room r
        WHERE 1=1
        AND r.isLocked = 'ENABLE'
        AND (:userId IS NULL OR r.user.id = :userId)
        AND r.status != 'HIRED'
        AND r.isApprove = true
        """)
    Page<Room> getAllRentOfHomeForContract(@Param("userId") Long userId, Pageable pageable);

    @Query(value = """
                SELECT * FROM room r
                WHERE 1=1
                AND r.is_locked = 'ENABLE'
                AND (:userId IS NULL OR r.user_id = :userId)
                AND r.status LIKE 'HIRED'
                """,
            countQuery = """
                SELECT COUNT(DISTINCT r.id) FROM room r
                WHERE 1=1
                AND r.is_locked = 'ENABLE'
                AND (:userId IS NULL OR r.user_id = :userId)
                AND r.status LIKE 'HIRED'
                """,
            nativeQuery = true)
    Page<Room> getAllRentOfHomeForBill(@Param("userId") Long userId, Pageable pageable);

    @Query("select r from Room r where r.title = :title")
    Optional<Room> findByTitle(String title);

    Optional<Room> findByLatitudeAndLongitude(double latitude, double longitude);
}