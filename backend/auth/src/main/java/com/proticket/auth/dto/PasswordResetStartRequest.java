package com.proticket.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PasswordResetStartRequest {
    @Email
    @NotBlank
    private String email;
}