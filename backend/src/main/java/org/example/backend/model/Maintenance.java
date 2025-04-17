package org.example.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance")
public class Maintenance extends AbstractEntity<Long>{

    private LocalDateTime maintenanceDate;

    private BigDecimal price;

    private String files;

    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;

    public Maintenance(LocalDateTime maintenanceDate, BigDecimal price, String files, String createdBy, String updatedBy, Room room) {
        super(createdBy, updatedBy);
        this.maintenanceDate = maintenanceDate;
        this.price = price;
        this.files = files;
        this.room = room;
    }

    public Maintenance() {

    }

    public LocalDateTime getMaintenanceDate() {
        return maintenanceDate;
    }

    public void setMaintenanceDate(LocalDateTime maintenanceDate) {
        this.maintenanceDate = maintenanceDate;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getFiles() {
        return files;
    }

    public void setFiles(String files) {
        this.files = files;
    }

    public Room getRoom() {
        return room;
    }

    public void setRoom(Room room) {
        this.room = room;
    }
}
