package com.example.CalcGastosU.controller;

import com.example.CalcGastosU.dto.ForgotPasswordRequest;
import com.example.CalcGastosU.dto.ResetPasswordRequest;
import com.example.CalcGastosU.dto.VerifyCodeRequest;
import com.example.CalcGastosU.entity.Usuario;
import com.example.CalcGastosU.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping(path = "/api/auth")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final Random random = new Random();

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(request.getEmail());
            if (usuarioOpt.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("mensaje", "Usuario no encontrado con ese email");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }

            Usuario usuario = usuarioOpt.get();
            String codigo = String.format("%06d", random.nextInt(1000000));
            LocalDateTime fechaExpiracion = LocalDateTime.now().plusMinutes(15);

            usuario.setCodigoVerificacion(codigo);
            usuario.setFechaExpiracionCodigo(fechaExpiracion);
            usuarioRepository.save(usuario);

            System.out.println("Código enviado a " + request.getEmail() + ": " + codigo);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("mensaje", "Código de verificación enviado exitosamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", "Error al procesar la solicitud: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyCode(@RequestBody VerifyCodeRequest request) {
        try {
            Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(request.getEmail());
            if (usuarioOpt.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("mensaje", "Usuario no encontrado");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }

            Usuario usuario = usuarioOpt.get();

            if (usuario.getCodigoVerificacion() == null || 
                !usuario.getCodigoVerificacion().equals(request.getCodigo())) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("mensaje", "Código incorrecto");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }

            if (usuario.getFechaExpiracionCodigo() == null || 
                LocalDateTime.now().isAfter(usuario.getFechaExpiracionCodigo())) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("mensaje", "Código expirado");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("mensaje", "Código verificado exitosamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", "Error al verificar el código: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(request.getEmail());
            if (usuarioOpt.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("mensaje", "Usuario no encontrado");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }

            Usuario usuario = usuarioOpt.get();

            if (usuario.getCodigoVerificacion() == null || 
                !usuario.getCodigoVerificacion().equals(request.getCodigo())) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("mensaje", "Código incorrecto");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }

            if (usuario.getFechaExpiracionCodigo() == null || 
                LocalDateTime.now().isAfter(usuario.getFechaExpiracionCodigo())) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("mensaje", "Código expirado");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }

            String passwordEncriptada = passwordEncoder.encode(request.getNuevaPassword());
            usuario.setPassword(passwordEncriptada);
            usuario.setCodigoVerificacion(null);
            usuario.setFechaExpiracionCodigo(null);
            usuarioRepository.save(usuario);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("mensaje", "Contraseña restablecida exitosamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", "Error al restablecer la contraseña: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
