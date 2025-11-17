package com.proticket.auth.controller;

import com.proticket.auth.dto.*;
import com.proticket.auth.entity.User;
import com.proticket.auth.service.*;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class AuthController {

  private final UserService userService;
  private final JwtService jwtService;
  private final PasswordResetService resetService;

  @Operation(summary="Registro de usuario")
@PostMapping("/register")
public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
  try {
    User u = userService.register(req.getEmail(), req.getPassword(), req.getRole());
    String token = jwtService.generate(Map.of("user_id", u.getId(), "role", u.getRole().getRoleName()));
    return ResponseEntity.ok(new JwtResponse(token, u.getId(), u.getRole().getRoleName()));
  } catch (IllegalArgumentException e) {
    // Mensajes de error específicos y amigables
    System.out.println("❌ Error de registro: " + e.getMessage());
    return ResponseEntity
        .status(HttpStatus.BAD_REQUEST)
        .body(Map.of("error", e.getMessage()));
  } catch (Exception e) {
    System.out.println("❌ Error inesperado en registro: " + e.getMessage());
    e.printStackTrace();
    return ResponseEntity
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(Map.of("error", "Error al crear la cuenta. Por favor, inténtalo de nuevo."));
  }
}

@Operation(summary="Login con email/password")
@PostMapping("/login")
public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
  try {
    User u = userService.authenticate(req.getEmail(), req.getPassword());
    String token = jwtService.generate(Map.of("user_id", u.getId(), "role", u.getRole().getRoleName()));
    return ResponseEntity.ok(new JwtResponse(token, u.getId(), u.getRole().getRoleName()));
  } catch (IllegalArgumentException e) {
    // Mensajes de error específicos y amigables
    System.out.println("❌ Error de login: " + e.getMessage());
    return ResponseEntity
        .status(HttpStatus.UNAUTHORIZED)
        .body(Map.of("error", e.getMessage()));
  } catch (Exception e) {
    System.out.println("❌ Error inesperado en login: " + e.getMessage());
    e.printStackTrace();
    return ResponseEntity
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(Map.of("error", "Error al iniciar sesión. Por favor, inténtalo de nuevo."));
  }
}

  @Operation(summary="Iniciar reset de contraseña (envía token por email en producción)")
  @PostMapping("/password/start")
  public ResponseEntity<Map<String,String>> start(@Valid @RequestBody PasswordResetStartRequest req) {
    String token = resetService.startReset(req.getEmail());
    // DEV: devolver token para pruebas; en prod, enviar por email
    return ResponseEntity.ok(Map.of("reset_token_dev", token));
  }

  @Operation(summary="Confirmar reset de contraseña")
  @PostMapping("/password/confirm")
  public ResponseEntity<Void> confirm(@Valid @RequestBody PasswordResetConfirmRequest req) {
    resetService.confirmReset(req.getToken(), req.getNewPassword());
    return ResponseEntity.noContent().build();
  }

  @Operation(summary="Obtener información básica de un usuario por ID")
  @GetMapping("/user/{userId}")
  public ResponseEntity<?> getUserInfo(@PathVariable String userId) {
    try {
      System.out.println("📊 Solicitando info del usuario: " + userId);
      
      User user = userService.getUserById(userId);
      
      if (user == null) {
        System.out.println("❌ Usuario no encontrado: " + userId);
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(Map.of("error", "Usuario no encontrado"));
      }
      
      System.out.println("✅ Usuario encontrado: " + user.getEmail());
      
      // Obtener el nombre desde user_metadata si existe
      String name = user.getEmail().split("@")[0]; // Por defecto usar email
      
      Map<String, Object> response = new HashMap<>();
      response.put("id", user.getId());
      response.put("name", name);
      response.put("email", user.getEmail());
      response.put("role", user.getRole().getRoleName());
      
      return ResponseEntity.ok(response);
    } catch (Exception e) {
      System.out.println("❌ Error obteniendo usuario: " + e.getMessage());
      e.printStackTrace();
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("error", "Error al obtener usuario: " + e.getMessage()));
    }
  }
}