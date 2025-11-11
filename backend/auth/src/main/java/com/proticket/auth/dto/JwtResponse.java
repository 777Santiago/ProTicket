package com.proticket.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data @AllArgsConstructor
public class JwtResponse {
  private String token;
  private String userId;
  private String role;
}