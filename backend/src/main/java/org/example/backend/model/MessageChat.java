package org.example.backend.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Entity
@Table(name = "message_chat")
@Data
public class MessageChat extends AbstractEntity<Long>{

    private String content;

    private Date sentAt;

    @Column(name = "is_read")
    private Boolean read;

    @Column(name = "send_by")
    private Boolean sendBy;

    @ManyToOne(cascade = CascadeType.MERGE)
    private Message message;
}
