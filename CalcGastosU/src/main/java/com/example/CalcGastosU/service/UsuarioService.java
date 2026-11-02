package com.example.CalcGastosU.service;

import com.example.CalcGastosU.entity.Perfil;
import com.example.CalcGastosU.entity.Usuario;
import com.example.CalcGastosU.enums.Role;
import com.example.CalcGastosU.repository.PerfilRepository;
import com.example.CalcGastosU.repository.UsuarioRepository;
import com.example.CalcGastosU.security.SecurityUtils;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PerfilRepository perfilRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<Usuario> GetUsuarios() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> GetUsuario(ObjectId id) {
        if (!SecurityUtils.isAdmin()) {
            boolean esPropio = SecurityUtils.getAuthenticatedUsuarioId()
                    .map(id::equals)
                    .orElse(false);
            if (!esPropio) {
                throw new SecurityException("No tienes permiso para ver este usuario");
            }
        }
        return usuarioRepository.findById(id);
    }

    public Optional<Usuario> GetUsuarioByUsername(String username) {
        if (!SecurityUtils.isAdmin()) {
            boolean esPropio = SecurityUtils.getAuthenticatedUsuario()
                    .map(u -> username.equalsIgnoreCase(u.getUsername()))
                    .orElse(false);
            if (!esPropio) {
                throw new SecurityException("No tienes permiso para ver este usuario");
            }
        }
        return usuarioRepository.findByUsername(username);
    }

    public boolean UsuarioExists(String username) {
        return usuarioRepository.existsByUsername(username);
    }

    public Usuario save(Usuario usuario) {
        if (usuario.getPassword() != null && !usuario.getPassword().startsWith("$2")) {
            usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        }
        if (usuario.getRoles() == null || usuario.getRoles().isEmpty()) {
            usuario.setRoles(Set.of(Role.ROLE_USER));
        }
        if (usuario.getActivo() == null) {
            usuario.setActivo(true);
        }
        return usuarioRepository.save(usuario);
    }

    public void delete(ObjectId id) {
        if (!SecurityUtils.isAdmin()) {
            throw new SecurityException("Solo administradores pueden eliminar usuarios");
        }
        usuarioRepository.deleteById(id);
    }

    public Usuario actualizarRoles(ObjectId idUsuario, Set<Role> roles) {
        SecurityUtils.assertAdmin();
        if (roles == null || roles.isEmpty()) {
            throw new IllegalArgumentException("Debe indicar al menos un rol");
        }
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        usuario.setRoles(roles);
        return usuarioRepository.save(usuario);
    }

    public Usuario actualizarActivo(ObjectId idUsuario, boolean activo) {
        SecurityUtils.assertAdmin();
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        usuario.setActivo(activo);
        return usuarioRepository.save(usuario);
    }

    /**
     * Actualiza usuario, correo, nombre y/o contraseña de una cuenta.
     * Solo lo puede invocar un ADMIN. Los campos nulos o vacíos se ignoran.
     */
    public Usuario actualizarDatos(ObjectId idUsuario, String username, String email,
                                   String nombre, String password) {
        SecurityUtils.assertAdmin();

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (username != null && !username.isBlank()) {
            String nuevoUsername = username.trim();
            if (!nuevoUsername.equalsIgnoreCase(usuario.getUsername())
                    && usuarioRepository.existsByUsername(nuevoUsername)) {
                throw new IllegalArgumentException("El nombre de usuario ya está en uso");
            }
            usuario.setUsername(nuevoUsername);
        }

        if (email != null && !email.isBlank()) {
            String nuevoEmail = email.trim();
            if (!nuevoEmail.equalsIgnoreCase(usuario.getEmail())
                    && usuarioRepository.existsByEmail(nuevoEmail)) {
                throw new IllegalArgumentException("El correo ya está en uso");
            }
            usuario.setEmail(nuevoEmail);
        }

        if (nombre != null && !nombre.isBlank()) {
            usuario.setNombre(nombre.trim());
        }

        if (password != null && !password.isBlank()) {
            usuario.setPassword(passwordEncoder.encode(password));
        }

        Usuario guardado = usuarioRepository.save(usuario);

        // Mantener coherente el perfil asociado (nombre / correo)
        if (guardado.getIdPerfil() != null) {
            perfilRepository.findById(guardado.getIdPerfil()).ifPresent(perfil -> {
                if (nombre != null && !nombre.isBlank()) {
                    perfil.setNombre(nombre.trim());
                }
                if (email != null && !email.isBlank()) {
                    perfil.setEmail(email.trim());
                }
                perfilRepository.save(perfil);
            });
        }

        return guardado;
    }

    public Usuario iniciarSesion(String username, String password) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            throw new RuntimeException("Usuario inactivo");
        }

        boolean ok = false;
        boolean necesitaGuardar = false;

        // Ya hasheado con BCrypt ($2a/$2b/$2y)
        if (usuario.getPassword() != null && usuario.getPassword().startsWith("$2")) {
            ok = passwordEncoder.matches(password, usuario.getPassword());
        } else {
            // Migración sencilla lazy: password estaba en texto plano y coincide
            if (usuario.getPassword() != null && usuario.getPassword().equals(password)) {
                ok = true;
                usuario.setPassword(passwordEncoder.encode(password));
                necesitaGuardar = true;
            }
        }

        if (!ok) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        if (usuario.getRoles() == null || usuario.getRoles().isEmpty()) {
            usuario.setRoles(Set.of(Role.ROLE_USER));
            necesitaGuardar = true;
        }

        if (necesitaGuardar) {
            usuarioRepository.save(usuario);
        }

        return usuario;
    }

    public Perfil getPerfil(ObjectId idUsuario) {
        if (!SecurityUtils.isAdmin()) {
            boolean esPropio = SecurityUtils.getAuthenticatedUsuarioId()
                    .map(idUsuario::equals)
                    .orElse(false);
            if (!esPropio) {
                throw new SecurityException("No tienes permiso para ver el perfil de este usuario");
            }
        }

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        ObjectId idPerfil = usuario.getIdPerfil();
        if (idPerfil == null) {
            throw new RuntimeException("El usuario aún no tiene un perfil asociado");
        }

        return perfilRepository.findById(idPerfil)
                .orElseThrow(() -> new RuntimeException("Perfil no encontrado"));
    }
}
