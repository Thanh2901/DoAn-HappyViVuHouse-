package org.example.backend.repository;

import org.example.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByPhone(String phone);

    Boolean existsByEmail(String email);

    List<User> findByName(String name);

    long count();

    // custom repository
    @Query(value = """
    SELECT * FROM users u
    WHERE 1=1
    AND u.email NOT IN ('admin@gmail.com')
    AND (:keyword IS NULL OR :keyword = '' OR
        u.name ILIKE CONCAT('%', :keyword, '%') OR
        u.email ILIKE CONCAT('%', :keyword, '%'))""",
                countQuery = """
    SELECT COUNT(DISTINCT u.id) FROM users u
    WHERE 1=1
    AND u.email NOT IN ('admin@gmail.com')
    AND (:keyword IS NULL OR :keyword = '' OR
        u.name ILIKE CONCAT('%', :keyword, '%') OR
        u.email ILIKE CONCAT('%', :keyword, '%'))""",
                nativeQuery = true)
    Page<User> searchingAccount(String keyword, Pageable pageable);

    @Modifying
    @Query(value = "DELETE FROM user_roles WHERE user_id=:user_id", nativeQuery = true)
    void deleteRoleOfAccount(@Param("user_id") Long user_id);

    @Query(value = """
            SELECT * FROM users u
            INNER JOIN user_roles ur on u.id = ur.user_id
            WHERE ur.role_id = 3
            AND u.name LIKE CONCAT('%', :name, '%')
            """, nativeQuery = true)
    User getAccountRoleUserByName(@Param("name") String name);
}
