package com.example.CalcGastosU.security;

import com.example.CalcGastosU.entity.Usuario;
import com.example.CalcGastosU.enums.Role;
import org.bson.types.ObjectId;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

public final class SecurityUtils {

    private SecurityUtils() {
        throw new AssertionError("No instanciar SecurityUtils");
    }

    public static Optional<Authentication> getAuthentication() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return Optional.empty();
        }
        return Optional.of(auth);
    }

    public static Optional<Usuario> getAuthenticatedUsuario() {
        return getAuthentication()
                .map(Authentication::getPrincipal)
                .filter(p -> p instanceof Usuario)
                .map(p -> (Usuario) p);
    }

    public static Optional<ObjectId> getAuthenticatedUsuarioId() {
        return getAuthenticatedUsuario().map(Usuario::getId);
    }

    public static Optional<ObjectId> getAuthenticatedIdPerfil() {
        return getAuthenticatedUsuario().map(Usuario::getIdPerfil);
    }

    public static boolean isAdmin() {
        return getAuthenticatedUsuario()
                .map(u -> u.getRoles() != null && u.getRoles().contains(Role.ROLE_ADMIN))
                .orElse(false);
    }

    public static boolean hasRole(Role role) {
        return getAuthenticatedUsuario()
                .map(u -> u.getRoles() != null && u.getRoles().contains(role))
                .orElse(false);
    }

    public static void assertAdmin() {
        if (!isAdmin()) {
            throw new SecurityException("Acceso denegado: se requiere rol ADMIN");
        }
    }

    public static void esMismoIdPerfilOAdmin(ObjectId idPerfilRecurso) {
        if (idPerfilRecurso == null) {
            return;
        }
        if (isAdmin()) {
            return;
        }
        ObjectId miIdPerfil = getAuthenticatedIdPerfil().orElse(null);
        if (miIdPerfil == null || !miIdPerfil.equals(idPerfilRecurso)) {
            throw new SecurityException("Acceso denegado: este recurso no le pertenece");
        }
    }
}
