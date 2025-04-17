package org.example.backend.repository;

import org.example.backend.model.Request;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RequestRepository extends JpaRepository<Request, Long> {
    @Query(value = """
        SELECT r FROM Request r
        JOIN r.room ro
        WHERE 1=1
        AND (:keyword IS NULL OR :keyword = '' OR LOWER(CONCAT(r.name, ' ', ro.title)) LIKE LOWER(:keyword))
        AND (:userId IS NULL OR ro.user.id = :userId)
        """,
            countQuery = """
        SELECT COUNT(DISTINCT r.id) FROM Request r
        JOIN r.room ro
        WHERE 1=1
        AND (:keyword IS NULL OR :keyword = '' OR LOWER(CONCAT(r.name, ' ', ro.title)) LIKE LOWER(:keyword))
        AND (:userId IS NULL OR ro.user.id = :userId)
        """)
    Page<Request> searchingOfRequest(@Param("keyword") String keyword,
                                     @Param("userId") Long userId,
                                     Pageable pageable);


    @Query(value = """
                SELECT r.* FROM request r
                INNER JOIN room ro ON r.room_id = ro.id
                WHERE 1=1
                AND (:keyword IS NULL OR r.name LIKE CONCAT('%', :keyword, '%') OR ro.title LIKE CONCAT('%', :keyword, '%'))
                AND (:phone IS NULL OR r.phone_number = :phone)
                """,
            countQuery = """
                SELECT COUNT(DISTINCT r.id) FROM request r
                INNER JOIN room ro ON r.room_id = ro.id
                WHERE 1=1
                AND (:keyword IS NULL OR r.name LIKE CONCAT('%', :keyword, '%') OR ro.title LIKE CONCAT('%', :keyword, '%'))
                AND (:phone IS NULL OR r.phone_number = :phone)
                """,
            nativeQuery = true)
    Page<Request> searchingOfRequest(@Param("keyword") String keyword,
                                     @Param("phone") String phone,
                                     Pageable pageable);
}
