package com.example.CalcGastosU.service;

import com.example.CalcGastosU.dto.PresupuestoDTO;
import com.example.CalcGastosU.entity.Perfil;
import com.example.CalcGastosU.entity.Necesidad;
import com.example.CalcGastosU.entity.Periodo;
import com.example.CalcGastosU.entity.Presupuesto;
import com.example.CalcGastosU.repository.PerfilRepository;
import com.example.CalcGastosU.repository.NecesidadRepository;
import com.example.CalcGastosU.repository.PeriodoRepository;
import com.example.CalcGastosU.repository.PresupuestoRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.CalcGastosU.dto.PresupuestoConfiguracionUpdateDTO;

import java.util.List;
import java.util.Optional;

@Service
public class PresupuestoService {

    @Autowired
    private PresupuestoRepository presupuestoRepository;

    @Autowired
    private PerfilRepository perfilRepository;

    @Autowired
    private PeriodoRepository periodoRepository;

    @Autowired
    NecesidadRepository necesidadRepository;

    public List<Presupuesto> getAll() {
        return presupuestoRepository.findAll();
    }

    public Optional<Presupuesto> getById(ObjectId id) {
        return presupuestoRepository.findById(id);
    }

    public Optional<Presupuesto> findByIdPerfilAndIdPeriodo(ObjectId idPerfil, ObjectId idPeriodo) {
        return presupuestoRepository.findByIdPerfilAndIdPeriodo(idPerfil, idPeriodo);
    }

    public Presupuesto save(PresupuestoDTO dto) {
        Perfil perfil = (Perfil) perfilRepository.findById(dto.getIdPerfil())
                .orElseThrow(() -> new RuntimeException("Perfil no encontrado"));

        Periodo periodo = periodoRepository.findById(dto.getIdPeriodo())
                .orElseThrow(() -> new RuntimeException("Periodo no encontrado"));

        Presupuesto presupuesto = new Presupuesto();
        presupuesto.setMonto(dto.getMonto());
        presupuesto.setDescripcion(dto.getDescripcion());
        presupuesto.setIdPerfil(perfil.getId());
        presupuesto.setIdPeriodo(periodo.getId());

        return presupuestoRepository.save(presupuesto);
    }

    public Presupuesto update(ObjectId id, PresupuestoDTO dto) {
        Presupuesto presupuesto = presupuestoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Presupuesto no encontrado"));

        Perfil perfil = perfilRepository.findById(dto.getIdPerfil())
                .orElseThrow(() -> new RuntimeException("Perfil no encontrado"));

        Periodo periodo = periodoRepository.findById(dto.getIdPeriodo())
                .orElseThrow(() -> new RuntimeException("Periodo no encontrado"));

        presupuesto.setMonto(dto.getMonto());
        presupuesto.setDescripcion(dto.getDescripcion());
        presupuesto.setIdPerfil(perfil.getId());
        presupuesto.setIdPeriodo(periodo.getId());

        return presupuestoRepository.save(presupuesto);
    }

    public boolean presupuestoExcedido(ObjectId idPresupuesto) {
        Presupuesto presupuesto = presupuestoRepository.findById(idPresupuesto)
                .orElseThrow(() -> new RuntimeException("Presupuesto no encontrado"));

        List<Necesidad> necesidades = necesidadRepository.findByIdPresupuesto(idPresupuesto);

        double totalNecesidades = necesidades.stream()
                .mapToDouble(n -> n.getMonto() != null ? n.getMonto() : 0.0)
                .sum();

        return totalNecesidades > presupuesto.getMonto();
    }

    public Presupuesto actualizarMontoPresupuesto(ObjectId idPresupuesto, Double montoNuevo) {
        Presupuesto presupuesto = presupuestoRepository.findById(idPresupuesto)
                .orElseThrow(() -> new RuntimeException("Presupuesto no encontrado"));

        presupuesto.setMonto(montoNuevo);
        presupuestoRepository.save(presupuesto);
        return presupuesto;
    }

    public void delete(ObjectId id) {
        presupuestoRepository.deleteById(id);
    }

    @Transactional
    public Presupuesto updateConfiguracion(ObjectId id, PresupuestoConfiguracionUpdateDTO dto) {
        Presupuesto presupuesto = presupuestoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Presupuesto no encontrado con ID: " + id));

        if (dto.getFrecuenciaCalculo() != null && !dto.getFrecuenciaCalculo().trim().isEmpty()) {
            presupuesto.setFrecuenciaCalculo(dto.getFrecuenciaCalculo());
        }

        if (dto.getPorcentajeAumento() != null) {
            presupuesto.setPorcentajeAumento(dto.getPorcentajeAumento());
        }

        return presupuestoRepository.save(presupuesto);
    }

}
