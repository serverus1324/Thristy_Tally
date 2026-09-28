package com.example.CalcGastosU.config;

import com.example.CalcGastosU.security.JwtAuthFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.Map;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    @Autowired
    private ObjectMapper objectMapper;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                // CSRF: Deshabilitado. JWT stateless por header Authorization sin cookies.
                .csrf(csrf -> csrf.disable())

                // Sesiones: STATELESS (JWT lo gestiona todo)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // CORS: Se aplica el CorsFilter de CorsConfig.java (única fuente)
                .cors(cors -> {})

                // Handlers JSON consistentes 401/403 sin stack traces
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(401);
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            response.setCharacterEncoding("UTF-8");
                            Map<String, Object> body = Map.of(
                                    "success", false,
                                    "mensaje", "No autenticado: token ausente, inválido o expirado"
                            );
                            objectMapper.writeValue(response.getWriter(), body);
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(403);
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            response.setCharacterEncoding("UTF-8");
                            Map<String, Object> body = Map.of(
                                    "success", false,
                                    "mensaje", "Autenticado pero sin permisos suficientes para este recurso"
                            );
                            objectMapper.writeValue(response.getWriter(), body);
                        })
                )

                // ================================================================
                // REGLAS DE AUTORIZACIÓN (NO anyRequest().permitAll())
                // ================================================================
                .authorizeHttpRequests(auth -> auth

                        // ---------- PÚBLICOS ----------
                        .requestMatchers(
                                "/error",
                                "/api/test"
                        ).permitAll()

                        // Preflight CORS: siempre público
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Login endpoint (con y sin trailing slash para evitar mismatches en Spring Security 6)
                        .requestMatchers(HttpMethod.POST, "/api/v1/usuarios/login", "/api/v1/usuarios/login/").permitAll()

                        // Signup: Perfil + Usuario (con y sin trailing slash)
                        .requestMatchers(HttpMethod.POST, "/api/v1/perfiles", "/api/v1/perfiles/").permitAll()

                        // Signup: Estudiante (el frontend ViewSignup usa POST /api/v1/estudiantes/)
                        .requestMatchers(HttpMethod.POST, "/api/v1/estudiantes", "/api/v1/estudiantes/").permitAll()

                        // Consulta existencia username durante signup
                        .requestMatchers(HttpMethod.GET, "/api/v1/usuarios/existe/**").permitAll()

                        // Recuperación de contraseña
                        .requestMatchers(HttpMethod.POST, "/api/auth/**").permitAll()
                        
                                                // ---------- RAG (público para el taller) ----------
                        .requestMatchers(HttpMethod.POST, "/api/chat", "/api/chat/").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/salud", "/api/salud/").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/consultas", "/api/consultas/").permitAll()

                        // ---------- SOLO ADMIN ----------
                        .requestMatchers(HttpMethod.GET, "/api/v1/usuarios").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/usuarios/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/perfiles").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/perfiles/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/estudiantes", "/api/v1/estudiantes/").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/estudiantes/**").hasRole("ADMIN")
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // ---------- AUTENTICADOS (USER o ADMIN) ----------
                        // Ownership por recurso se valida dentro de cada service.
                        .anyRequest().authenticated()
                );

        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config
    ) throws Exception {
        return config.getAuthenticationManager();
    }
}