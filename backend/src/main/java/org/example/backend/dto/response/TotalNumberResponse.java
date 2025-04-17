package org.example.backend.dto.response;

import lombok.Data;

@Data
public class TotalNumberResponse {
    private Integer numberOfAccount;
    private Integer numberOfApprove;
    private Integer numberOfApproving;
    private Integer numberOfAccountLocked;
}
