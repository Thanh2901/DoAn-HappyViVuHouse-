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

    // New fields for handling chat history and notifications
    private String type = "CHAT"; // Default is CHAT, can be JOIN, LEAVE

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "user_name")
    private String userName; // For JOIN/LEAVE messages to store who joined/left

    // Field used for client-side message identification
    @Transient // This field won't be stored in the database
    private String clientId;

    @Transient // This field won't be stored in the database
    private Boolean isOwnMessage;
}