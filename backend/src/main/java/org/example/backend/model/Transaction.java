package org.example.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.example.backend.enums.TransactionStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@EqualsAndHashCode(callSuper = false)
@Entity
@Table(name = "transaction")
@Data
public class Transaction extends AbstractEntity<Long> {

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount; // Phí User trả

    @Column(name = "admin_fee", nullable = false)
    private BigDecimal adminFee; // Phí Admin nhận

    @Column(name = "transaction_date", nullable = false)
    private LocalDateTime transactionDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TransactionStatus status; // PENDING, SUCCESS, FAILED

    public Transaction() {
        this.transactionDate = LocalDateTime.now();
    }
}
