package org.example.backend.repository;

import org.example.backend.enums.TransactionStatus;
import org.example.backend.model.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    @Query("SELECT t FROM Transaction t WHERE t.room.id = :roomId")
    Optional<Transaction> getPendingTransactionByRoomId(@Param("roomId") Long roomId);
    Page<Transaction> findAllByStatus(TransactionStatus status, Pageable pageable);
    long countByStatus(TransactionStatus status);
}
