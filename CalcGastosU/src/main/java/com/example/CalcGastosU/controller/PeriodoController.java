package com.example.CalcGastosU.controller;

import com.example.CalcGastosU.dto.PeriodoDTO;
import com.example.CalcGastosU.entity.Periodo;
import com.example.CalcGastosU.repository.PeriodoRepository;
import com.example.CalcGastosU.service.EstudianteService;
import com.example.CalcGastosU.service.PeriodoService;
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
@RequestMapping(path = "/api/v1/periodos")
public class PeriodoController {

    @Autowired
    private PeriodoService periodoService;

    @Autowired
    private PeriodoRepository periodoRepo;

    @Autowired
    private EstudianteService estudianteService;

    @GetMapping
    public ResponseEntity<?> getAll() {
        List<Periodo> periodos = periodoService.getAll();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", periodos);
        response.put("mensaje", "Lista de periodos obtenida exitosamente");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable ObjectId id) {
        Optional<Periodo> periodo = periodoService.getById(id);
        if (periodo.isPresent()) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", periodo.get());
            response.put("mensaje", "Periodo obtenido exitosamente");
            return ResponseEntity.ok(response);
        } else {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", "Periodo no encontrado");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    @PostMapping
    public ResponseEntity<?> save(@RequestBody PeriodoDTO dto) {
        try {
            Periodo nuevo = periodoService.save(dto);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("id", nuevo.getId().toString());
            response.put("mensaje", "Periodo guardado exitosamente");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", "Error al guardar periodo: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable ObjectId id, @RequestBody PeriodoDTO dto) {
        try{
            Periodo actualizado = periodoService.update(id, dto);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("id", actualizado.getId());
            response.put("mensaje", "Periodo actualizado exitosamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", "Error al actualizar el periodo: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable ObjectId id) {
        try{
            periodoService.delete(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("mensaje", "Periodo eliminado exitosamente");
            return ResponseEntity.ok(response); // 204 No Content
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", "Error al eliminar el periodo: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * GET /periodos/{idEstudiante}/por-estudiante
     * Devuelve todos los periodos de un estudiante dado su id.
     */
    @GetMapping("/{idEstudiante}/por-estudiante")
    public ResponseEntity<List<Periodo>> getPeriodosPorEstudiante(
            @PathVariable String idEstudiante) {

        // Validación básica del ObjectId
        if (!ObjectId.isValid(idEstudiante)) {
            return ResponseEntity.badRequest().build();
        }

        ObjectId oid = new ObjectId(idEstudiante);
        List<Periodo> periodos = periodoRepo.findByIdEstudiante(oid);

        if (periodos.isEmpty()) {
            // O bien devolver 204 No Content, según convención
            return ResponseEntity.ok().body(periodos);
        }

        return ResponseEntity.ok(periodos);
    }
}
