package com.proticket.auth.repository;

import com.proticket.auth.entity.Role;
import com.proticket.auth.entity.User;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Testcontainers
class UserRepositoryIT {

@Container
@SuppressWarnings("resource")
static final MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0")
        .withDatabaseName("testdb")
        .withUsername("test")
        .withPassword("test");

  @DynamicPropertySource
  static void props(DynamicPropertyRegistry r) {
    r.add("spring.datasource.url", mysql::getJdbcUrl);
    r.add("spring.datasource.username", mysql::getUsername);
    r.add("spring.datasource.password", mysql::getPassword);
    r.add("spring.jpa.hibernate.ddl-auto", () -> "update");
  }

  @Autowired UserRepository users;
  @Autowired RoleRepository roles;

  @Test
  void saveAndFindByEmail() {
    Role role = roles.save(Role.builder().roleName("buyer").build());
    User u = users.save(User.builder()
        .email("a@b.com")
        .passwordHash("x")
        .role(role)
        .build());
    assertThat(users.findByEmail("a@b.com")).isPresent();
    assertThat(users.existsByEmail("a@b.com")).isTrue();
    assertThat(u.getId()).isNotNull();
  }
}