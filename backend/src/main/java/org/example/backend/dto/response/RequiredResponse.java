package org.example.backend.dto.response;

import lombok.Data;

@Data
public class RequiredResponse {
    private Long id;
    private String name;
    private String phoneNumber;
    private String description;
    private Boolean isAnswer;
    private RoomResponse room;
}
