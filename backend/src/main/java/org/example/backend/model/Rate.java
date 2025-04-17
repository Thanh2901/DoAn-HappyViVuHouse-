package org.example.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "rate")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Rate extends AbstractEntity<Long>{

    private Double rating;

    @OneToOne(mappedBy = "rate", cascade = CascadeType.ALL)
    private Comment comment;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;
}
