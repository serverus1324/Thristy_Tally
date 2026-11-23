package com.example.CalcGastosU.optimization;

import com.example.CalcGastosU.optimization.controller.OptimizationController;
import com.example.CalcGastosU.optimization.dto.OptimizationCategoryDTO;
import com.example.CalcGastosU.optimization.dto.OptimizationPreloadResponseDTO;
import com.example.CalcGastosU.optimization.dto.OptimizationRequestDTO;
import com.example.CalcGastosU.optimization.dto.OptimizationResponseDTO;
import com.example.CalcGastosU.optimization.exception.OptimizationException;
import com.example.CalcGastosU.optimization.service.OptimizationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class OptimizationControllerTest {

    private MockMvc mockMvc;
    private OptimizationService optimizationService;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        optimizationService = mock(OptimizationService.class);
        OptimizationController controller = new OptimizationController();
        ReflectionTestUtils.setField(controller, "optimizationService", optimizationService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
        objectMapper = new ObjectMapper();
    }

    @Test
    void devuelveResultadoOptimo() throws Exception {
        OptimizationCategoryDTO category = new OptimizationCategoryDTO();
        category.setName("Alimentación");
        category.setMinimum(250000.0);
        category.setMaximum(300000.0);

        OptimizationRequestDTO request = new OptimizationRequestDTO();
        request.setPresupuestoDisponible(1000000.0);
        request.setCategorias(List.of(category));

        OptimizationResponseDTO response = new OptimizationResponseDTO();
        response.setSuccess(true);
        response.setStatus("OPTIMO");
        response.setAhorroMaximo(750000.0);
        response.setMensaje("Distribución óptima calculada");
        when(optimizationService.optimize(any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/optimization/optimize")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.status").value("OPTIMO"));
    }

    @Test
    void devuelve422CuandoElPresupuestoEsInsuficiente() throws Exception {
        when(optimizationService.optimize(any()))
                .thenThrow(new OptimizationException("Presupuesto insuficiente", true));

        mockMvc.perform(post("/api/v1/optimization/optimize")
                        .contentType("application/json")
                        .content("{\"presupuestoDisponible\":100,\"categorias\":[]}"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.status").value("PRESUPUESTO_INSUFICIENTE"));
    }

    @Test
    void preloadAceptaElPresupuestoSeleccionado() throws Exception {
        String idPeriodo = "6afa3a8016cd483d70c5c0bd";
        String idPresupuesto = "6afa3a8216cd483d70c5c0be";
        OptimizationPreloadResponseDTO response = new OptimizationPreloadResponseDTO();
        response.setSuccess(true);
        response.setCategorias(List.of());
        when(optimizationService.preload(any(), any())).thenReturn(response);

        mockMvc.perform(get("/api/v1/optimization/preload/{idPeriodo}", idPeriodo)
                        .queryParam("idPresupuesto", idPresupuesto))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.categorias").isArray());
    }

    @Test
    void preloadRechazaIdPresupuestoInvalido() throws Exception {
        mockMvc.perform(get("/api/v1/optimization/preload/{idPeriodo}",
                        "6afa3a8016cd483d70c5c0bd")
                        .queryParam("idPresupuesto", "not-an-object-id"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }
}
