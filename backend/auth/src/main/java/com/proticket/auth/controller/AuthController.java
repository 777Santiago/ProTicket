package com.proticket.auth.controller;

import com.proticket.auth.dto.*;
import com.proticket.auth.entity.User;
import com.proticket.auth.service.*;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class AuthController {

  private final UserService userService;
  private final JwtService jwtService;
  private final PasswordResetService resetService;

  @Operation(summary="Registro de usuario")
  @PostMapping("/register")
  public ResponseEntity<JwtResponse> register(@Valid @RequestBody RegisterRequest req) {
    User u = userService.register(req.getEmail(), req.getPassword(), req.getRole());
    String token = jwtService.generate(Map.of("user_id", u.getId(), "role", u.getRole().getRoleName()));
    return ResponseEntity.ok(new JwtResponse(token, u.getId(), u.getRole().getRoleName()));
  }

  @Operation(summary="Login con email/password")
  @PostMapping("/login")
  public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest req) {
    User u = userService.authenticate(req.getEmail(), req.getPassword());
    String token = jwtService.generate(Map.of("user_id", u.getId(), "role", u.getRole().getRoleName()));
    return ResponseEntity.ok(new JwtResponse(token, u.getId(), u.getRole().getRoleName()));
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
}