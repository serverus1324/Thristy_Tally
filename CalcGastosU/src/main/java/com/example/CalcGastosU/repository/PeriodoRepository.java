package com.example.CalcGastosU.repository;

import com.example.CalcGastosU.entity.Periodo;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PeriodoRepository extends MongoRepository<Periodo, ObjectId> {
    List<Periodo> findByIdEstudiante(ObjectId idEstudiante);
}
