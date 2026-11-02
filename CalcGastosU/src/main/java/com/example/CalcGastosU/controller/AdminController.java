package com.example.CalcGastosU.controller;

import com.example.CalcGastosU.entity.Usuario;
import com.example.CalcGastosU.enums.Role;
import com.example.CalcGastosU.repository.ConsultaRepository;
import com.example.CalcGastosU.repository.NecesidadRepository;
import com.example.CalcGastosU.repository.PresupuestoRepository;
import com.example.CalcGastosU.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping(path = "/api/admin")
public class AdminController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private NecesidadRepository necesidadRepository;

    @Autowired
    private PresupuestoRepository presupuestoRepository;

    @Autowired
    private ConsultaRepository consultaRepository;

    @GetMapping("/dashboard-metrics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getDashboardMetrics() {
        List<Usuario> usuarios = usuarioRepository.findAll();

        long total = usuarios.size();
        long activos = usuarios.stream()
                .filter(u -> Boolean.TRUE.equals(u.getActivo()))
                .count();
        long administradores = usuarios.stream()
                .filter(u -> u.getRoles() != null && u.getRoles().contains(Role.ROLE_ADMIN))
                .count();

        long totalNecesidades = necesidadRepository.count();
        long totalPresupuestos = presupuestoRepository.count();
        long totalConsultas = consultaRepository.count();

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("usuariosTotales", total);
        metrics.put("usuariosActivos", activos);
        metrics.put("administradores", administradores);
        metrics.put("totalNecesidades", totalNecesidades);
        metrics.put("totalPresupuestos", totalPresupuestos);
        metrics.put("totalConsultas", totalConsultas);

        // Últimos 5 usuarios registrados (asumiendo que el ID de MongoDB contiene la fecha)
        List<Usuario> ultimosUsuarios = usuarioRepository.findAll(
                PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "id"))
        ).getContent();

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", metrics);
        response.put("ultimosUsuarios", ultimosUsuarios);
        response.put("mensaje", "Métricas del dashboard obtenidas exitosamente");
        return ResponseEntity.ok(response);
    }
}
