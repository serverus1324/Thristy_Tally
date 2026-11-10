package com.example.CalcGastosU.service;

import com.example.CalcGastosU.dto.EstudianteDTO;
import com.example.CalcGastosU.entity.Estudiante;
import com.example.CalcGastosU.entity.Perfil;
import com.example.CalcGastosU.entity.Usuario;
import com.example.CalcGastosU.enums.Role;
import com.example.CalcGastosU.repository.EstudianteRepository;
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
public class EstudianteService {

    @Autowired
    private EstudianteRepository estudianteRepository;

    @Autowired
    private PerfilRepository perfilRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<Estudiante> getEstudiantes() {
        return estudianteRepository.findAll();
    }

    public Optional<Estudiante> getEstudiante(ObjectId id) {
        SecurityUtils.esMismoIdPerfilOAdmin(id);
        return estudianteRepository.findById(id);
    }

    public Estudiante save(EstudianteDTO dto) {
        String username = dto.getUsername();
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("El username es obligatorio");
        }
        if (usuarioRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("El nombre de usuario ya está en uso");
        }
        String email = dto.getEmail();
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("El correo electrónico es obligatorio");
        }
        if (usuarioRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("El correo electrónico ya está registrado");
        }
        String rawPassword = dto.getPassword();
        if (rawPassword == null || rawPassword.isBlank()) {
            throw new IllegalArgumentException("La contraseña es obligatoria");
        }

        ObjectId id = new ObjectId();

        Estudiante estudiante = new Estudiante();
        estudiante.setId(id);
        estudiante.setNombre(dto.getNombre());
        estudiante.setEmail(dto.getEmail());
        estudiante.setTelefono(dto.getTelefono());
        estudiante.setTipoUsuario(dto.getTipoUsuario());
        estudianteRepository.save(estudiante);

        Perfil perfil = new Perfil();
        perfil.setId(id);
        perfil.setNombre(dto.getNombre());
        perfil.setEmail(dto.getEmail());
        perfil.setTelefono(dto.getTelefono());
        perfil.setTipoUsuario(dto.getTipoUsuario());
        perfilRepository.save(perfil);

        Usuario usuario = new Usuario();
        usuario.setUsername(username);
        usuario.setPassword(passwordEncoder.encode(rawPassword));
        usuario.setEmail(dto.getEmail());
        usuario.setNombre(dto.getNombre());
        usuario.setIdPerfil(perfil.getId());
        usuario.setRoles(Set.of(Role.ROLE_USER));
        usuario.setActivo(true);
        usuarioRepository.save(usuario);

        return estudiante;
    }

    public Estudiante update(ObjectId idEstudiante, EstudianteDTO dto) {
        SecurityUtils.esMismoIdPerfilOAdmin(idEstudiante);

        Estudiante estudiante = estudianteRepository.findById(idEstudiante)
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));

        estudiante.setNombre(dto.getNombre());
        estudiante.setEmail(dto.getEmail());
        estudiante.setTelefono(dto.getTelefono());
        if (dto.getTipoUsuario() != null) {
            estudiante.setTipoUsuario(dto.getTipoUsuario());
        }
        estudianteRepository.save(estudiante);

        Usuario usuario = usuarioRepository.findByIdPerfil(estudiante.getId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (dto.getUsername() != null && !dto.getUsername().isBlank()) {
            String nuevoUsername = dto.getUsername();
            if (!nuevoUsername.equalsIgnoreCase(usuario.getUsername())
                    && usuarioRepository.existsByUsername(nuevoUsername)) {
                throw new IllegalArgumentException("El nombre de usuario ya está en uso");
            }
            usuario.setUsername(nuevoUsername);
        }

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

        return estudiante;
    }


    public void delete(ObjectId id) {
        if (!SecurityUtils.isAdmin()) {
            SecurityUtils.esMismoIdPerfilOAdmin(id);
        }
        estudianteRepository.deleteById(id);
    }
}
