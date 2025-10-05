package com.hospital.service;

import com.hospital.dto.LoginRequest;
import com.hospital.dto.LoginResponse;

public interface AuthenticationService {
    LoginResponse authenticate(LoginRequest loginRequest);
    void logout(String token);
    boolean validateToken(String token);
}
