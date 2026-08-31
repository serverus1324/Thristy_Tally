package com.miproyecto.Controller;

import com.example.CalcGastosU.CalcGastosUApplication;
import com.example.CalcGastosU.config.SecurityConfig;
import com.example.CalcGastosU.controller.NecesidadController;
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
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = NecesidadController.class)
@ContextConfiguration(classes = CalcGastosUApplication.class)
@Import(SecurityConfig.class)
@DisplayName("Pruebas del Controlador de Necesidades")
class NecesidadControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
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
    // GET /api/v1/necesidades
    // ============================================================

    @Test
    @DisplayName("GET /api/v1/necesidades - Debería devolver todas las necesidades")
    void testGetAllNecesidades() throws Exception {
        when(necesidadService.getAll()).thenReturn(listaNecesidades);

        mockMvc.perform(get("/api/v1/necesidades"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].descripcion").value("Alimentación"))
                .andExpect(jsonPath("$.data[1].descripcion").value("Transporte"))
                .andExpect(jsonPath("$.mensaje").value("Lista de necesidades obtenida exitosamente"));

        verify(necesidadService, times(1)).getAll();
    }

    @Test
    @DisplayName("GET /api/v1/necesidades - Debería devolver lista vacía")
    void testGetAllNecesidadesVacio() throws Exception {
        when(necesidadService.getAll()).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/necesidades"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(0));

        verify(necesidadService, times(1)).getAll();
    }

    // ============================================================
    // GET /api/v1/necesidades/{id}
    // ============================================================

    @Test
    @DisplayName("GET /api/v1/necesidades/{id} - Debería devolver una necesidad")
    void testGetNecesidadByIdExitoso() throws Exception {
        when(necesidadService.getById(idNecesidad))
                .thenReturn(Optional.of(necesidad1));

        mockMvc.perform(get("/api/v1/necesidades/{id}", idNecesidad.toHexString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(idNecesidad.toHexString()))
                .andExpect(jsonPath("$.data.descripcion").value("Alimentación"))
                .andExpect(jsonPath("$.data.monto").value(300.0))
                .andExpect(jsonPath("$.mensaje").value("Necesidad obtenida exitosamente"));

        verify(necesidadService, times(1)).getById(idNecesidad);
    }

    @Test
    @DisplayName("GET /api/v1/necesidades/{id} - Debería devolver 404 si no existe")
    void testGetNecesidadByIdNoExistente() throws Exception {
        ObjectId idInexistente = new ObjectId();

        when(necesidadService.getById(idInexistente))
                .thenReturn(Optional.empty());

        mockMvc.perform(get("/api/v1/necesidades/{id}", idInexistente.toHexString()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.mensaje").value("Necesidad no encontrada"));

        verify(necesidadService, times(1)).getById(idInexistente);
    }

    // ============================================================
    // POST /api/v1/necesidades
    // ============================================================

    @Test
    @DisplayName("POST /api/v1/necesidades - Debería guardar necesidades")
    void testSaveNecesidadesExitoso() throws Exception {
        List<NecesidadDTO> dtoList = List.of(necesidadDTO);

        when(necesidadService.save(any(List.class)))
                .thenReturn(listaNecesidades);

        mockMvc.perform(post("/api/v1/necesidades")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dtoList)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.mensaje").value("2 necesidad(es) guardada(s) exitosamente."));

        verify(necesidadService, times(1)).save(any(List.class));
    }

    @Test
    @DisplayName("POST /api/v1/necesidades - Debería devolver 400 si el servicio lanza una excepción")
    void testSaveNecesidadesError() throws Exception {
        List<NecesidadDTO> dtoList = List.of(necesidadDTO);

        when(necesidadService.save(any(List.class)))
                .thenThrow(new RuntimeException("Perfil no encontrado"));

        mockMvc.perform(post("/api/v1/necesidades")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dtoList)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.mensaje").value("Perfil no encontrado"));

        verify(necesidadService, times(1)).save(any(List.class));
    }

    // ============================================================
    // PUT /api/v1/necesidades
    // ============================================================

    @Test
    @DisplayName("PUT /api/v1/necesidades - Debería actualizar una necesidad")
    void testUpdateNecesidadExitoso() throws Exception {
        when(necesidadService.update(any(NecesidadDTO.class)))
                .thenReturn(necesidad1);

        mockMvc.perform(put("/api/v1/necesidades")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(necesidadDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(idNecesidad.toHexString()))
                .andExpect(jsonPath("$.data.descripcion").value("Alimentación"))
                .andExpect(jsonPath("$.mensaje").value("Necesidad actualizada exitosamente"));

        verify(necesidadService, times(1)).update(any(NecesidadDTO.class));
    }

    @Test
    @DisplayName("PUT /api/v1/necesidades - Debería devolver 400 si ocurre un error")
    void testUpdateNecesidadError() throws Exception {
        when(necesidadService.update(any(NecesidadDTO.class)))
                .thenThrow(new RuntimeException("Necesidad no encontrada para actualizar"));

        mockMvc.perform(put("/api/v1/necesidades")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(necesidadDTO)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.mensaje")
                        .value("Error al actualizar la necesidad: Necesidad no encontrada para actualizar"));

        verify(necesidadService, times(1)).update(any(NecesidadDTO.class));
    }

    // ============================================================
    // PUT /api/v1/necesidades/{idNecesidad}/presupuesto/{idPresupuesto}
    // ============================================================

    @Test
    @DisplayName("PUT /api/v1/necesidades/{idNecesidad}/presupuesto/{idPresupuesto} - Debería asignar presupuesto")
    void testAsignarPresupuestoExitoso() throws Exception {
        when(necesidadService.asignarPresupuestoANecesidad(idNecesidad, idPresupuesto))
                .thenReturn(necesidad1);

        mockMvc.perform(put(
                "/api/v1/necesidades/{idNecesidad}/presupuesto/{idPresupuesto}",
                idNecesidad.toHexString(),
                idPresupuesto.toHexString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(idNecesidad.toHexString()))
                .andExpect(jsonPath("$.data.descripcion").value("Alimentación"))
                .andExpect(jsonPath("$.mensaje")
                        .value("Presupuesto asignado a necesidad exitosamente"));

        verify(necesidadService, times(1))
                .asignarPresupuestoANecesidad(idNecesidad, idPresupuesto);
    }

    // ============================================================
    // GET /api/v1/necesidades/por-perfil-periodo
    // ============================================================

    @Test
    @DisplayName("GET /api/v1/necesidades/por-perfil-periodo - Debería devolver necesidades")
    void testFindByPerfilAndPeriodoExitoso() throws Exception {
        when(necesidadService.findByIdPerfilAndIdPeriodo(idPerfil, idPeriodo))
                .thenReturn(listaNecesidades);

        mockMvc.perform(get("/api/v1/necesidades/por-perfil-periodo")
                .param("idPerfil", idPerfil.toHexString())
                .param("idPeriodo", idPeriodo.toHexString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].descripcion").value("Alimentación"))
                .andExpect(jsonPath("$.data[1].descripcion").value("Transporte"))
                .andExpect(jsonPath("$.mensaje")
                        .value("Necesidades por perfil y período obtenidas exitosamente"));

        verify(necesidadService, times(1))
                .findByIdPerfilAndIdPeriodo(idPerfil, idPeriodo);
    }

  /*   @Test
    @DisplayName("GET /api/v1/necesidades/por-estudiante-periodo - Debe usar el alias disponible")
    void testFindByEstudiantePeriodoExitoso() throws Exception {
        when(necesidadService.findByIdPerfilAndIdPeriodo(idPerfil, idPeriodo))
                .thenReturn(listaNecesidades);

        mockMvc.perform(get("/api/v1/necesidades/por-estudiante-periodo")
                .param("idPerfil", idPerfil.toHexString())
                .param("idPeriodo", idPeriodo.toHexString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(2));

        verify(necesidadService, times(1))
                .findByIdPerfilAndIdPeriodo(idPerfil, idPeriodo);
    }

    // ============================================================
    // GET /api/v1/necesidades/por-presupuesto
    // ============================================================

    @Test
    @DisplayName("GET /api/v1/necesidades/por-presupuesto - Debería devolver necesidades")
    void testFindByPresupuestoExitoso() throws Exception {
        when(necesidadService.findByIdPresupuesto(idPresupuesto))
                .thenReturn(listaNecesidades);

        mockMvc.perform(get("/api/v1/necesidades/por-presupuesto")
                .param("idPresupuesto", idPresupuesto.toHexString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.mensaje")
                        .value("Necesidades por presupuesto obtenidas exitosamente"));

        verify(necesidadService, times(1))
                .findByIdPresupuesto(idPresupuesto);
    } */

    @Test
    @DisplayName("GET /api/v1/necesidades/por-presupuesto - Debería devolver 400 con ID inválido")
    void testFindByPresupuestoIdInvalido() throws Exception {
        mockMvc.perform(get("/api/v1/necesidades/por-presupuesto")
                .param("idPresupuesto", "id-invalido"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.mensaje").value("Formato de idPresupuesto inválido"));

        verify(necesidadService, never()).findByIdPresupuesto(any(ObjectId.class));
    }

    // ============================================================
    // POST /api/v1/necesidades/crear-con-validacion
    // ============================================================

    @Test
    @DisplayName("POST /api/v1/necesidades/crear-con-validacion - Debería crear con validación")
    void testCrearConValidacionExitoso() throws Exception {
        when(necesidadService.guardarConValidacionPresupuesto(
                any(NecesidadDTO.class), eq(false)))
                .thenReturn(necesidad1);

        mockMvc.perform(post("/api/v1/necesidades/crear-con-validacion")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(necesidadDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(idNecesidad.toHexString()))
                .andExpect(jsonPath("$.data.descripcion").value("Alimentación"))
                .andExpect(jsonPath("$.mensaje")
                        .value("Necesidad creada con validación exitosamente"));

        verify(necesidadService, times(1))
                .guardarConValidacionPresupuesto(any(NecesidadDTO.class), eq(false));
    }

    @Test
    @DisplayName("POST /api/v1/necesidades/crear-con-validacion - Debería devolver 400 ante error")
    void testCrearConValidacionError() throws Exception {
        when(necesidadService.guardarConValidacionPresupuesto(
                any(NecesidadDTO.class), eq(false)))
                .thenThrow(new RuntimeException("La necesidad excede el presupuesto asignado"));

        mockMvc.perform(post("/api/v1/necesidades/crear-con-validacion")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(necesidadDTO)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.mensaje")
                        .value("La necesidad excede el presupuesto asignado"));

        verify(necesidadService, times(1))
                .guardarConValidacionPresupuesto(any(NecesidadDTO.class), eq(false));
    }

    // ============================================================
    // GET /api/v1/necesidades/resumen-presupuesto
    // ============================================================

    @Test
    @DisplayName("GET /api/v1/necesidades/resumen-presupuesto - Debería devolver resumen")
    void testObtenerResumenExitoso() throws Exception {
        when(necesidadService.obtenerResumenPorPeriodo(idPerfil, idPeriodo))
                .thenReturn(resumenDTO);

        mockMvc.perform(get("/api/v1/necesidades/resumen-presupuesto")
                .param("idPerfil", idPerfil.toHexString())
                .param("idPeriodo", idPeriodo.toHexString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.descripcionPresupuesto")
                        .value("Presupuesto Mensual"))
                .andExpect(jsonPath("$.data.totalAsignado").value(1000.0))
                .andExpect(jsonPath("$.data.totalGastado").value(500.0))
                .andExpect(jsonPath("$.data.porcentajeConsumido").value(50.0))
                .andExpect(jsonPath("$.data.disponible").value(500.0))
                .andExpect(jsonPath("$.mensaje").value("Resumen obtenido exitosamente"));

        verify(necesidadService, times(1))
                .obtenerResumenPorPeriodo(idPerfil, idPeriodo);
    }

    @Test
    @DisplayName("GET /api/v1/necesidades/resumen-presupuesto - Debería devolver 400 con IDs inválidos")
    void testObtenerResumenIdsInvalidos() throws Exception {
        mockMvc.perform(get("/api/v1/necesidades/resumen-presupuesto")
                .param("idPerfil", "perfil-invalido")
                .param("idPeriodo", idPeriodo.toHexString()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.mensaje")
                        .value("Formato de idPerfil o idPeriodo inválido"));

        verify(necesidadService, never())
                .obtenerResumenPorPeriodo(any(ObjectId.class), any(ObjectId.class));
    }

    @Test
    @DisplayName("GET /api/v1/necesidades/resumen-presupuesto - Debería devolver 404 si no existe presupuesto")
    void testObtenerResumenPresupuestoNoEncontrado() throws Exception {
        when(necesidadService.obtenerResumenPorPeriodo(idPerfil, idPeriodo))
                .thenThrow(new RuntimeException("Presupuesto no encontrado"));

        mockMvc.perform(get("/api/v1/necesidades/resumen-presupuesto")
                .param("idPerfil", idPerfil.toHexString())
                .param("idPeriodo", idPeriodo.toHexString()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.mensaje").value("Presupuesto no encontrado"));

        verify(necesidadService, times(1))
                .obtenerResumenPorPeriodo(idPerfil, idPeriodo);
    }

    // ============================================================
    // DELETE /api/v1/necesidades/{id}
    // ============================================================

    @Test
    @DisplayName("DELETE /api/v1/necesidades/{id} - Debería eliminar una necesidad")
    void testDeleteNecesidadExitoso() throws Exception {
        doNothing().when(necesidadService).delete(idNecesidad);

        mockMvc.perform(delete("/api/v1/necesidades/{id}", idNecesidad.toHexString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.mensaje")
                        .value("Necesidad eliminada exitosamente"));

        verify(necesidadService, times(1)).delete(idNecesidad);
    }

    @Test
    @DisplayName("DELETE /api/v1/necesidades/{id} - Debería devolver 400 ante error")
    void testDeleteNecesidadError() throws Exception {
        doThrow(new RuntimeException("No se pudo eliminar"))
                .when(necesidadService).delete(idNecesidad);

        mockMvc.perform(delete("/api/v1/necesidades/{id}", idNecesidad.toHexString()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.mensaje")
                        .value("Error al eliminar la necesidad: No se pudo eliminar"));

        verify(necesidadService, times(1)).delete(idNecesidad);
    }
}
