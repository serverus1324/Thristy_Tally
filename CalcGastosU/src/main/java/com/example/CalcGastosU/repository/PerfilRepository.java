package com.example.CalcGastosU.repository;

import com.example.CalcGastosU.entity.Perfil;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PerfilRepository extends MongoRepository<Perfil, ObjectId> {
}
