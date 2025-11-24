package com.example.CalcGastosU.controller;

import com.example.CalcGastosU.service.PredictionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/prediccion")
public class PredictionController {

    @Autowired
    private PredictionService predictionService;

    @GetMapping("/status")
    public ResponseEntity<?> status() {
        return ResponseEntity.ok(predictionService.getStatus());
    }

    @GetMapping("/schema")
    public ResponseEntity<?> schema() {
        return ResponseEntity.ok(predictionService.getSchema());
    }

    @PostMapping("/necesidad")
    public ResponseEntity<?> predecir(@RequestBody Map<String, Object> payload) {
        try {
            String resultado = predictionService.predecir(payload);
            return ResponseEntity.ok(Map.of("resultado", resultado));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}