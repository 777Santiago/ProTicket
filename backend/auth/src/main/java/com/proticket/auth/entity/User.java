package com.proticket.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity @Table(name="users",
       indexes = { @Index(name="idx_users_role", columnList="role_id") })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

  @Id
  @Column(name="id_user", length=36)
  private String id;

  @PrePersist
  public void pre() {
    if (id == null) id = UUID.randomUUID().toString();
  }

  @Column(nullable=false, unique=true, length=255)
  private String email;

  @Column(name="password_hash", nullable=false, length=255)
  private String passwordHash;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name="role_id", nullable=false)
  private Role role;

  @CreationTimestamp
  @Column(name="created_at")
  private LocalDateTime createdAt;

  @Column(name="last_login")
  private LocalDateTime lastLogin;
}