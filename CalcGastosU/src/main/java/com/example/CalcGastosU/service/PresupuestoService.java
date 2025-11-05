package com.example.CalcGastosU.service;

import com.example.CalcGastosU.dto.PresupuestoDTO;
import com.example.CalcGastosU.entity.Estudiante;
import com.example.CalcGastosU.entity.Necesidad;
import com.example.CalcGastosU.entity.Periodo;
import com.example.CalcGastosU.entity.Presupuesto;
import com.example.CalcGastosU.repository.EstudianteRepository;
import com.example.CalcGastosU.repository.NecesidadRepository;
import com.example.CalcGastosU.repository.PeriodoRepository;
import com.example.CalcGastosU.repository.PresupuestoRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.CalcGastosU.dto.PresupuestoConfiguracionUpdateDTO; // Importa el DTO

import java.util.List;
import java.util.Optional;

@Service
public class PresupuestoService {

    @Autowired
    private PresupuestoRepository presupuestoRepository;

    @Autowired
    private EstudianteRepository estudianteRepository;

    @Autowired
    private PeriodoRepository periodoRepository;

    @Autowired NecesidadRepository necesidadRepository;

    public List<Presupuesto> getAll() {
        return presupuestoRepository.findAll();
    }

    public Optional<Presupuesto> getById(ObjectId id) {
        return presupuestoRepository.findById(id);
    }

    public Optional<Presupuesto> findByIdEstudianteAndIdPeriodo(ObjectId idEstudiante, ObjectId idPeriodo) {
        return presupuestoRepository.findByIdEstudianteAndIdPeriodo(idEstudiante, idPeriodo);
    }

    public Presupuesto save(PresupuestoDTO dto) {
        Estudiante estudiante = (Estudiante) estudianteRepository.findById(dto.getIdEstudiante())
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));

        Periodo periodo = periodoRepository.findById(dto.getIdPeriodo())
                .orElseThrow(() -> new RuntimeException("Periodo no encontrado"));

        Presupuesto presupuesto = new Presupuesto();
        presupuesto.setMonto(dto.getMonto());
        presupuesto.setDescripcion(dto.getDescripcion());
        presupuesto.setIdEstudiante(estudiante.getId());
        presupuesto.setIdPeriodo(periodo.getId());

        return presupuestoRepository.save(presupuesto);
    }


    public Presupuesto update(ObjectId id, PresupuestoDTO dto) {
        Presupuesto presupuesto = presupuestoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Presupuesto no encontrado"));

        Estudiante estudiante = estudianteRepository.findById(dto.getIdEstudiante())
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));

        Periodo periodo = periodoRepository.findById(dto.getIdPeriodo())
                .orElseThrow(() -> new RuntimeException("Periodo no encontrado"));

        presupuesto.setMonto(dto.getMonto());
        presupuesto.setDescripcion(dto.getDescripcion());
        presupuesto.setIdEstudiante(estudiante.getId());
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

    @Transactional // Asegura atomicidad para la operación de actualización
    public Presupuesto updateConfiguracion(ObjectId id, PresupuestoConfiguracionUpdateDTO dto) {
        Presupuesto presupuesto = presupuestoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Presupuesto no encontrado con ID: " + id));

        // Actualizar frecuencia de cálculo si se proporciona en el DTO
        if (dto.getFrecuenciaCalculo() != null && !dto.getFrecuenciaCalculo().trim().isEmpty()) {
            // Aquí podrías añadir validación para los valores permitidos de frecuenciaCalculo
            // ej: if (!Arrays.asList("mensual", "semestral").contains(dto.getFrecuenciaCalculo())) {
            //          throw new IllegalArgumentException("Valor inválido para frecuenciaCalculo.");
            //      }
            presupuesto.setFrecuenciaCalculo(dto.getFrecuenciaCalculo());
        }

        // Actualizar porcentaje de aumento si se proporciona en el DTO
        // El frontend ya envía el valor normalizado (ej: 0.05 para 5%)
        if (dto.getPorcentajeAumento() != null) {
            // Aquí podrías añadir validación para el rango del porcentaje si es necesario
            // ej: if (dto.getPorcentajeAumento() < 0 || dto.getPorcentajeAumento() > 1) { // Asumiendo 0 a 100%
            //          throw new IllegalArgumentException("Porcentaje de aumento debe estar entre 0 y 1 (0% y 100%).");
            //      }
            presupuesto.setPorcentajeAumento(dto.getPorcentajeAumento());
        }

        return presupuestoRepository.save(presupuesto);
    }

}
