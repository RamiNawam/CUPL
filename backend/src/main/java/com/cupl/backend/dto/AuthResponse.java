package com.cupl.backend.dto;

import com.cupl.backend.model.User;

public class AuthResponse {
    private String email;
    private String role;
    private String token; // Simple token for now, can be JWT later

    public AuthResponse() {
    }

    public AuthResponse(User user, String token) {
        this.email = user.getEmail();
        this.role = user.getRole().name();
        this.token = token;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
