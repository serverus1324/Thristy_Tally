package com.example.CalcGastosU.controller;

import com.example.CalcGastosU.dto.EstudianteDTO;
import com.example.CalcGastosU.entity.Estudiante;
import com.example.CalcGastosU.service.EstudianteService;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping(path = "/api/v1/estudiantes/")
public class EstudianteController {

    @Autowired
    private EstudianteService estudianteService;

    @GetMapping
    public ResponseEntity<?> getEstudiantes() {
        List<Estudiante> estudiantes = estudianteService.getEstudiantes();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", estudiantes);
        response.put("mensaje", "Lista de estudiantes obtenida exitosamente");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{idEstudiante}")
    public ResponseEntity<?> getEstudiante(@PathVariable("idEstudiante") ObjectId idEstudiante) {
        Optional<Estudiante> estudiante = estudianteService.getEstudiante(idEstudiante);
        if (estudiante.isPresent()) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", estudiante.get());
            response.put("mensaje", "Estudiante obtenido exitosamente");
            return ResponseEntity.ok(response);
        } else {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", "Estudiante no encontrado");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    @PostMapping
    public ResponseEntity<?> save(@RequestBody EstudianteDTO dto) {
        try {
            Estudiante nuevo = estudianteService.save(dto);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("idEstudiante", nuevo.getIdEstudiante());
            response.put("mensaje", "Estudiante creado exitosamente");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", "Error al crear estudiante: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PutMapping("/{idEstudiante}")
    public ResponseEntity<?> update(@PathVariable("idEstudiante") ObjectId idEstudiante, @RequestBody EstudianteDTO dto) {
        try {
            Estudiante actualizado = estudianteService.update(idEstudiante, dto);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("idEstudiante", actualizado.getIdEstudiante());
            response.put("mensaje", "Estudiante actualizado exitosamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", "Error al actualizar estudiante: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @DeleteMapping("/{idEstudiante}")
    public ResponseEntity<?> delete(@PathVariable("idEstudiante") ObjectId idEstudiante) {
        try {
            estudianteService.delete(idEstudiante);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("mensaje", "Estudiante eliminado exitosamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", "Error al eliminar estudiante: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
}
