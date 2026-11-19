package com.example.CalcGastosU.optimization;

import com.example.CalcGastosU.entity.Necesidad;
import com.example.CalcGastosU.entity.Presupuesto;
import com.example.CalcGastosU.entity.Usuario;
import com.example.CalcGastosU.enums.Role;
import com.example.CalcGastosU.optimization.dto.OptimizationCategoryDTO;
import com.example.CalcGastosU.optimization.dto.OptimizationRequestDTO;
import com.example.CalcGastosU.optimization.dto.OptimizationResponseDTO;
import com.example.CalcGastosU.optimization.exception.OptimizationException;
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

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OptimizationServiceTest {

    @Mock
    private PresupuestoRepository presupuestoRepository;

    @Mock
    private NecesidadRepository necesidadRepository;

    @InjectMocks
    private OptimizationService service;

    private ObjectId idPerfil;
    private ObjectId idPeriodo;
    private Presupuesto presupuesto;
    private List<Necesidad> needs;

    @BeforeEach
    void setUp() {
        idPerfil = new ObjectId();
        idPeriodo = new ObjectId();
        Usuario usuario = new Usuario();
        usuario.setIdPerfil(idPerfil);
        usuario.setRoles(Set.of(Role.ROLE_USER));
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(usuario, null, List.of()));

        presupuesto = new Presupuesto();
        presupuesto.setId(new ObjectId());
        presupuesto.setIdPerfil(idPerfil);
        presupuesto.setIdPeriodo(idPeriodo);
        presupuesto.setMonto(1_000_000.0);
        needs = new ArrayList<>();

        lenient().when(presupuestoRepository.findByIdPerfilAndIdPeriodo(idPerfil, idPeriodo))
                .thenAnswer(invocation -> Optional.of(presupuesto));
        lenient().when(presupuestoRepository.findById(presupuesto.getId()))
                .thenAnswer(invocation -> Optional.of(presupuesto));
        lenient().when(necesidadRepository.findByIdPresupuestoAndIdPeriodo(
                        presupuesto.getId(), idPeriodo))
                .thenAnswer(invocation -> needs);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void calculaElEjemploConSeisNecesidades() {
        OptimizationResponseDTO response = optimizeWith(
                new double[]{250000, 100000, 250000, 100000, 40000, 50000},
                new double[]{300000, 150000, 300000, 100000, 70000, 80000});

        assertTrue(response.getSuccess());
        assertEquals(790000.0, response.getTotalGastosOptimizados(), 0.001);
        assertEquals(210000.0, response.getAhorroMaximo(), 0.001);
        assertEquals(21.0, response.getPorcentajeAhorro(), 0.001);
        assertEquals(6, response.getDistribucion().size());
    }

    @Test
    void admiteNueveNecesidadesYNoFusionaPersonalizadas() {
        double[] minima = {250000, 100000, 250000, 100000, 40000, 50000, 60000, 40000, 120000};
        double[] maxima = {300000, 150000, 300000, 100000, 70000, 80000, 100000, 80000, 150000};
        presupuesto.setMonto(1_500_000.0);

        OptimizationResponseDTO response = optimizeWith(minima, maxima);

        assertEquals(9, response.getDistribucion().size());
        assertEquals(1_010_000.0, response.getTotalGastosOptimizados(), 0.001);
        assertEquals(490_000.0, response.getAhorroMaximo(), 0.001);
        assertNotEquals(response.getDistribucion().get(6).getIdNecesidad(),
                response.getDistribucion().get(7).getIdNecesidad());
        assertEquals(6L, response.getDistribucion().stream()
                .filter(item -> Integer.valueOf(1).equals(item.getEsPredeterminada()))
                .count());
        assertEquals(3L, response.getDistribucion().stream()
                .filter(item -> Integer.valueOf(0).equals(item.getEsPredeterminada()))
                .count());
    }

    @Test
    void rechazaPresupuestoInsuficienteConMontoAdicionalNecesario() {
        presupuesto.setMonto(500000.0);
        OptimizationException exception = assertThrows(OptimizationException.class,
                () -> optimizeWith(new double[]{300000, 250000}, new double[]{350000, 300000}));

        assertTrue(exception.isInsufficientBudget());
        assertTrue(exception.getMessage().contains("50.000"));
    }

    @Test
    void rechazaMinimoSuperiorAlMaximo() {
        assertThrows(OptimizationException.class,
                () -> optimizeWith(new double[]{90000}, new double[]{80000}));
    }

    @Test
    void rechazaValoresNegativos() {
        assertThrows(OptimizationException.class,
                () -> optimizeWith(new double[]{-1}, new double[]{100}));
    }

    @Test
    void permiteMinimosIgualesAlPresupuesto() {
        presupuesto.setMonto(400000.0);
        OptimizationResponseDTO response = optimizeWith(
                new double[]{100000, 300000}, new double[]{100000, 500000});

        assertEquals(400000.0, response.getTotalGastosOptimizados(), 0.001);
        assertEquals(0.0, response.getAhorroMaximo(), 0.001);
    }

    @Test
    void exigeNecesidadesYRechazaListaVacia() {
        assertThrows(OptimizationException.class,
                () -> service.optimize(request(List.of())));
    }

    @Test
    void rechazaIdentificadoresDuplicados() {
        Necesidad need = need("Internet", 100.0, 0);
        needs.add(need);
        OptimizationCategoryDTO first = category(need, 50.0, 100.0);
        OptimizationCategoryDTO second = category(need, 50.0, 100.0);

        assertThrows(OptimizationException.class,
                () -> service.optimize(request(List.of(first, second))));
    }

    @Test
    void impideOptimizarPresupuestoDeOtroUsuario() {
        ObjectId foreignProfile = new ObjectId();
        Presupuesto foreignBudget = new Presupuesto();
        foreignBudget.setId(new ObjectId());
        foreignBudget.setIdPerfil(foreignProfile);
        foreignBudget.setIdPeriodo(idPeriodo);
        foreignBudget.setMonto(1000.0);
        when(presupuestoRepository.findById(foreignBudget.getId()))
                .thenReturn(Optional.of(foreignBudget));

        OptimizationRequestDTO request = request(List.of());
        request.setIdPresupuesto(foreignBudget.getId().toHexString());

        assertThrows(SecurityException.class, () -> service.optimize(request));
    }

    private OptimizationResponseDTO optimizeWith(double[] minimums, double[] maximums) {
        needs.clear();
        List<OptimizationCategoryDTO> categories = new ArrayList<>();
        for (int i = 0; i < minimums.length; i++) {
            Necesidad need = need(i < 6 ? "Necesidad " + (i + 1) : "Personalizada " + (i - 5),
                    minimums[i], i < 6 ? 1 : 0);
            needs.add(need);
            categories.add(category(need, minimums[i], maximums[i]));
        }
        return service.optimize(request(categories));
    }

    private OptimizationRequestDTO request(List<OptimizationCategoryDTO> categories) {
        OptimizationRequestDTO request = new OptimizationRequestDTO();
        request.setIdPeriodo(idPeriodo.toHexString());
        request.setIdPresupuesto(presupuesto.getId().toHexString());
        request.setPresupuestoDisponible(999999999.0);
        request.setCategorias(categories);
        return request;
    }

    private OptimizationCategoryDTO category(Necesidad need, double minimum, double maximum) {
        OptimizationCategoryDTO category = new OptimizationCategoryDTO();
        category.setIdNecesidad(need.getId().toHexString());
        category.setName(need.getDescripcion());
        category.setMinimum(minimum);
        category.setMaximum(maximum);
        return category;
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
