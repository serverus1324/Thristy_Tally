package com.example.CalcGastosU.optimization;

import com.example.CalcGastosU.entity.Necesidad;
import com.example.CalcGastosU.entity.Presupuesto;
import com.example.CalcGastosU.entity.Usuario;
import com.example.CalcGastosU.enums.Role;
import com.example.CalcGastosU.optimization.dto.OptimizationPreloadCategoryDTO;
import com.example.CalcGastosU.optimization.dto.OptimizationPreloadResponseDTO;
import com.example.CalcGastosU.optimization.service.OptimizationService;
import com.example.CalcGastosU.repository.NecesidadRepository;
import com.example.CalcGastosU.repository.PresupuestoRepository;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OptimizationPreloadTest {

    @Mock
    private PresupuestoRepository presupuestoRepository;

    @Mock
    private NecesidadRepository necesidadRepository;

    @InjectMocks
    private OptimizationService service;

    private ObjectId idPerfil;
    private ObjectId idPeriodo;
    private Presupuesto presupuesto;

    @BeforeEach
    void setUp() {
        idPerfil = new ObjectId();
        idPeriodo = new ObjectId();
        ObjectId idPresupuesto = new ObjectId();

        Usuario usuario = new Usuario();
        usuario.setIdPerfil(idPerfil);
        usuario.setRoles(Set.of(Role.ROLE_USER));
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(usuario, null, List.of()));

        presupuesto = new Presupuesto();
        presupuesto.setId(idPresupuesto);
        presupuesto.setIdPerfil(idPerfil);
        presupuesto.setIdPeriodo(idPeriodo);
        presupuesto.setMonto(2_000_000.0);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void precargaCadaNecesidadConIdentidadPropia() {
        List<Necesidad> needs = List.of(
                need("ALIMENTACIÓN", 600_000.0, 1),
                need("TRANSPORTE", 100_000.0, 1),
                need("Natilla", 50_000.0, 0),
                need("Ropa", 650_000.0, 0));
        when(presupuestoRepository.findByIdPerfilAndIdPeriodo(idPerfil, idPeriodo))
                .thenReturn(Optional.of(presupuesto));
        when(necesidadRepository.findByIdPresupuestoAndIdPeriodo(presupuesto.getId(), idPeriodo))
                .thenReturn(needs);

        OptimizationPreloadResponseDTO response = service.preload(idPeriodo);

        assertTrue(response.getSuccess());
        assertEquals(4, response.getCategorias().size());
        assertEquals(1_400_000.0, response.getTotalMinimos(), 0.001);
        OptimizationPreloadCategoryDTO customOne = response.getCategorias().stream()
                .filter(category -> "Natilla".equals(category.getDescripcion()))
                .findFirst()
                .orElseThrow();
        OptimizationPreloadCategoryDTO customTwo = response.getCategorias().stream()
                .filter(category -> "Ropa".equals(category.getDescripcion()))
                .findFirst()
                .orElseThrow();
        assertEquals("Natilla", customOne.getDescripcion());
        assertEquals(50_000.0, customOne.getMinimum(), 0.001);
        assertEquals(650_000.0, customTwo.getGastoReal(), 0.001);
        assertNotEquals(customOne.getIdNecesidad(), customTwo.getIdNecesidad());
        assertEquals(response.getPresupuestoDisponible(), response.getCategorias().stream()
                .mapToDouble(OptimizationPreloadCategoryDTO::getMaximum)
                .sum(), 0.001);
    }

    @Test
    void incluyeNecesidadesDelPresupuestoYPeriodoSinDuplicarIds() {
        Necesidad predetermined = need("ALIMENTACIÓN", 500_000.0, 1);
        Necesidad custom = need("Internet", 200_000.0, 0);

        when(presupuestoRepository.findByIdPerfilAndIdPeriodo(idPerfil, idPeriodo))
                .thenReturn(Optional.of(presupuesto));
        when(necesidadRepository.findByIdPresupuestoAndIdPeriodo(presupuesto.getId(), idPeriodo))
                .thenReturn(List.of(predetermined, predetermined, custom));

        OptimizationPreloadResponseDTO response = service.preload(idPeriodo);

        assertEquals(2, response.getCategorias().size());
        assertEquals(700_000.0, response.getTotalMinimos(), 0.001);
        assertEquals(1, response.getCategorias().stream()
                .filter(category -> Integer.valueOf(1).equals(category.getEsPredeterminada()))
                .count());
        assertEquals(1, response.getCategorias().stream()
                .filter(category -> Integer.valueOf(0).equals(category.getEsPredeterminada()))
                .count());
        assertTrue(response.getCategorias().stream()
                .anyMatch(category -> custom.getId().toHexString().equals(category.getIdNecesidad())));
    }

    private Necesidad need(String description, double amount, int predetermined) {
        Necesidad need = new Necesidad();
        need.setId(new ObjectId());
        need.setDescripcion(description);
        need.setMonto(amount);
        need.setEsPredeterminada(predetermined);
        need.setIdPerfil(idPerfil);
        need.setIdPeriodo(idPeriodo);
        need.setIdPresupuesto(presupuesto.getId());
        return need;
    }
}
