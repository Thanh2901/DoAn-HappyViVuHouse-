package org.example.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@EqualsAndHashCode(callSuper = false)
@Entity
@Table(name = "request")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Request extends AbstractEntity<Long> {

    private String name;

    private String phoneNumber;

    private String description;

    @Column(name = "is_answer")
    private Boolean isAnswer;

    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;

    public Request(String name, String phoneNumber, String description, Room room) {
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.description = description;
        this.room = room;
    }
}
