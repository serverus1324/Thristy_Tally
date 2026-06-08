package com.example.CalcGastosU.controller;

import com.example.CalcGastosU.dto.PresupuestoConfiguracionUpdateDTO;
import com.example.CalcGastosU.dto.PresupuestoDTO;
import com.example.CalcGastosU.entity.Presupuesto;
import com.example.CalcGastosU.service.PresupuestoService;
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
@RequestMapping(path = "/api/v1/presupuestos")
public class PresupuestoController {

    @Autowired
    private PresupuestoService presupuestoService;

    @GetMapping
    public ResponseEntity<?> getAll() {
        List<Presupuesto> presupuestos = presupuestoService.getAll();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", presupuestos);
        response.put("mensaje", "Lista de presupuestos obtenida exitosamente");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable ObjectId id) {
        Optional<Presupuesto> presupuesto = presupuestoService.getById(id);
        if (presupuesto.isPresent()) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", presupuesto.get());
            response.put("mensaje", "Presupuesto obtenido exitosamente");
            return ResponseEntity.ok(response);
        } else {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", "Presupuesto no encontrado");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    @GetMapping("/por-perfil-periodo")
    public ResponseEntity<?> getByPerfilPeriodo(
            @RequestParam("idPerfil") String idPerfil,
            @RequestParam("idPeriodo") String idPeriodo) {
        try {
            if (!ObjectId.isValid(idPerfil) || !ObjectId.isValid(idPeriodo)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "mensaje", "Formato de idPerfil o idPeriodo inválido"));
            }
            Optional<Presupuesto> presupuesto = presupuestoService
                    .findByIdPerfilAndIdPeriodo(new ObjectId(idPerfil), new ObjectId(idPeriodo));
            if (presupuesto.isPresent()) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "data", presupuesto.get(),
                        "mensaje", "Presupuesto obtenido exitosamente"));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "mensaje", "Presupuesto no encontrado para perfil y período"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "mensaje", "Error al consultar presupuesto: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}/excedido")
    public ResponseEntity<?> presupuestoExcedido(@PathVariable ObjectId id) {
        boolean excedido = presupuestoService.presupuestoExcedido(id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", excedido);
        response.put("mensaje", "Estado de presupuesto excedido obtenido exitosamente");
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> save(@RequestBody PresupuestoDTO dto) {
        try {
            Presupuesto nuevo = presupuestoService.save(dto);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("id", nuevo.getId().toString());
            response.put("mensaje", "Presupuesto guardado exitosamente");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", "Error al guardar presupuesto: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable ObjectId id, @RequestBody PresupuestoDTO dto) {
        try {
            Presupuesto actualizado = presupuestoService.update(id, dto);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("id", actualizado.getId());
            response.put("mensaje", "Presupuesto actualizado exitosamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", "Error al actualizar presupuesto: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PatchMapping("/{id}/monto")
    public ResponseEntity<?> actualizarMontoPresupuesto(
            @PathVariable ObjectId id,
            @RequestParam Double nuevoMonto) {
        try{
            Presupuesto presupuesto = presupuestoService.actualizarMontoPresupuesto(id, nuevoMonto);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", presupuesto);
            response.put("mensaje", "Monto de presupuesto actualizado exitosamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", "Error al actualizar monto del presupuesto: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PatchMapping("/{id}/configuracion")
    public ResponseEntity<?> updatePresupuestoConfiguracion(
            @PathVariable ObjectId id,
            @RequestBody PresupuestoConfiguracionUpdateDTO dto) {
        try {
            Presupuesto presupuestoActualizado = presupuestoService.updateConfiguracion(id, dto);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", presupuestoActualizado);
            response.put("mensaje", "Configuración del presupuesto actualizada exitosamente.");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", "Error al actualizar la configuración del presupuesto: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable ObjectId id) {
        try{
            presupuestoService.delete(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("mensaje", "Presupuesto eliminado exitosamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", "Error al eliminar el presupuesto: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
}
