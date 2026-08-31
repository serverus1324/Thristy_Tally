package com.miproyecto.Controller;

import com.example.CalcGastosU.controller.NecesidadController;  // ← IMPORTAR EL CONTROLLER
import com.example.CalcGastosU.dto.NecesidadDTO;
import com.example.CalcGastosU.dto.ResumenPresupuestoDTO;
import com.example.CalcGastosU.entity.Necesidad;
import com.example.CalcGastosU.service.NecesidadService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;  // ← CAMBIADO
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(NecesidadController.class)  // ← CAMBIADO: carga SOLO el Controller
@DisplayName("Pruebas del Controlador de Necesidades")
class NecesidadControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean  // ← CAMBIADO: usa @MockBean en lugar de @Mock
    private NecesidadService necesidadService;

    @Autowired
    private ObjectMapper objectMapper;

    private ObjectId idNecesidad;
    private ObjectId idPerfil;
    private ObjectId idPeriodo;
    private ObjectId idPresupuesto;
    private Necesidad necesidad1;
    private Necesidad necesidad2;
    private NecesidadDTO necesidadDTO;
    private List<Necesidad> listaNecesidades;
    private ResumenPresupuestoDTO resumenDTO;

    @BeforeEach
    void setUp() {
        idNecesidad = new ObjectId();
        idPerfil = new ObjectId();
        idPeriodo = new ObjectId();
        idPresupuesto = new ObjectId();

        necesidad1 = new Necesidad();
        necesidad1.setId(idNecesidad);
        necesidad1.setDescripcion("Alimentación");
        necesidad1.setMonto(300.0);
        necesidad1.setEsPredeterminada(1);
        necesidad1.setIdPerfil(idPerfil);
        necesidad1.setIdPeriodo(idPeriodo);
        necesidad1.setIdPresupuesto(idPresupuesto);
        necesidad1.setExcedePresupuesto(false);

        necesidad2 = new Necesidad();
        necesidad2.setId(new ObjectId());
        necesidad2.setDescripcion("Transporte");
        necesidad2.setMonto(200.0);
        necesidad2.setEsPredeterminada(0);
        necesidad2.setIdPerfil(idPerfil);
        necesidad2.setIdPeriodo(idPeriodo);
        necesidad2.setIdPresupuesto(idPresupuesto);
        necesidad2.setExcedePresupuesto(false);

        listaNecesidades = Arrays.asList(necesidad1, necesidad2);

        necesidadDTO = new NecesidadDTO();
        necesidadDTO.setId(idNecesidad);
        necesidadDTO.setDescripcion("Nueva Necesidad");
        necesidadDTO.setMonto(150.0);
        necesidadDTO.setEsPredeterminada(0);
        necesidadDTO.setIdPerfil(idPerfil);
        necesidadDTO.setIdPeriodo(idPeriodo);
        necesidadDTO.setIdPresupuesto(idPresupuesto);

        resumenDTO = new ResumenPresupuestoDTO();
        resumenDTO.setDescripcionPresupuesto("Presupuesto Mensual");
        resumenDTO.setTotalAsignado(1000.0);
        resumenDTO.setTotalGastado(500.0);
        resumenDTO.setPorcentajeConsumido(50.0);
        resumenDTO.setDisponible(500.0);
    }

    // ============================================================
    // GET /api/necesidades
    // ============================================================
    @Test
    @DisplayName("GET /api/necesidades - Debería devolver todas las necesidades")
    void testGetAllNecesidades() throws Exception {
        when(necesidadService.getAll()).thenReturn(listaNecesidades);

        mockMvc.perform(get("/api/necesidades")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].descripcion").value("Alimentación"))
                .andExpect(jsonPath("$[1].descripcion").value("Transporte"));

        verify(necesidadService, times(1)).getAll();
    }

    @Test
    @DisplayName("GET /api/necesidades - Debería devolver lista vacía")
    void testGetAllNecesidadesVacio() throws Exception {
        when(necesidadService.getAll()).thenReturn(Arrays.asList());

        mockMvc.perform(get("/api/necesidades")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        verify(necesidadService, times(1)).getAll();
    }

    // ============================================================
    // GET /api/necesidades/{id}
    // ============================================================
    @Test
    @DisplayName("GET /api/necesidades/{id} - Debería devolver una necesidad por ID")
    void testGetNecesidadByIdExitoso() throws Exception {
        when(necesidadService.getById(idNecesidad)).thenReturn(Optional.of(necesidad1));

        mockMvc.perform(get("/api/necesidades/{id}", idNecesidad.toHexString())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(idNecesidad.toHexString()))
                .andExpect(jsonPath("$.descripcion").value("Alimentación"))
                .andExpect(jsonPath("$.monto").value(300.0));

        verify(necesidadService, times(1)).getById(idNecesidad);
    }

    @Test
    @DisplayName("GET /api/necesidades/{id} - Debería devolver 404 cuando no existe")
    void testGetNecesidadByIdNoExistente() throws Exception {
        ObjectId idInexistente = new ObjectId();
        when(necesidadService.getById(idInexistente)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/necesidades/{id}", idInexistente.toHexString())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(necesidadService, times(1)).getById(idInexistente);
    }

    // ============================================================
    // POST /api/necesidades
    // ============================================================
    @Test
    @DisplayName("POST /api/necesidades - Debería guardar una lista de necesidades")
    void testSaveNecesidadesExitoso() throws Exception {
        List<NecesidadDTO> dtoList = Arrays.asList(necesidadDTO);
        when(necesidadService.save(any(List.class))).thenReturn(listaNecesidades);

        mockMvc.perform(post("/api/necesidades")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dtoList)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));

        verify(necesidadService, times(1)).save(any(List.class));
    }

    // ============================================================
    // PUT /api/necesidades
    // ============================================================
    @Test
    @DisplayName("PUT /api/necesidades - Debería actualizar una necesidad")
    void testUpdateNecesidadExitoso() throws Exception {
        when(necesidadService.update(any(NecesidadDTO.class))).thenReturn(necesidad1);

        mockMvc.perform(put("/api/necesidades")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(necesidadDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(idNecesidad.toHexString()))
                .andExpect(jsonPath("$.descripcion").value("Alimentación"));

        verify(necesidadService, times(1)).update(any(NecesidadDTO.class));
    }

    // ============================================================
    // DELETE /api/necesidades/{id}
    // ============================================================
    @Test
    @DisplayName("DELETE /api/necesidades/{id} - Debería eliminar una necesidad")
    void testDeleteNecesidadExitoso() throws Exception {
        doNothing().when(necesidadService).delete(idNecesidad);

        mockMvc.perform(delete("/api/necesidades/{id}", idNecesidad.toHexString())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(necesidadService, times(1)).delete(idNecesidad);
    }

    // ============================================================
    // GET /api/necesidades/perfil/{idPerfil}/periodo/{idPeriodo}
    // ============================================================
    @Test
    @DisplayName("GET /api/necesidades/perfil/{idPerfil}/periodo/{idPeriodo}")
    void testFindByPerfilAndPeriodoExitoso() throws Exception {
        when(necesidadService.findByIdPerfilAndIdPeriodo(idPerfil, idPeriodo))
            .thenReturn(listaNecesidades);

        mockMvc.perform(get("/api/necesidades/perfil/{idPerfil}/periodo/{idPeriodo}", 
                idPerfil.toHexString(), idPeriodo.toHexString())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].descripcion").value("Alimentación"))
                .andExpect(jsonPath("$[1].descripcion").value("Transporte"));

        verify(necesidadService, times(1))
            .findByIdPerfilAndIdPeriodo(idPerfil, idPeriodo);
    }

    // ============================================================
    // GET /api/necesidades/presupuesto/{idPresupuesto}
    // ============================================================
    @Test
    @DisplayName("GET /api/necesidades/presupuesto/{idPresupuesto}")
    void testFindByPresupuestoExitoso() throws Exception {
        when(necesidadService.findByIdPresupuesto(idPresupuesto))
            .thenReturn(listaNecesidades);

        mockMvc.perform(get("/api/necesidades/presupuesto/{idPresupuesto}", 
                idPresupuesto.toHexString())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));

        verify(necesidadService, times(1))
            .findByIdPresupuesto(idPresupuesto);
    }

    // ============================================================
    // POST /api/necesidades/asignar-presupuesto
    // ============================================================
    @Test
    @DisplayName("POST /api/necesidades/asignar-presupuesto")
    void testAsignarPresupuestoExitoso() throws Exception {
        when(necesidadService.asignarPresupuestoANecesidad(idNecesidad, idPresupuesto))
            .thenReturn(necesidad1);

        mockMvc.perform(post("/api/necesidades/asignar-presupuesto")
                .param("idNecesidad", idNecesidad.toHexString())
                .param("idPresupuesto", idPresupuesto.toHexString())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(idNecesidad.toHexString()))
                .andExpect(jsonPath("$.descripcion").value("Alimentación"));

        verify(necesidadService, times(1))
            .asignarPresupuestoANecesidad(idNecesidad, idPresupuesto);
    }

    // ============================================================
    // POST /api/necesidades/guardar-con-validacion
    // ============================================================
    @Test
    @DisplayName("POST /api/necesidades/guardar-con-validacion - Guardar con validación")
    void testGuardarConValidacionExitoso() throws Exception {
        when(necesidadService.guardarConValidacionPresupuesto(any(NecesidadDTO.class), eq(false)))
            .thenReturn(necesidad1);

        mockMvc.perform(post("/api/necesidades/guardar-con-validacion")
                .param("forzarGuardado", "false")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(necesidadDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(idNecesidad.toHexString()))
                .andExpect(jsonPath("$.descripcion").value("Alimentación"));

        verify(necesidadService, times(1))
            .guardarConValidacionPresupuesto(any(NecesidadDTO.class), eq(false));
    }

    @Test
    @DisplayName("POST /api/necesidades/guardar-con-validacion - Guardar forzado")
    void testGuardarConValidacionForzado() throws Exception {
        when(necesidadService.guardarConValidacionPresupuesto(any(NecesidadDTO.class), eq(true)))
            .thenReturn(necesidad1);

        mockMvc.perform(post("/api/necesidades/guardar-con-validacion")
                .param("forzarGuardado", "true")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(necesidadDTO)))
                .andExpect(status().isOk());

        verify(necesidadService, times(1))
            .guardarConValidacionPresupuesto(any(NecesidadDTO.class), eq(true));
    }

    // ============================================================
    // GET /api/necesidades/resumen/{idPerfil}/{idPeriodo}
    // ============================================================
    @Test
    @DisplayName("GET /api/necesidades/resumen/{idPerfil}/{idPeriodo}")
    void testObtenerResumenExitoso() throws Exception {
        when(necesidadService.obtenerResumenPorPeriodo(idPerfil, idPeriodo))
            .thenReturn(resumenDTO);

        mockMvc.perform(get("/api/necesidades/resumen/{idPerfil}/{idPeriodo}", 
                idPerfil.toHexString(), idPeriodo.toHexString())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.descripcionPresupuesto").value("Presupuesto Mensual"))
                .andExpect(jsonPath("$.totalAsignado").value(1000.0))
                .andExpect(jsonPath("$.totalGastado").value(500.0))
                .andExpect(jsonPath("$.porcentajeConsumido").value(50.0))
                .andExpect(jsonPath("$.disponible").value(500.0));

        verify(necesidadService, times(1))
            .obtenerResumenPorPeriodo(idPerfil, idPeriodo);
    }
}