package com.example.CalcGastosU.service;

import com.example.CalcGastosU.dto.NecesidadDTO;
import com.example.CalcGastosU.dto.ResumenPresupuestoDTO;
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

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class NecesidadService {

    @Autowired
    private NecesidadRepository necesidadRepository;

    @Autowired
    private PerfilRepository perfilRepository;

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
            return new ArrayList<>();
        }

        List<Necesidad> necesidadesGuardadas = new ArrayList<>();

        for (NecesidadDTO dto : dtoList) {
            Perfil perfil = perfilRepository.findById(dto.getIdPerfil())
                    .orElseThrow(() -> new RuntimeException("Perfil no encontrado con ID: " + dto.getIdPerfil()));

            Periodo periodo = periodoRepository.findById(dto.getIdPeriodo())
                    .orElseThrow(() -> new RuntimeException("Periodo no encontrado con ID: " + dto.getIdPeriodo()));

            Necesidad necesidadEntity = new Necesidad();
            necesidadEntity.setDescripcion(dto.getDescripcion());
            necesidadEntity.setMonto(dto.getMonto() != null ? dto.getMonto() : 0.0);
            necesidadEntity.setEsPredeterminada(dto.getEsPredeterminada() != null ? dto.getEsPredeterminada() : 0);

            necesidadEntity.setIdPerfil(perfil.getId());
            necesidadEntity.setIdPeriodo(periodo.getId());

            if (dto.getIdPresupuesto() != null) {
                necesidadEntity.setIdPresupuesto(dto.getIdPresupuesto());
            }

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

    public List<Necesidad> findByIdPerfilAndIdPeriodo(ObjectId idPerfil, ObjectId idPeriodo) {
        return necesidadRepository.findByIdPerfilAndIdPeriodo(idPerfil, idPeriodo);
    }

    public List<Necesidad> findByIdPresupuesto(ObjectId idPresupuesto) {
        return necesidadRepository.findByIdPresupuesto(idPresupuesto);
    }

    public Necesidad update(NecesidadDTO dto) {
        if (dto == null || dto.getId() == null) {
            throw new IllegalArgumentException("Se requiere el ID de la necesidad para actualizar");
        }

        Optional<Necesidad> existenteOpt = necesidadRepository.findById(dto.getId());
        if (existenteOpt.isEmpty()) {
            throw new RuntimeException("Necesidad no encontrada para actualizar");
        }

        Necesidad necesidad = existenteOpt.get();

        if (dto.getDescripcion() != null) {
            necesidad.setDescripcion(dto.getDescripcion());
        }
        if (dto.getMonto() != null) {
            necesidad.setMonto(dto.getMonto());
        }
        if (dto.getEsPredeterminada() != null) {
            necesidad.setEsPredeterminada(dto.getEsPredeterminada());
        }

        if (dto.getIdPerfil() != null) {
            necesidad.setIdPerfil(dto.getIdPerfil());
        }
        if (dto.getIdPeriodo() != null) {
            necesidad.setIdPeriodo(dto.getIdPeriodo());
        }
        if (dto.getIdPresupuesto() != null) {
            necesidad.setIdPresupuesto(dto.getIdPresupuesto());
        }

        return necesidadRepository.save(necesidad);
    }

    public Necesidad guardarConValidacionPresupuesto(NecesidadDTO dto, boolean forzarGuardado) {
        Perfil perfil = perfilRepository.findById(dto.getIdPerfil())
                .orElseThrow(() -> new RuntimeException("Perfil no encontrado"));

        Periodo periodo = periodoRepository.findById(dto.getIdPeriodo())
                .orElseThrow(() -> new RuntimeException("Periodo no encontrado"));

        Presupuesto presupuesto = presupuestoRepository.findById(dto.getIdPresupuesto())
                .orElse(null);

        Necesidad necesidad = new Necesidad();
        necesidad.setDescripcion(dto.getDescripcion());
        necesidad.setMonto(dto.getMonto());
        necesidad.setEsPredeterminada(dto.getEsPredeterminada());
        necesidad.setIdPerfil(perfil.getId());
        necesidad.setIdPeriodo(periodo.getId());
        necesidad.setIdPresupuesto(dto.getIdPresupuesto());

        if (presupuesto == null) {
            necesidad.setExcedePresupuesto(false);
            return necesidadRepository.save(necesidad);
        }

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

    public ResumenPresupuestoDTO obtenerResumenPorPeriodo(ObjectId idPerfil, ObjectId idPeriodo) {
        Presupuesto presupuesto = presupuestoRepository
                .findByIdPerfilAndIdPeriodo(idPerfil, idPeriodo)
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
