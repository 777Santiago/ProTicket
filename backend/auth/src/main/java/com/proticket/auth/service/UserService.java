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
import java.util.Optional;

@Service @RequiredArgsConstructor
public class UserService {
  private final UserRepository users;
  private final RoleRepository roles;
  private final BCryptPasswordEncoder encoder;

  @Transactional
public User register(String email, String rawPassword, String roleName) {
  // Verificar si el email ya existe
  if (users.existsByEmail(email)) {
    throw new IllegalArgumentException("Este correo electrónico ya está registrado");
  }
  
  // Validar rol permitido
  if (!roleName.equals("buyer") && !roleName.equals("organizer") && !roleName.equals("admin")) {
    throw new IllegalArgumentException("Tipo de cuenta no válido");
  }
  
  // Verificar que el rol existe
  Role role = roles.findByRoleName(roleName)
      .orElseThrow(() -> new IllegalArgumentException("Tipo de cuenta no válido"));
  
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
      .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
  
  // Verificar contraseña
  if (!encoder.matches(password, u.getPasswordHash())) {
    throw new IllegalArgumentException("Contraseña incorrecta");
  }
  
  // Actualizar último login
  u.setLastLogin(LocalDateTime.now());
  users.save(u);
  return u;
}

  public User getUserById(String userId) {
    Optional<User> user = users.findById(userId);
    return user.orElse(null);
  }
}