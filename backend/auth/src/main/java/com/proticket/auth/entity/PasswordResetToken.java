package com.proticket.auth.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity @Table(name="password_reset_tokens",
       indexes = {
         @Index(name="idx_tokens_user", columnList="user_id"),
         @Index(name="idx_tokens_expires", columnList="expires_at")
       })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PasswordResetToken {
  @Id
  @Column(name="id_token", length=36)
  private String id;

  @PrePersist
  public void pre() { if (id == null) id = UUID.randomUUID().toString(); }

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name="user_id", nullable=false)
  private User user;

  @Column(name="token_hash", nullable=false, length=255)
  private String tokenHash;

  @Column(name="expires_at", nullable=false)
  private LocalDateTime expiresAt;

  @Column(nullable=false)
  @Builder.Default
  private Boolean used = false;
}