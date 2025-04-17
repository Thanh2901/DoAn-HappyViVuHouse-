package org.example.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.example.backend.enums.LockedStatus;
import org.example.backend.enums.RoomStatus;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "room")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Room extends AbstractEntity<Long> {

    private String title;

    private String description;

    private BigDecimal price;

    private Double latitude;

    private Double longitude;

    private String address;

    @Enumerated(EnumType.STRING)
    private RoomStatus status;

    @Enumerated(EnumType.STRING)
    private LockedStatus isLocked;

    @Column(name = "is_approve")
    private Boolean isApprove;

    @Column(name = "is_remove")
    private Boolean isRemove;

    @ManyToOne
    @JoinColumn(name = "location_id")
    private Location location;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "room")
    private List<Comment> comments;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @OneToMany(mappedBy = "room")
    private List<Contract> contracts;

    @OneToMany(mappedBy = "room")
    private List<Asset> assets;

    @OneToMany(mappedBy = "room")
    private List<Request> requests;

    @OneToMany(mappedBy = "room")
    private List<Maintenance> maintenances;

    @OneToMany(mappedBy = "room")
    private List<Rate> rates;

    @OneToMany(mappedBy = "room")
    private List<RoomMedia> roomMedia;

    @OneToMany(mappedBy = "room")
    @JsonIgnore
    private List<BlogStore> blogStores;

    private BigDecimal waterCost = BigDecimal.ZERO;

    private BigDecimal publicElectricCost = BigDecimal.ZERO;

    private BigDecimal internetCost = BigDecimal.ZERO;

    public Room(String title, String description, BigDecimal price, Double latitude, Double longitude, String address, String username, String username1, Location location, Category category, User user, RoomStatus status, BigDecimal waterCost, BigDecimal publicElectricCost, BigDecimal internetCost) {
        super(username, username1);
        this.title = title;
        this.description = description;
        this.price = price;
        this.latitude = latitude;
        this.longitude = longitude;
        this.address = address;
        this.location = location;
        this.category = category;
        this.user = user;
        this.status = status;
        this.waterCost = waterCost;
        this.publicElectricCost = publicElectricCost;
        this.internetCost = internetCost;
        this.isLocked = LockedStatus.ENABLE;
        this.isApprove = Boolean.FALSE;
        this.isRemove = Boolean.FALSE;
    }
}
