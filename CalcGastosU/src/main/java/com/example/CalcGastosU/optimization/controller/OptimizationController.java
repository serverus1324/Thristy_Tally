package com.example.CalcGastosU.optimization.controller;

import com.example.CalcGastosU.optimization.dto.OptimizationRequestDTO;
import com.example.CalcGastosU.optimization.exception.OptimizationException;
import com.example.CalcGastosU.optimization.service.OptimizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.bson.types.ObjectId;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/optimization")
public class OptimizationController {

    @Autowired
    private OptimizationService optimizationService;

    @PostMapping("/optimize")
    public ResponseEntity<?> optimize(@RequestBody OptimizationRequestDTO request) {
        try {
            return ResponseEntity.ok(optimizationService.optimize(request));
        } catch (OptimizationException ex) {
            HttpStatus status = ex.isInsufficientBudget()
                    ? HttpStatus.UNPROCESSABLE_ENTITY
                    : HttpStatus.BAD_REQUEST;
            return ResponseEntity.status(status).body(Map.of(
                    "success", false,
                    "status", ex.isInsufficientBudget()
                            ? "PRESUPUESTO_INSUFICIENTE"
                            : "DATOS_INVALIDOS",
                    "mensaje", ex.getMessage()));
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "success", false,
                    "status", "ACCESO_DENEGADO",
                    "mensaje", ex.getMessage()));
        }
    }

    @GetMapping("/preload/{idPeriodo}")
    public ResponseEntity<?> preload(
            @PathVariable String idPeriodo,
            @RequestParam(required = false) String idPresupuesto) {
        try {
            if (!ObjectId.isValid(idPeriodo)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "mensaje", "Formato de idPeriodo inválido"));
            }
            if (idPresupuesto != null && !ObjectId.isValid(idPresupuesto)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "mensaje", "Formato de idPresupuesto inválido"));
            }
            return ResponseEntity.ok(optimizationService.preload(
                    new ObjectId(idPeriodo),
                    idPresupuesto == null ? null : new ObjectId(idPresupuesto)));
        } catch (OptimizationException ex) {
            return ResponseEntity.status(ex.isInsufficientBudget()
                            ? HttpStatus.UNPROCESSABLE_ENTITY
                            : HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "success", false,
                            "status", ex.isInsufficientBudget()
                                    ? "PRESUPUESTO_INSUFICIENTE"
                                    : "DATOS_INVALIDOS",
                            "mensaje", ex.getMessage()));
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "success", false,
                    "status", "ACCESO_DENEGADO",
                    "mensaje", ex.getMessage()));
        }
    }
}
