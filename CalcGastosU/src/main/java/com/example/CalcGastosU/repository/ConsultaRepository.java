package com.example.CalcGastosU.repository;

import com.example.CalcGastosU.entity.Consulta;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ConsultaRepository extends MongoRepository<Consulta, String> {
}