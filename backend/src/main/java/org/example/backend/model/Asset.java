package org.example.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "asset")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Asset extends AbstractEntity<Long>{

    private String name;

    private Integer number;

    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;
}
