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
    // Verificar si el email ya existe
    if (users.existsByEmail(email)) {
      throw new IllegalArgumentException("El email ya está registrado. Por favor, inicia sesión o usa otro email.");
    }
    
    // Verificar que el rol existe
    Role role = roles.findByRoleName(roleName)
        .orElseThrow(() -> new IllegalArgumentException("Rol no válido"));
    
    User u = User.builder()
        .email(email)
        .passwordHash(encoder.encode(rawPassword))
        .role(role)
        .build();
    return users.save(u);
  }

  public User authenticate(String email, String password) {
    // Buscar usuario por email
    User u = users.findByEmail(email)
        .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado. Por favor, verifica tu email o regístrate."));
    
    // Verificar contraseña
    if (!encoder.matches(password, u.getPasswordHash())) {
      throw new IllegalArgumentException("Contraseña incorrecta. Por favor, inténtalo de nuevo.");
    }
    
    // Actualizar último login
    u.setLastLogin(LocalDateTime.now());
    users.save(u);
    return u;
  }
}