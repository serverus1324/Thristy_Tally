package com.example.CalcGastosU.repository;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.example.CalcGastosU.entity.Necesidad;

import java.util.List;

public interface NecesidadRepository extends MongoRepository<Necesidad, ObjectId> {
    List<Necesidad> findByIdPresupuesto(ObjectId idPresupuesto);
    List<Necesidad> findByIdPerfilAndIdPeriodo(ObjectId idPerfil, ObjectId idPeriodo);
}
