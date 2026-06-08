package com.example.CalcGastosU.repository;

import com.example.CalcGastosU.entity.Presupuesto;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface PresupuestoRepository extends MongoRepository<Presupuesto, ObjectId> {
    Optional<Presupuesto> findByIdPerfilAndIdPeriodo(ObjectId idPerfil, ObjectId idPeriodo);
    List<Presupuesto> findByIdPerfil(ObjectId idPerfil);
}
