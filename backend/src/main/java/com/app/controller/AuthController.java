package com.app.controller;

import com.app.dto.AuthRequest;
import com.app.dto.AuthResponse;
import com.app.dto.RefreshRequest;
import com.app.model.Role;
import com.app.model.User;
import com.app.repository.RoleRepository;
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
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final org.springframework.security.core.userdetails.UserDetailsService userDetailsService;

    /**
     * Registra un nuevo usuario en el sistema.
     * Si el email ya existe, devuelve un error 400.
     * Asigna el rol por defecto 'USER', encripta la contraseña y guarda el usuario.
     * Tras el registro, hace login automáticamente para devolver los tokens.
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody AuthRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().build();
        }

        Role userRole = roleRepository.findByName("USER")
                .orElseThrow(() -> new RuntimeException("Default role USER not found"));

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(new java.util.HashSet<>(java.util.Collections.singletonList(userRole)))
                .build();

        userRepository.save(user);

        // Aquí está la función que hace login automático tras el registro
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        return ResponseEntity.ok(buildAuthResponse(authentication, user));
    }

    /**
     * Autentica a un usuario existente.
     * Verifica las credenciales (email y contraseña) y, si son correctas,
     * genera y devuelve los tokens de acceso y refresco.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(buildAuthResponse(authentication, user));
    }

    /**
     * Renueva los tokens de sesión.
     * Recibe el 'refresh token', verifica que sea válido y no haya expirado,
     * y si es correcto, genera un nuevo 'access token' y un nuevo 'refresh token'.
     */
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody RefreshRequest request) {
        String refreshToken = request.getRefreshToken();
        String username = tokenProvider.extractUsername(refreshToken);

        if (username != null && !tokenProvider.isTokenExpired(refreshToken)) {
            org.springframework.security.core.userdetails.UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            
            // Aquí es donde se renuevan los tokens de sesión (Refresh Token)
            User user = userRepository.findByEmail(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Aquí generamos el objeto de autenticación para crear nuevos tokens
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities()
            );

            return ResponseEntity.ok(buildAuthResponse(authentication, user));
        }

        return ResponseEntity.status(401).build();
    }

    /**
     * Obtiene los datos del usuario actualmente autenticado.
     * Verifica el token de la petición actual y devuelve el perfil del usuario
     * (ID, username, email, rol y avatar). Si no hay sesión, devuelve 401.
     */
    @org.springframework.web.bind.annotation.GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || 
            !authentication.isAuthenticated() || 
            authentication.getName().equals("anonymousUser")) {
            return ResponseEntity.status(401).build();
        }
        
        try {
            User user = userRepository.findByEmail(authentication.getName())
                    .orElse(null);
            
            if (user == null) {
                return ResponseEntity.status(401).build();
            }
            
            AuthResponse.UserDto userDto = AuthResponse.UserDto.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .role(user.getRoles().stream().anyMatch(r -> r.getName().equals("ADMIN")) ? "ADMIN" : user.getRoles().stream().anyMatch(r -> r.getName().equals("MODERATOR")) ? "MODERATOR" : "USER")
                    .avatarUrl(user.getAvatarUrl())
                    .build();
            
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("user", userDto);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }

    /**
     * Método auxiliar privado para construir la respuesta de autenticación.
     * Genera los tokens JWT y mapea la entidad User a un DTO de usuario para el frontend.
     */
    private AuthResponse buildAuthResponse(Authentication auth, User user) {
        String accessToken = tokenProvider.generateAccessToken(auth);
        String refreshToken = tokenProvider.generateRefreshToken(auth);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(AuthResponse.UserDto.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .role(user.getRoles().stream().anyMatch(r -> r.getName().equals("ADMIN")) ? "ADMIN" : user.getRoles().stream().anyMatch(r -> r.getName().equals("MODERATOR")) ? "MODERATOR" : "USER")
                        .avatarUrl(user.getAvatarUrl())
                        .build())
                .build();
    }
}
