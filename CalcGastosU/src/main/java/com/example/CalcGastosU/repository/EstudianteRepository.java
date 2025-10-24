package com.example.CalcGastosU.repository;

import com.example.CalcGastosU.entity.Estudiante;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface EstudianteRepository extends MongoRepository<Estudiante, ObjectId> {
}