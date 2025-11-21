package com.example.CalcGastosU.controller;

import com.example.CalcGastosU.service.PredictionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/predict")
public class PredictionController {

    private final PredictionService predictionService;

    public PredictionController(PredictionService predictionService) {
        this.predictionService = predictionService;
    }

    @PostMapping("/dataset")
    public ResponseEntity<?> uploadDataset(@RequestParam("file") MultipartFile file,
                                           @RequestParam(value = "classAttr", required = false) String classAttr,
                                           @RequestParam(value = "classIndex", required = false) Integer classIndex) {
        try {
            Map<String, Object> info = predictionService.trainFromFile(file, classAttr, classIndex);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", info,
                    "mensaje", "Dataset cargado y modelo J48 entrenado"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "success", false,
                    "mensaje", e.getMessage()
            ));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "mensaje", e.getMessage()
            ));
        }
    }

    // Endpoints removidos: el modelo se carga automáticamente desde resources

    @GetMapping("/status")
    public ResponseEntity<?> status() {
        Map<String, Object> s = predictionService.status();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", s
        ));
    }

    @GetMapping("/schema")
    public ResponseEntity<?> schema() {
        Map<String, Object> s = predictionService.schema();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", s
        ));
    }

    @PostMapping("/score")
    public ResponseEntity<?> score(@RequestBody Map<String, Object> features) {
        try {
            Map<String, Object> result = predictionService.predict(features);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", result,
                    "mensaje", "Predicción realizada"
            ));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.PRECONDITION_REQUIRED).body(Map.of(
                    "success", false,
                    "mensaje", e.getMessage()
            ));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "mensaje", e.getMessage()
            ));
        }
    }
}