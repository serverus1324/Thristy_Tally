package com.example.CalcGastosU.service;

import com.example.CalcGastosU.entity.Perfil;
import com.example.CalcGastosU.entity.Usuario;
import com.example.CalcGastosU.repository.PerfilRepository;
import com.example.CalcGastosU.repository.UsuarioRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Cacheable
@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PerfilRepository perfilRepository;

    public List<Usuario> GetUsuarios() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> GetUsuario(ObjectId id) {
        return usuarioRepository.findById(id);
    }

    public Optional<Usuario> GetUsuarioByUsername(String username) {
        return usuarioRepository.findByUsername(username);
    }

    public boolean UsuarioExists(String username) {
        return usuarioRepository.existsByUsername(username);
    }

    public Usuario save(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    public void delete(ObjectId id) {
        usuarioRepository.deleteById(id);
    }

    public Usuario iniciarSesion(String username, String password) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!usuario.getPassword().equals(password)) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        return usuario;
    }

    public Perfil getPerfil(ObjectId idUsuario) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        ObjectId idPerfil = usuario.getIdPerfil();

        return perfilRepository.findById(idPerfil)
                .orElseThrow(() -> new RuntimeException("Perfil no encontrado"));
    }
}
