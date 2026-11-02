package com.example.CalcGastosU.controller;

import com.example.CalcGastosU.dto.LoginRequestDTO;
import com.example.CalcGastosU.entity.Perfil;
import com.example.CalcGastosU.entity.Usuario;
import com.example.CalcGastosU.enums.Role;
import com.example.CalcGastosU.security.JwtService;
import com.example.CalcGastosU.service.UsuarioService;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

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

    @PatchMapping("/{idUsuario}/rol")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> actualizarRoles(
            @PathVariable("idUsuario") ObjectId idUsuario,
            @RequestBody Map<String, List<String>> body) {
        List<String> rolesRaw = body == null ? null : body.get("roles");
        if (rolesRaw == null || rolesRaw.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "mensaje", "Debe indicar al menos un rol"));
        }
        try {
            Set<Role> roles = new HashSet<>();
            for (String r : rolesRaw) {
                String normalizado = r != null && r.startsWith("ROLE_") ? r : "ROLE_" + r;
                roles.add(Role.valueOf(normalizado));
            }
            Usuario actualizado = usuarioService.actualizarRoles(idUsuario, roles);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("roles", actualizado.getRoles().stream().map(Enum::name).toList());
            response.put("mensaje", "Roles actualizados exitosamente");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", "Rol inválido. Valores permitidos: ROLE_USER, ROLE_ADMIN");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    @PatchMapping("/{idUsuario}/activo")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> actualizarActivo(
            @PathVariable("idUsuario") ObjectId idUsuario,
            @RequestBody Map<String, Boolean> body) {
        Boolean activo = body == null ? null : body.get("activo");
        if (activo == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "mensaje", "Debe indicar el campo 'activo'"));
        }
        try {
            Usuario actualizado = usuarioService.actualizarActivo(idUsuario, activo);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("activo", actualizado.getActivo());
            response.put("mensaje", "Estado del usuario actualizado exitosamente");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    @PatchMapping("/{idUsuario}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> actualizarDatos(
            @PathVariable("idUsuario") ObjectId idUsuario,
            @RequestBody Map<String, String> body) {
        String username = body == null ? null : body.get("username");
        String email = body == null ? null : body.get("email");
        String nombre = body == null ? null : body.get("nombre");
        String password = body == null ? null : body.get("password");

        if ((username == null || username.isBlank())
                && (email == null || email.isBlank())
                && (nombre == null || nombre.isBlank())
                && (password == null || password.isBlank())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "mensaje", "Debe indicar al menos un campo a actualizar"));
        }

        try {
            Usuario actualizado = usuarioService.actualizarDatos(idUsuario, username, email, nombre, password);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", Map.of(
                    "_id", actualizado.getId() != null ? actualizado.getId().toString() : "",
                    "username", actualizado.getUsername() != null ? actualizado.getUsername() : "",
                    "email", actualizado.getEmail() != null ? actualizado.getEmail() : "",
                    "nombre", actualizado.getNombre() != null ? actualizado.getNombre() : ""));
            response.put("mensaje", "Datos del usuario actualizados exitosamente");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
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
            response.put("roles", usuario.getRoles() != null
                    ? usuario.getRoles().stream().map(Enum::name).toList()
                    : List.of());
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
