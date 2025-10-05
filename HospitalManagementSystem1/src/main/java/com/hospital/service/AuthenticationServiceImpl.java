package com.hospital.service;

import com.hospital.dto.LoginRequest;
import com.hospital.dto.LoginResponse;
import com.hospital.entity.Admin;
import com.hospital.repository.AdminRepository;
import com.hospital.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class AuthenticationServiceImpl implements AuthenticationService {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // In-memory blacklist for tokens (basic logout mechanism)
    private final Set<String> blacklistedTokens = new HashSet<>();

    @Override
    public LoginResponse authenticate(LoginRequest loginRequest) {
        Admin admin = adminRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), admin.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(admin.getEmail(), loginRequest.getUserType());

        return new LoginResponse(
                token,
                loginRequest.getUserType(),
                admin.getId(),
                admin.getName(),
                admin.getEmail(),
                "Login successful",
                true
        );
    }

    @Override
    public void logout(String token) {
        blacklistedTokens.add(token);
    }

    @Override
    public boolean validateToken(String token) {
        if (blacklistedTokens.contains(token)) {
            return false;
        }

        try {
            String email = jwtUtil.extractEmail(token);
            return jwtUtil.validateToken(token, email);
        } catch (Exception e) {
            return false;
        }
    }
}
