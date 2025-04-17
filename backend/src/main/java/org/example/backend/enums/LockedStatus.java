package org.example.backend.enums;

public enum LockedStatus {
    ENABLE("ENABLE"),
    DISABLE("DISABLE");

    private String value;

    LockedStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
