package com.example.CalcGastosU.service;

import com.example.CalcGastosU.dto.NecesidadDTO;
import com.example.CalcGastosU.dto.ResumenPresupuestoDTO;
import com.example.CalcGastosU.entity.Perfil;
import com.example.CalcGastosU.entity.Necesidad;
import com.example.CalcGastosU.entity.Periodo;
import com.example.CalcGastosU.entity.Presupuesto;
import com.example.CalcGastosU.repository.NecesidadRepository;
import com.example.CalcGastosU.repository.PeriodoRepository;
import com.example.CalcGastosU.repository.PresupuestoRepository;
import com.example.CalcGastosU.security.SecurityUtils;
import com.example.CalcGastosU.service.PerfilService;
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
    private PerfilService perfilService;

    @Autowired
    private PeriodoRepository periodoRepository;

    @Autowired
    private PresupuestoRepository presupuestoRepository;

    public List<Necesidad> getAll() {
        if (SecurityUtils.isAdmin()) {
            return necesidadRepository.findAll();
        }
        return SecurityUtils.getAuthenticatedIdPerfil()
                .map(necesidadRepository::findByIdPerfil)
                .orElseGet(List::of);
    }

    public Optional<Necesidad> getById(ObjectId id) {
        return necesidadRepository.findById(id)
                .map(necesidad -> {
                    SecurityUtils.esMismoIdPerfilOAdmin(necesidad.getIdPerfil());
                    return necesidad;
                });
    }

    public List<Necesidad> save(List<NecesidadDTO> dtoList) {
        if (dtoList == null || dtoList.isEmpty()) {
            return new ArrayList<>();
        }

        List<Necesidad> necesidadesGuardadas = new ArrayList<>();

        for (NecesidadDTO dto : dtoList) {
                Perfil perfil = perfilService.getOrCreateForId(resolverIdPerfilPropietario(dto.getIdPerfil()));

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

        SecurityUtils.esMismoIdPerfilOAdmin(necesidad.getIdPerfil());

        Presupuesto presupuesto = presupuestoRepository.findById(idPresupuesto)
                .orElseThrow(() -> new RuntimeException("Presupuesto no encontrado"));

        SecurityUtils.esMismoIdPerfilOAdmin(presupuesto.getIdPerfil());

        necesidad.setIdPresupuesto(presupuesto.getId());
        return necesidadRepository.save(necesidad);
    }

    public List<Necesidad> findByIdPerfilAndIdPeriodo(ObjectId idPerfil, ObjectId idPeriodo) {
        SecurityUtils.esMismoIdPerfilOAdmin(idPerfil);
        return necesidadRepository.findByIdPerfilAndIdPeriodo(idPerfil, idPeriodo);
    }

    public List<Necesidad> findByIdPresupuesto(ObjectId idPresupuesto) {
        presupuestoRepository.findById(idPresupuesto)
                .ifPresent(p -> SecurityUtils.esMismoIdPerfilOAdmin(p.getIdPerfil()));
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

        SecurityUtils.esMismoIdPerfilOAdmin(necesidad.getIdPerfil());

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
            necesidad.setIdPerfil(resolverIdPerfilPropietario(dto.getIdPerfil()));
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
        Perfil perfil = perfilService.getOrCreateForId(resolverIdPerfilPropietario(dto.getIdPerfil()));

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
        SecurityUtils.esMismoIdPerfilOAdmin(idPerfil);

        Presupuesto presupuesto = presupuestoRepository
                .findByIdPerfilAndIdPeriodo(idPerfil, idPeriodo)
                .orElseThrow(() -> new RuntimeException("Presupuesto no encontrado"));

        List<Necesidad> necesidades = necesidadRepository.findByIdPerfilAndIdPeriodo(idPerfil, idPeriodo);

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
        Necesidad necesidad = necesidadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Necesidad no encontrada"));
        SecurityUtils.esMismoIdPerfilOAdmin(necesidad.getIdPerfil());
        necesidadRepository.deleteById(id);
    }

    /**
     * Un ADMIN puede indicar el idPerfil destino; un usuario normal solo puede
     * crear recursos en su propio perfil (se ignora lo que envíe el cliente).
     */
    private ObjectId resolverIdPerfilPropietario(ObjectId idPerfilSolicitado) {
        if (SecurityUtils.isAdmin()) {
            return idPerfilSolicitado;
        }
        return SecurityUtils.getAuthenticatedIdPerfil()
                .orElseThrow(() -> new SecurityException("Sesión sin perfil asociado"));
    }
}
