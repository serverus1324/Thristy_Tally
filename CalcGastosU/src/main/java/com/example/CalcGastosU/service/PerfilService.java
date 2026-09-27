package com.example.CalcGastosU.service;

import com.example.CalcGastosU.dto.PerfilDTO;
import com.example.CalcGastosU.entity.Perfil;
import com.example.CalcGastosU.entity.Usuario;
import com.example.CalcGastosU.enums.Role;
import com.example.CalcGastosU.repository.PerfilRepository;
import com.example.CalcGastosU.repository.UsuarioRepository;
import com.example.CalcGastosU.security.SecurityUtils;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Cacheable
@Service
public class PerfilService {

    @Autowired
    private PerfilRepository perfilRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<Perfil> getPerfiles() {
        return perfilRepository.findAll();
    }

    public Optional<Perfil> getPerfil(ObjectId id) {
    SecurityUtils.esMismoIdPerfilOAdmin(id); 
    
    return perfilRepository.findById(id);
}

    public Perfil save(PerfilDTO dto) {
        // 1. Primero creamos y guardamos el Perfil
        Perfil perfil = new Perfil();
        perfil.setNombre(dto.getNombre());
        perfil.setEmail(dto.getEmail());
        perfil.setTelefono(dto.getTelefono());
        perfil.setTipoUsuario(dto.getTipoUsuario());

        Perfil nuevoPerfil = perfilRepository.save(perfil);

        // 2. Luego creamos y guardamos el Usuario, usando el ID del perfil
        Usuario usuario = new Usuario();
        usuario.setUsername(dto.getUsername());
        String raw = dto.getPassword();
        usuario.setPassword(raw != null ? passwordEncoder.encode(raw) : null);
        usuario.setEmail(dto.getEmail());
        usuario.setNombre(dto.getNombre());
        usuario.setIdPerfil(nuevoPerfil.getId());
        usuario.setRoles(Set.of(Role.ROLE_USER));
        usuario.setActivo(true);

        usuarioRepository.save(usuario);

        return nuevoPerfil;
    }

    public Perfil update(ObjectId idPerfil, PerfilDTO dto) {
    // ✅ Llama al método directamente. Él solo lanzará la excepción si no hay permiso.
    SecurityUtils.esMismoIdPerfilOAdmin(idPerfil);

    Perfil perfil = perfilRepository.findById(idPerfil)
            .orElseThrow(() -> new RuntimeException("Perfil no encontrado"));

    perfil.setNombre(dto.getNombre());
    perfil.setEmail(dto.getEmail());
    perfil.setTelefono(dto.getTelefono());
    if (dto.getTipoUsuario() != null) {
        perfil.setTipoUsuario(dto.getTipoUsuario());
    }
    perfilRepository.save(perfil);

    Usuario usuario = usuarioRepository.findByIdPerfil(perfil.getId())
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

    usuario.setUsername(dto.getUsername());

    // Solo sobrescribir password si viene con valor (evitar borrado accidental)
    String nueva = dto.getPassword();
    if (nueva != null && !nueva.isBlank()) {
        if (!nueva.startsWith("$2")) {
            usuario.setPassword(passwordEncoder.encode(nueva));
        } else {
            usuario.setPassword(nueva);
        }
    }

    usuario.setEmail(dto.getEmail());
    usuario.setNombre(dto.getNombre());
    usuarioRepository.save(usuario);

    return perfil;
}

    public void delete(ObjectId id) {
        if (!SecurityUtils.isAdmin()) {
            throw new SecurityException("Solo administradores pueden eliminar perfiles");
        }
        perfilRepository.deleteById(id);
    }
}
