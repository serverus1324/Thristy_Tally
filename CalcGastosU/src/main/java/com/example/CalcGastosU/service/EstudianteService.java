package com.example.CalcGastosU.service;

import com.example.CalcGastosU.dto.EstudianteDTO;
import com.example.CalcGastosU.entity.Estudiante;
import com.example.CalcGastosU.entity.Usuario;
import com.example.CalcGastosU.repository.EstudianteRepository;
import com.example.CalcGastosU.repository.UsuarioRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Cacheable
@Service
public class EstudianteService {

    @Autowired
    private EstudianteRepository estudianteRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public List<Estudiante> getEstudiantes() {
        return estudianteRepository.findAll();
    }

    public Optional<Estudiante> getEstudiante(ObjectId id) {
        return estudianteRepository.findById(id);
    }

    public Estudiante save(EstudianteDTO dto) {
        Estudiante estudiante = new Estudiante();
        estudiante.setNombre(dto.getNombre());
        estudiante.setEmail(dto.getEmail());
        estudiante.setTelefono(dto.getTelefono());
        estudiante.setTipoUsuario(dto.getTipoUsuario());

        estudianteRepository.save(estudiante);


        Usuario usuario = new Usuario();
        usuario.setUsername(dto.getUsername());
        usuario.setPassword(dto.getPassword());
        usuario.setIdPerfil(estudiante.getId()); //  Cambia "Estudiante" por "Perfil"
        usuarioRepository.save(usuario);

        return estudiante;
    }

    public Estudiante update(ObjectId idEstudiante, EstudianteDTO dto) {
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

        usuario.setUsername(dto.getUsername());
        usuario.setPassword(dto.getPassword());
        usuarioRepository.save(usuario);

        return estudiante;
    }


    public void delete(ObjectId id) {
        estudianteRepository.deleteById(id);
    }
}
