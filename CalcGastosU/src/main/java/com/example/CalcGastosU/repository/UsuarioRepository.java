package com.example.CalcGastosU.repository;

import com.example.CalcGastosU.entity.Usuario;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UsuarioRepository extends MongoRepository<Usuario, ObjectId> {
    Optional<Usuario> findByUsername(String username);
    boolean existsByUsername(String username);
    Optional<Usuario> findByEmail(String email);
    Optional<Usuario> findByCodigoVerificacion(String codigo);
    Optional<Usuario> findByIdPerfil(ObjectId idPerfil);
}
