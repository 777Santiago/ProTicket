package com.proticket.auth.service;

import com.proticket.auth.entity.PasswordResetToken;
import com.proticket.auth.entity.User;
import com.proticket.auth.repository.PasswordResetTokenRepository;
import com.proticket.auth.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;

@Service @RequiredArgsConstructor
public class PasswordResetService {
  private final UserRepository users;
  private final PasswordResetTokenRepository tokens;
  private final BCryptPasswordEncoder encoder;

  public static String sha256(String s) {
    try {
      MessageDigest md = MessageDigest.getInstance("SHA-256");
      return Base64.getEncoder().encodeToString(md.digest(s.getBytes(StandardCharsets.UTF_8)));
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  @Transactional
  public String startReset(String email) {
    User u = users.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("email not found"));
    String rawToken = UUID.randomUUID().toString();
    String tokenHash = sha256(rawToken);
    PasswordResetToken t = PasswordResetToken.builder()
        .user(u)
        .tokenHash(tokenHash)
        .expiresAt(LocalDateTime.now().plusMinutes(30))
        .used(false)
        .build();
    tokens.save(t);
    return rawToken;
  }

  @Transactional
  public void confirmReset(String rawToken, String newPassword) {
    String h = sha256(rawToken);
    PasswordResetToken t = tokens.findByTokenHashAndUsedFalseAndExpiresAtAfter(h, LocalDateTime.now())
        .orElseThrow(() -> new IllegalArgumentException("invalid or expired token"));
    User u = t.getUser();
    u.setPasswordHash(encoder.encode(newPassword));
    t.setUsed(true);
    users.save(u);
    tokens.save(t);
  }
}