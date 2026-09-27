package com.example.CalcGastosU.controller;

import com.example.CalcGastosU.dto.LoginRequestDTO;
import com.example.CalcGastosU.entity.Perfil;
import com.example.CalcGastosU.entity.Usuario;
import com.example.CalcGastosU.security.JwtService;
import com.example.CalcGastosU.service.UsuarioService;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping(path = "/api/v1/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private JwtService jwtService;

    @GetMapping
    public ResponseEntity<?> GetUsuarios() {
        List<Usuario> usuarios = usuarioService.GetUsuarios();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", usuarios);
        response.put("mensaje", "Lista de usuarios obtenida exitosamente");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{idUsuario}")
    public ResponseEntity<?> GetUsuario(@PathVariable("idUsuario") ObjectId idUsuario) {
        Optional<Usuario> usuario = usuarioService.GetUsuario(idUsuario);
        if (usuario.isPresent()) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", usuario.get());
            response.put("mensaje", "Usuario obtenido exitosamente");
            return ResponseEntity.ok(response);
        } else {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", "Usuario no encontrado");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    @GetMapping("/byusername/{username}")
    public ResponseEntity<?> GetUsuarioByUsername(@PathVariable("username") String username) {
        Optional<Usuario> usuario = usuarioService.GetUsuarioByUsername(username);
        if (usuario.isPresent()) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", usuario.get());
            response.put("mensaje", "Usuario por username obtenido exitosamente");
            return ResponseEntity.ok(response);
        } else {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", "Usuario no encontrado");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    @PostMapping
    public ResponseEntity<?> save(@RequestBody Usuario usuario) {
        try {
            usuarioService.save(usuario);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("mensaje", "Usuario guardado exitosamente");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", "Error al guardar usuario: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @DeleteMapping("/{idUsuario}")
    public ResponseEntity<?> delete(@PathVariable("idUsuario") ObjectId idUsuario) {
        try {
            usuarioService.delete(idUsuario);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("mensaje", "Usuario eliminado exitosamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", "Error al eliminar usuario: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping("/existe/{username}")
    public ResponseEntity<?> UsuarioExists(@PathVariable("username") String username) {
        boolean existe = usuarioService.UsuarioExists(username);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", existe);
        response.put("mensaje", "Consulta de existencia de usuario exitosa");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/perfil/{idUsuario}")
    public ResponseEntity<?> getPerfil(@PathVariable("idUsuario") ObjectId idUsuario) {
        try {
            System.out.println(idUsuario);
            Perfil perfil = usuarioService.getPerfil(idUsuario);
            System.out.println(perfil);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", perfil);
            response.put("mensaje", "Perfil del usuario obtenido exitosamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", "Error al obtener perfil del usuario: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> iniciarSesion(@RequestBody LoginRequestDTO request) {
        try {
            Usuario usuario = usuarioService.iniciarSesion(request.getUsername(), request.getPassword());
            String token = jwtService.generarToken(usuario);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("token", token);
            response.put("idUsuario", usuario.getId() != null ? usuario.getId().toString() : null);
            response.put("idPerfil", usuario.getIdPerfil() != null ? usuario.getIdPerfil().toString() : null);
            response.put("username", usuario.getUsername());
            response.put("email", usuario.getEmail());
            response.put("nombre", usuario.getNombre());
            response.put("mensaje", "Inicio de sesión EXITOSO");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", e.getMessage());
            HttpStatus status;
            if (e.getMessage().equals("Usuario no encontrado")) {
                status = HttpStatus.NOT_FOUND;
            } else if (e.getMessage().equals("Contraseña incorrecta") ||
                       e.getMessage().equals("Usuario inactivo")) {
                status = HttpStatus.UNAUTHORIZED;
            } else {
                status = HttpStatus.INTERNAL_SERVER_ERROR;
            }
            return ResponseEntity.status(status).body(errorResponse);
        }
    }
}
