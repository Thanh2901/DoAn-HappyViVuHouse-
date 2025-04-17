package org.example.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "message")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Message extends AbstractEntity<Long> {

    @ManyToOne
    @JoinColumn(name = "user1")
    private User sender;

    @ManyToOne
    @JoinColumn(name = "user2")
    private User receiver;

    @OneToMany(mappedBy = "message", cascade = CascadeType.ALL)
    private List<MessageChat> content;
}
