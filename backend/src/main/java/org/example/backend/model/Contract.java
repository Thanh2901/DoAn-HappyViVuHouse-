package org.example.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "contract")
@Data
@NoArgsConstructor
public class Contract extends AbstractEntity<Long>{

    private String name;

    private String files;

    @Column(name = "name_of_rent")
    private String nameOfRent;

    @Column(name = "deadline_contract")
    private LocalDateTime deadlineContract;

    @Column(name = "num_of_people")
    private Long numOfPeople;

    private String phone;

    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;

    public Contract(String name, String files, String nameOfRent, String deadlineContract,
                    String createdBy, String updatedBy, Room room) {
        super(createdBy, updatedBy);
        this.name = name;
        this.files = files;
        this.nameOfRent = nameOfRent;
        this.deadlineContract = LocalDateTime.parse(deadlineContract);
        this.room = room;
    }
}
