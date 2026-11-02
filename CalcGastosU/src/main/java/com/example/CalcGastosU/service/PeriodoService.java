package com.example.CalcGastosU.service;

import com.example.CalcGastosU.dto.PeriodoDTO;
import com.example.CalcGastosU.entity.Periodo;
import com.example.CalcGastosU.repository.PeriodoRepository;
import com.example.CalcGastosU.security.SecurityUtils;
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
        if (SecurityUtils.isAdmin()) {
            return periodoRepository.findAll();
        }
        return SecurityUtils.getAuthenticatedIdPerfil()
                .map(periodoRepository::findByIdPerfil)
                .orElseGet(List::of);
    }

    public Optional<Periodo> getById(ObjectId id) {
        return periodoRepository.findById(id)
                .map(periodo -> {
                    SecurityUtils.esMismoIdPerfilOAdmin(periodo.getIdPerfil());
                    return periodo;
                });
    }

    public List<Periodo> findByIdPerfil(ObjectId idPerfil) {
        SecurityUtils.esMismoIdPerfilOAdmin(idPerfil);
        return periodoRepository.findByIdPerfil(idPerfil);
    }

    public Periodo save(PeriodoDTO dto) {
        Periodo periodo = new Periodo();
        periodo.setNombre(dto.getNombre());
        periodo.setFechaInicio(dto.getFechaInicio());
        periodo.setFechaFin(dto.getFechaFin());
        periodo.setIdPerfil(resolverIdPerfilPropietario(dto.getIdPerfil()));
        return periodoRepository.save(periodo);
    }

    public Periodo update(ObjectId id, PeriodoDTO dto) {
        Periodo periodo = periodoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Periodo no encontrado"));

        SecurityUtils.esMismoIdPerfilOAdmin(periodo.getIdPerfil());

        periodo.setNombre(dto.getNombre());
        periodo.setFechaInicio(dto.getFechaInicio());
        periodo.setFechaFin(dto.getFechaFin());

        return periodoRepository.save(periodo);
    }

    public void delete(ObjectId id) {
        Periodo periodo = periodoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Periodo no encontrado"));
        SecurityUtils.esMismoIdPerfilOAdmin(periodo.getIdPerfil());
        periodoRepository.deleteById(id);
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
