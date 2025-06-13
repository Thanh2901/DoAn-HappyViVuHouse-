package org.example.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.Date;

@EqualsAndHashCode(callSuper = false)
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

    private String type = "CHAT";

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "user_name")
    private String userName;

    // New fields for file handling
    @Column(name = "file_name")
    private String fileName;

    @Column(name = "file_path")
    private String filePath;

    @Column(name = "file_type")
    private String fileType; // e.g., image/png, application/pdf

    @Column(name = "file_size")
    private Long fileSize; // in bytes

    // This field won't be stored in the database
    @Transient
    private String clientId;

    @Transient
    private Boolean isOwnMessage;
}