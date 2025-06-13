package org.example.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "configuration")
@Data
public class Configuration {
    @Id
    private String key; // Ví dụ: "REGULAR_POSTING_FEE", "VIP_POSTING_FEE", "REGULAR_ADMIN_FEE", "VIP_ADMIN_FEE"
    @Column(nullable = false)
    private String value; // Giá trị phí (VD: "5000", "10000", "1000", "2000")
}