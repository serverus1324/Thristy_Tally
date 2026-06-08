package com.example.CalcGastosU.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping(path = "/api/admin")
public class AdminController {

    @GetMapping("/dashboard-metrics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getDashboardMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("usuariosTotales", 120);
        metrics.put("modelosEntrenados", 4);
        metrics.put("logsErrores", 0);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", metrics);
        response.put("mensaje", "Métricas del dashboard obtenidas exitosamente");
        return ResponseEntity.ok(response);
    }
}
