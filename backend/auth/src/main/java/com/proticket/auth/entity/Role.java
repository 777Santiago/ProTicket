package com.proticket.auth.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name="roles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Role {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name="id_role")
  private Integer id;

  @Column(name="role_name", length=50, nullable=false, unique=true)
  private String roleName;
}