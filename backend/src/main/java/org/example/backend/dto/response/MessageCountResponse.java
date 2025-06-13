package org.example.backend.dto.response;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MessageCountResponse {
    private Long userId;
    private String username;
    private Integer unreadCount;
    private String lastReadAt;
    private String message;
}
