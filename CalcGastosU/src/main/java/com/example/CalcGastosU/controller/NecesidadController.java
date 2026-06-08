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

@CrossOrigin(origins = "http://localhost:5173")
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
            response.put("data", necesidadesGuardadas);
            response.put("mensaje", String.format("%d necesidad(es) guardada(s) exitosamente.", necesidadesGuardadas.size()));
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", "Error inesperado al guardar necesidades: " + e.getCause());
            e.printStackTrace();
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

    @GetMapping("/por-perfil-periodo")
    public ResponseEntity<?> findByIdPerfilAndIdPeriodo(
            @RequestParam ObjectId idPerfil,
            @RequestParam ObjectId idPeriodo) {
        List<Necesidad> necesidades = necesidadService.findByIdPerfilAndIdPeriodo(idPerfil, idPeriodo);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", necesidades);
        response.put("mensaje", "Necesidades por perfil y período obtenidas exitosamente");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/por-presupuesto")
    public ResponseEntity<?> findByIdPresupuesto(@RequestParam("idPresupuesto") String idPresupuesto) {
        try {
            if (!ObjectId.isValid(idPresupuesto)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "mensaje", "Formato de idPresupuesto inválido"));
            }
            List<Necesidad> necesidades = necesidadService.findByIdPresupuesto(new ObjectId(idPresupuesto));
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", necesidades,
                    "mensaje", "Necesidades por presupuesto obtenidas exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "mensaje", "Error al consultar necesidades por presupuesto: " + e.getMessage()));
        }
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
            @RequestParam("idPerfil") String idPerfil,
            @RequestParam("idPeriodo") String idPeriodo) {

        try {
            if (!ObjectId.isValid(idPerfil) || !ObjectId.isValid(idPeriodo)) {
                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "success", false,
                                "mensaje", "Formato de idPerfil o idPeriodo inválido"));
            }

            ResumenPresupuestoDTO resumen = necesidadService.obtenerResumenPorPeriodo(
                    new ObjectId(idPerfil),
                    new ObjectId(idPeriodo));

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", resumen,
                    "mensaje", "Resumen obtenido exitosamente"));

        } catch (RuntimeException ex) {
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
