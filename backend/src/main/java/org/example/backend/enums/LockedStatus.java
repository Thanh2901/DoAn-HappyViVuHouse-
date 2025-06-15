package org.example.backend.enums;

import lombok.Getter;

@Getter
public enum LockedStatus {
    ENABLE("ENABLE"),
    DISABLE("DISABLE");

    private String value;

    LockedStatus(String value) {
        this.value = value;
    }

}
