package com.proticket.auth.service;

import com.proticket.auth.entity.Role;
import com.proticket.auth.entity.User;
import com.proticket.auth.repository.RoleRepository;
import com.proticket.auth.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service @RequiredArgsConstructor
public class UserService {
  private final UserRepository users;
  private final RoleRepository roles;
  private final BCryptPasswordEncoder encoder;

  @Transactional
  public User register(String email, String rawPassword, String roleName) {
    if (users.existsByEmail(email)) throw new IllegalArgumentException("email already registered");
    Role role = roles.findByRoleName(roleName)
        .orElseThrow(() -> new IllegalArgumentException("role not found"));
    User u = User.builder()
        .email(email)
        .passwordHash(encoder.encode(rawPassword))
        .role(role)
        .build();
    return users.save(u);
  }

  public User authenticate(String email, String password) {
    User u = users.findByEmail(email)
        .orElseThrow(() -> new IllegalArgumentException("invalid credentials"));
    if (!encoder.matches(password, u.getPasswordHash()))
      throw new IllegalArgumentException("invalid credentials");
    u.setLastLogin(LocalDateTime.now());
    users.save(u);
    return u;
  }
}