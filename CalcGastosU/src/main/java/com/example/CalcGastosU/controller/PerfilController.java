package com.example.CalcGastosU.controller;

import com.example.CalcGastosU.dto.PerfilDTO;
import com.example.CalcGastosU.entity.Perfil;
import com.example.CalcGastosU.service.PerfilService;
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
@RequestMapping(path = "/api/v1/perfiles")
public class PerfilController {

    @Autowired
    private PerfilService perfilService;

    @GetMapping
    public ResponseEntity<?> getPerfiles() {
        List<Perfil> perfiles = perfilService.getPerfiles();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", perfiles);
        response.put("mensaje", "Lista de perfiles obtenida exitosamente");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{idPerfil}")
    public ResponseEntity<?> getPerfil(@PathVariable("idPerfil") ObjectId idPerfil) {
        Optional<Perfil> perfil = perfilService.getPerfil(idPerfil);
        if (perfil.isPresent()) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", perfil.get());
            response.put("mensaje", "Perfil obtenido exitosamente");
            return ResponseEntity.ok(response);
        } else {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", "Perfil no encontrado");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    @PostMapping
    public ResponseEntity<?> save(@RequestBody PerfilDTO dto) {
        try {
            Perfil nuevoPerfil = perfilService.save(dto);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("idPerfil", nuevoPerfil.getId().toString());
            response.put("mensaje", "Perfil creado exitosamente");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", "Error al crear perfil: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PutMapping("/{idPerfil}")
    public ResponseEntity<?> update(@PathVariable("idPerfil") ObjectId idPerfil, @RequestBody PerfilDTO dto) {
        try {
            Perfil perfil = perfilService.update(idPerfil, dto);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("idPerfil", perfil.getId().toString());
            response.put("mensaje", "Perfil actualizado exitosamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", "Error al actualizar perfil: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @DeleteMapping("/{idPerfil}")
    public ResponseEntity<?> delete(@PathVariable("idPerfil") ObjectId idPerfil) {
        try {
            perfilService.delete(idPerfil);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("mensaje", "Perfil eliminado exitosamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", "Error al eliminar perfil: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
}
