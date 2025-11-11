package com.proticket.auth.service;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

  @Test
  void generateAndParse() {
    JwtService jwt = new JwtService("01234567890123456789012345678901", 60000);
    String token = jwt.generate(Map.of("user_id","u1","role","buyer"));
    Claims c = jwt.parse(token).getBody();
    assertThat(c.get("user_id")).isEqualTo("u1");
    assertThat(c.get("role")).isEqualTo("buyer");
  }
}