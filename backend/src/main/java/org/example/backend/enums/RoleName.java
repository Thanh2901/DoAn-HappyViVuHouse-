package org.example.backend.enums;


public enum RoleName {
    ROLE_USER(" ROLE_USER"),
    ROLE_ADMIN("ROLE_ADMIN"),
    ROLE_RENTALER("ROLE_RENTALER");

    private String value;

    RoleName(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
