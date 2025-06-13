package org.example.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = false)
@Entity
@Table(name = "room_media")
@Data
public class RoomMedia extends AbstractEntity<Long>{

    private String files;

    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;
}
