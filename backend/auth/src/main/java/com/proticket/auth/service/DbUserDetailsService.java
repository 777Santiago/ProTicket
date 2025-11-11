package com.proticket.auth.service;

import com.proticket.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service @RequiredArgsConstructor
public class DbUserDetailsService implements UserDetailsService {
  private final UserRepository users;

  @Override
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    var u = users.findByEmail(username).orElseThrow(() -> new UsernameNotFoundException("not found"));
    return new org.springframework.security.core.userdetails.User(
        u.getEmail(), u.getPasswordHash(),
        List.of(new SimpleGrantedAuthority("ROLE_"+u.getRole().getRoleName().toUpperCase()))
    );
  }
}