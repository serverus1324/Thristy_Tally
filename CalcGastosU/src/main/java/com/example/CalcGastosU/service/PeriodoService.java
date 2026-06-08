package com.example.CalcGastosU.service;

import com.example.CalcGastosU.dto.PeriodoDTO;
import com.example.CalcGastosU.entity.Periodo;
import com.example.CalcGastosU.repository.PeriodoRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PeriodoService {

    @Autowired
    private PeriodoRepository periodoRepository;

    public List<Periodo> getAll() {
        return periodoRepository.findAll();
    }

    public Optional<Periodo> getById(ObjectId id) {
        return periodoRepository.findById(id);
    }

    public Periodo save(PeriodoDTO dto) {
        Periodo periodo = new Periodo();
        periodo.setNombre(dto.getNombre());
        periodo.setFechaInicio(dto.getFechaInicio());
        periodo.setFechaFin(dto.getFechaFin());
        periodo.setIdPerfil(dto.getIdPerfil());
        return periodoRepository.save(periodo);
    }

    public Periodo update(ObjectId id, PeriodoDTO dto) {
        Periodo periodo = periodoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Periodo no encontrado"));

        periodo.setNombre(dto.getNombre());
        periodo.setFechaInicio(dto.getFechaInicio());
        periodo.setFechaFin(dto.getFechaFin());

        return periodoRepository.save(periodo);
    }

    public void delete(ObjectId id) {
        periodoRepository.deleteById(id);
    }
}
