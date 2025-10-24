package com.example.CalcGastosU.controller;

import com.example.CalcGastosU.dto.NecesidadDTO;
import com.example.CalcGastosU.dto.ResumenPresupuestoDTO;
import com.example.CalcGastosU.entity.Necesidad;
import com.example.CalcGastosU.service.NecesidadService;
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
@RequestMapping(path = "/api/v1/necesidades")
public class NecesidadController {

    @Autowired
    private NecesidadService necesidadService;

    @GetMapping
    public ResponseEntity<?> getAll() {
        List<Necesidad> necesidades = necesidadService.getAll();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", necesidades);
        response.put("mensaje", "Lista de necesidades obtenida exitosamente");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable ObjectId id) {
        Optional<Necesidad> necesidad = necesidadService.getById(id);
        if (necesidad.isPresent()) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", necesidad.get());
            response.put("mensaje", "Necesidad obtenida exitosamente");
            return ResponseEntity.ok(response);
        } else {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", "Necesidad no encontrada");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    @PostMapping
    public ResponseEntity<?> save(@RequestBody List<NecesidadDTO> dtoList) {
        try {
            List<Necesidad> necesidadesGuardadas = necesidadService.save(dtoList);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", necesidadesGuardadas); // Devuelve las entidades guardadas
            response.put("mensaje", String.format("%d necesidad(es) guardada(s) exitosamente.", necesidadesGuardadas.size()));
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) { // Captura excepciones como "Entidad no encontrada"
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) { // Captura otros errores inesperados
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", "Error inesperado al guardar necesidades: " + e.getCause());
            e.printStackTrace(); // Loggear el error completo en el servidor para depuración
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PutMapping
    public ResponseEntity<?> update(@RequestBody NecesidadDTO dto) {
        try {
            Necesidad necesidad = necesidadService.update(dto);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", necesidad);
            response.put("mensaje", "Necesidad actualizada exitosamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", "Error al actualizar la necesidad: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PutMapping("/{idNecesidad}/presupuesto/{idPresupuesto}")
    public ResponseEntity<?> asignarPresupuestoANecesidad(
            @PathVariable ObjectId idNecesidad,
            @PathVariable ObjectId idPresupuesto) {
        try {
            Necesidad necesidad = necesidadService.asignarPresupuestoANecesidad(idNecesidad, idPresupuesto);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", necesidad);
            response.put("mensaje", "Presupuesto asignado a necesidad exitosamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", "Error al asignar presupuesto: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping("/por-estudiante-periodo")
    public ResponseEntity<?> findByIdEstudianteAndIdPeriodo(
            @RequestParam ObjectId idEstudiante,
            @RequestParam ObjectId idPeriodo) {
        List<Necesidad> necesidades = necesidadService.findByIdEstudianteAndIdPeriodo(idEstudiante, idPeriodo);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", necesidades);
        response.put("mensaje", "Necesidades por estudiante y período obtenidas exitosamente");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/crear-con-validacion")
    public ResponseEntity<?> crearConValidacionPresupuesto(@RequestBody NecesidadDTO dto) {
        try {
            Necesidad necesidad = necesidadService.guardarConValidacionPresupuesto(dto, false);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", necesidad);
            response.put("mensaje", "Necesidad creada con validación exitosamente");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping("/resumen-presupuesto")
    public ResponseEntity<?> obtenerResumenPorPeriodo(
            @RequestParam("idEstudiante") String idEstudiante,
            @RequestParam("idPeriodo") String idPeriodo) {

        try {
            // validación de formato ObjectId
            if (!ObjectId.isValid(idEstudiante) || !ObjectId.isValid(idPeriodo)) {
                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "success", false,
                                "mensaje", "Formato de idEstudiante o idPeriodo inválido"));
            }

            ResumenPresupuestoDTO resumen = necesidadService.obtenerResumenPorPeriodo(
                    new ObjectId(idEstudiante),
                    new ObjectId(idPeriodo));

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", resumen,
                    "mensaje", "Resumen obtenido exitosamente"));

        } catch (RuntimeException ex) {
            // Capturamos la excepción lanzada por el servicio
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "success", false,
                            "mensaje", ex.getMessage()));
        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable ObjectId id) {
        try{
            necesidadService.delete(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("mensaje", "Necesidad eliminada exitosamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", "Error al eliminar la necesidad: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
}
