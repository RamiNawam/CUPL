package com.cupl.backend.dto;

import com.cupl.backend.model.Player;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public class PlayerResponse {
    private UUID id;
    private String fullName;
    private String gender;
    private LocalDate dateOfBirth;
    private String university;
    private String teamLevel;
    private UUID clubId;
    private String email;
    private String phone;
    private String medicalConditions;
    private String comments;
    private Instant createdAt;

    public static PlayerResponse from(Player player) {
        PlayerResponse response = new PlayerResponse();
        response.setId(player.getId());
        response.setFullName(player.getFullName());
        response.setGender(player.getGender());
        response.setDateOfBirth(player.getDateOfBirth());
        response.setUniversity(player.getUniversity());
        response.setTeamLevel(player.getTeamLevel());
        response.setClubId(player.getClubId());
        response.setEmail(player.getEmail());
        response.setPhone(player.getPhone());
        response.setMedicalConditions(player.getMedicalConditions());
        response.setComments(player.getComments());
        response.setCreatedAt(player.getCreatedAt());
        return response;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getUniversity() {
        return university;
    }

    public void setUniversity(String university) {
        this.university = university;
    }

    public String getTeamLevel() {
        return teamLevel;
    }

    public void setTeamLevel(String teamLevel) {
        this.teamLevel = teamLevel;
    }

    public UUID getClubId() {
        return clubId;
    }

    public void setClubId(UUID clubId) {
        this.clubId = clubId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getMedicalConditions() {
        return medicalConditions;
    }

    public void setMedicalConditions(String medicalConditions) {
        this.medicalConditions = medicalConditions;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
