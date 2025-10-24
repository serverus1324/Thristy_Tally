package com.example.CalcGastosU.service;

import com.example.CalcGastosU.dto.NecesidadDTO;
import com.example.CalcGastosU.dto.ResumenPresupuestoDTO;
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

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class NecesidadService {

    @Autowired
    private NecesidadRepository necesidadRepository;

    @Autowired
    private EstudianteRepository estudianteRepository;

    @Autowired
    private PeriodoRepository periodoRepository;

    @Autowired
    private PresupuestoRepository presupuestoRepository;

    public List<Necesidad> getAll() {
        return necesidadRepository.findAll();
    }

    public Optional<Necesidad> getById(ObjectId id) {
        return necesidadRepository.findById(id);
    }

    public List<Necesidad> save(List<NecesidadDTO> dtoList) {
        if (dtoList == null || dtoList.isEmpty()) {
            return new ArrayList<>(); // O lanzar una excepción si una lista vacía no es válida
        }

        List<Necesidad> necesidadesGuardadas = new ArrayList<>();

        for (NecesidadDTO dto : dtoList) {
            // Validar la existencia de las entidades referenciadas (Estudiante, Periodo, etc.)
            // Se asume que los IDs en el DTO son ObjectId o Strings convertibles a ObjectId
            Estudiante estudiante = estudianteRepository.findById(dto.getIdEstudiante())
                    .orElseThrow(() -> new RuntimeException("Estudiante no encontrado con ID: " + dto.getIdEstudiante()));

            Periodo periodo = periodoRepository.findById(dto.getIdPeriodo())
                    .orElseThrow(() -> new RuntimeException("Periodo no encontrado con ID: " + dto.getIdPeriodo()));

            // Opcional: Validar Presupuesto si es necesario
            if (dto.getIdPresupuesto() != null) {
                Presupuesto presupuesto = presupuestoRepository.findById(dto.getIdPresupuesto())
                        .orElseThrow(() -> new RuntimeException("Presupuesto no encontrado con ID: " + dto.getIdPresupuesto()));
                // Puedes usar la entidad presupuesto si la entidad Necesidad la requiere
            }

            Necesidad necesidadEntity = new Necesidad();
            necesidadEntity.setDescripcion(dto.getDescripcion());
            necesidadEntity.setMonto(dto.getMonto() != null ? dto.getMonto() : 0.0); // Valor por defecto si es nulo
            necesidadEntity.setEsPredeterminada(dto.getEsPredeterminada() != null ? dto.getEsPredeterminada() : 0); // 0=false, 1=true

            necesidadEntity.setIdEstudiante(estudiante.getId()); // Asigna el ObjectId del Estudiante
            necesidadEntity.setIdPeriodo(periodo.getId());     // Asigna el ObjectId del Periodo

            if (dto.getIdPresupuesto() != null) {
                necesidadEntity.setIdPresupuesto(dto.getIdPresupuesto()); // Asigna el ObjectId del Presupuesto
            }
            // El campo 'id' de Necesidad se genera automáticamente al guardar en MongoDB.
            // El campo 'excedePresupuesto' se calcularía, no se establecería desde el DTO al crear.

            necesidadesGuardadas.add(necesidadRepository.save(necesidadEntity));
        }

        return necesidadesGuardadas;
    }


    public Necesidad asignarPresupuestoANecesidad(ObjectId idNecesidad, ObjectId idPresupuesto) {
        Necesidad necesidad = necesidadRepository.findById(idNecesidad)
                .orElseThrow(() -> new RuntimeException("Necesidad no encontrada"));

        Presupuesto presupuesto = presupuestoRepository.findById(idPresupuesto)
                .orElseThrow(() -> new RuntimeException("Presupuesto no encontrado"));

        necesidad.setIdPresupuesto(presupuesto.getId());
        return necesidadRepository.save(necesidad);
    }

    public List<Necesidad> findByIdEstudianteAndIdPeriodo(ObjectId idEstudiante, ObjectId idPeriodo) {
        return necesidadRepository.findByIdEstudianteAndIdPeriodo(idEstudiante, idPeriodo);
    }

    public Necesidad update(NecesidadDTO dto) {
        Necesidad necesidad = new Necesidad();
        necesidad.setId(dto.getId());
        necesidad.setDescripcion(dto.getDescripcion());
        necesidad.setMonto(dto.getMonto());
        necesidad.setEsPredeterminada(dto.getEsPredeterminada());

        return necesidadRepository.save(necesidad);
    }
    public Necesidad guardarConValidacionPresupuesto(NecesidadDTO dto, boolean forzarGuardado) {
        Estudiante estudiante = estudianteRepository.findById(dto.getIdEstudiante())
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));

        Periodo periodo = periodoRepository.findById(dto.getIdPeriodo())
                .orElseThrow(() -> new RuntimeException("Periodo no encontrado"));

        Presupuesto presupuesto = presupuestoRepository.findById(dto.getIdPresupuesto())
                .orElse(null); // puede ser null

        Necesidad necesidad = new Necesidad();
        necesidad.setDescripcion(dto.getDescripcion());
        necesidad.setMonto(dto.getMonto());
        necesidad.setEsPredeterminada(dto.getEsPredeterminada());
        necesidad.setIdEstudiante(estudiante.getId());
        necesidad.setIdPeriodo(periodo.getId());
        necesidad.setIdPresupuesto(dto.getIdPresupuesto());

        if (presupuesto == null) {
            // CASO 1: No hay presupuesto
            necesidad.setExcedePresupuesto(false);
            return necesidadRepository.save(necesidad);
        }

        // CASO 2: Sí hay presupuesto
        List<Necesidad> necesidades = necesidadRepository.findByIdPresupuesto(presupuesto.getId());
        double totalExistente = necesidades.stream()
                .mapToDouble(n -> n.getMonto() != null ? n.getMonto() : 0.0)
                .sum();

        double totalConNueva = totalExistente + (dto.getMonto() != null ? dto.getMonto() : 0.0);

        if (totalConNueva > presupuesto.getMonto()) {
            if (!forzarGuardado) {
                throw new RuntimeException("La necesidad excede el presupuesto asignado");
            }
            necesidad.setExcedePresupuesto(true);
        } else {
            necesidad.setExcedePresupuesto(false);
        }

        return necesidadRepository.save(necesidad);
    }
    public ResumenPresupuestoDTO obtenerResumenPorPeriodo(ObjectId idEstudiante, ObjectId idPeriodo) {
        Presupuesto presupuesto = presupuestoRepository
                .findByIdEstudianteAndIdPeriodo(idEstudiante, idPeriodo)
                .orElseThrow(() -> new RuntimeException("Presupuesto no encontrado"));

        List<Necesidad> necesidades = necesidadRepository.findByIdPresupuesto(presupuesto.getId());

        double totalGastado = necesidades.stream()
                .mapToDouble(n -> n.getMonto() != null ? n.getMonto() : 0.0)
                .sum();

        double totalAsignado = presupuesto.getMonto() != null ? presupuesto.getMonto() : 0.0;
        double porcentajeConsumido = totalAsignado > 0 ? (totalGastado / totalAsignado) * 100 : 0;
        double disponible = totalAsignado - totalGastado;

        ResumenPresupuestoDTO resumen = new ResumenPresupuestoDTO();
        resumen.setDescripcionPresupuesto(presupuesto.getDescripcion());
        resumen.setTotalAsignado(totalAsignado);
        resumen.setTotalGastado(totalGastado);
        resumen.setPorcentajeConsumido(porcentajeConsumido);
        resumen.setDisponible(disponible);

        return resumen;
    }

    public void delete(ObjectId id) {
        necesidadRepository.deleteById(id);
    }
}
