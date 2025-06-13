package org.example.backend.repository;

import org.example.backend.model.Contract;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Long> {

    @Query(value = "SELECT COALESCE(SUM(c.numOfPeople), 0) FROM Contract c")
    long sumNumOfPeople();

//    @Query(value = "SELECT c.id, c.name, c.files, c.name_of_rent, c.deadline_contract, c.num_of_people, c.phone, c.room_id, " +
//            "c.created_by, c.updated_by, c.created_at, c.updated_at " +
//            "FROM contract c " +
//            "INNER JOIN room r ON c.room_id = r.id " +
//            "WHERE 1=1 " +
//            "AND (:name IS NULL OR :name = '' OR c.name LIKE CONCAT('%', :name, '%')) " +
//            "AND (:phone IS NULL OR :phone = '' OR c.phone LIKE CONCAT('%', :phone, '%')) " +
//            "AND (:userId IS NULL OR r.user_id = :userId)",
//            countQuery = "SELECT COUNT(DISTINCT c.id) FROM contract c " +
//                    "INNER JOIN room r ON c.room_id = r.id " +
//                    "WHERE 1=1 " +
//                    "AND (:name IS NULL OR :name = '' OR c.name LIKE CONCAT('%', :name, '%')) " +
//                    "AND (:phone IS NULL OR :phone = '' OR c.phone LIKE CONCAT('%', :phone, '%')) " +
//                    "AND (:userId IS NULL OR r.user_id = :userId)",
//            nativeQuery = true)
//    Page<Contract> searchContractsByNamePhoneAndUser(@Param("name") String name,
//                                                     @Param("phone") String phone,
//                                                     @Param("userId") Long userId,
//                                                     Pageable pageable);

    @Query(value = """
SELECT c FROM Contract c
JOIN c.room r
WHERE r.user.id = :userId
AND (:keyword IS NULL OR :keyword = '' OR
     LOWER(c.name) LIKE CONCAT('%', LOWER(:keyword), '%') OR
     LOWER(c.phone) LIKE CONCAT('%', LOWER(:keyword), '%'))
ORDER BY r.title ASC
""",
            countQuery = """
SELECT COUNT(DISTINCT c.id) FROM Contract c
JOIN c.room r
WHERE r.user.id = :userId
AND (:keyword IS NULL OR :keyword = '' OR
     LOWER(c.name) LIKE CONCAT('%', LOWER(:keyword), '%') OR
     LOWER(c.phone) LIKE CONCAT('%', LOWER(:keyword), '%'))
""")
    Page<Contract> searchContractsByKeyword(@Param("keyword") String keyword, @Param("userId") Long userId, Pageable pageable);

    @Query("SELECT c FROM Contract c JOIN c.room r WHERE 1=1 AND (:userId IS NULL OR r.user.id = :userId)")
    List<Contract> getAllContract(@Param("userId") Long userId);

    @Query(value = "SELECT c.id, c.name, c.phone, c.num_of_people, c.room_id, " +
            "c.deadline_contract, c.name_of_rent, c.files, " +
            "c.created_by, c.updated_by, c.created_at, c.updated_at " +
            "FROM contract c " +
            "INNER JOIN room r ON c.room_id = r.id " +
            "WHERE 1=1 " +
            "AND (:phone IS NULL OR :phone = '' OR c.phone LIKE CONCAT('%', :phone, '%'))",
            countQuery = "SELECT COUNT(DISTINCT c.id) FROM contract c " +
                    "INNER JOIN room r ON c.room_id = r.id " +
                    "WHERE 1=1 " +
                    "AND (:phone IS NULL OR :phone = '' OR c.phone LIKE CONCAT('%', :phone, '%'))",
            nativeQuery = true)
    Page<Contract> searchContractsByPhone(@Param("phone") String phone, Pageable pageable);
}