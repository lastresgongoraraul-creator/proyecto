package com.app.controller;

import com.app.dto.AuthRequest;
import com.app.dto.AuthResponse;
import com.app.dto.RefreshRequest;
import com.app.model.Role;
import com.app.model.User;
import com.app.repository.UserRepository;
import com.app.security.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final org.springframework.security.core.userdetails.UserDetailsService userDetailsService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody AuthRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().build();
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();

        userRepository.save(user);

        // Auto login after registration
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        return ResponseEntity.ok(buildAuthResponse(authentication, user));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(buildAuthResponse(authentication, user));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody RefreshRequest request) {
        String refreshToken = request.getRefreshToken();
        String username = tokenProvider.extractUsername(refreshToken);

        if (username != null && !tokenProvider.isTokenExpired(refreshToken)) {
            org.springframework.security.core.userdetails.UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            
            // Re-authenticate or just generate tokens if valid
            // For simplicity and following the pattern:
            User user = userRepository.findByEmail(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // We need an Authentication object to generate tokens via the existing method
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities()
            );

            return ResponseEntity.ok(buildAuthResponse(authentication, user));
        }

        return ResponseEntity.status(401).build();
    }

    private AuthResponse buildAuthResponse(Authentication auth, User user) {
        String accessToken = tokenProvider.generateAccessToken(auth);
        String refreshToken = tokenProvider.generateRefreshToken(auth);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(AuthResponse.UserDto.builder()
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .role(user.getRole().name())
                        .build())
                .build();
    }
}
