package com.example.CalcGastosU.optimization;

import com.example.CalcGastosU.entity.Necesidad;
import com.example.CalcGastosU.entity.Presupuesto;
import com.example.CalcGastosU.entity.Usuario;
import com.example.CalcGastosU.enums.Role;
import com.example.CalcGastosU.optimization.dto.OptimizationCategoryDTO;
import com.example.CalcGastosU.optimization.dto.OptimizationPreloadResponseDTO;
import com.example.CalcGastosU.optimization.dto.OptimizationRequestDTO;
import com.example.CalcGastosU.optimization.dto.OptimizationResponseDTO;
import com.example.CalcGastosU.optimization.service.OptimizationService;
import com.example.CalcGastosU.repository.NecesidadRepository;
import com.example.CalcGastosU.repository.PresupuestoRepository;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.convert.MappingMongoConverter;
import org.springframework.data.mongodb.core.convert.NoOpDbRefResolver;
import org.springframework.data.mongodb.core.mapping.MongoMappingContext;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OptimizationBsonMappingTest {

    private static final String CLASS_NAME = "com.example.CalcGastosU.entity.Necesidad";

    @Mock
    private PresupuestoRepository presupuestoRepository;

    @Mock
    private NecesidadRepository necesidadRepository;

    @InjectMocks
    private OptimizationService service;

    private ObjectId idPerfil;
    private ObjectId idPeriodo;
    private Presupuesto presupuesto;
    private List<Necesidad> necesidades;
    private MappingMongoConverter converter;

    @BeforeEach
    void setUp() throws Exception {
        idPerfil = new ObjectId("6ae7b55a76f5c82cea444a6e");
        idPeriodo = new ObjectId("6afa3a8016cd483d70c5c0bd");
        presupuesto = new Presupuesto();
        presupuesto.setId(new ObjectId("6afa3a8216cd483d70c5c0be"));
        presupuesto.setIdPerfil(idPerfil);
        presupuesto.setIdPeriodo(idPeriodo);
        presupuesto.setMonto(2_000_000.0);

        Usuario usuario = new Usuario();
        usuario.setIdPerfil(idPerfil);
        usuario.setRoles(Set.of(Role.ROLE_USER));
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(usuario, null, List.of()));

        MongoMappingContext mappingContext = new MongoMappingContext();
        mappingContext.setInitialEntitySet(Set.of(Necesidad.class));
        mappingContext.afterPropertiesSet();
        converter = new MappingMongoConverter(NoOpDbRefResolver.INSTANCE, mappingContext);
        converter.afterPropertiesSet();

        assertEquals("necesidades",
                mappingContext.getPersistentEntity(Necesidad.class).getCollection());

        necesidades = new ArrayList<>(bsonNeeds().stream()
                .map(document -> converter.read(Necesidad.class, document))
                .toList());
        assertEquals(Integer.valueOf(0), necesidades.get(6).getEsPredeterminada());
        assertEquals(Integer.valueOf(1), necesidades.get(0).getEsPredeterminada());
        assertEquals(Double.valueOf(650_000.0), necesidades.get(7).getMonto());

        when(presupuestoRepository.findByIdPerfilAndIdPeriodo(idPerfil, idPeriodo))
                .thenReturn(java.util.Optional.of(presupuesto));
        lenient().when(presupuestoRepository.findById(presupuesto.getId()))
                .thenReturn(java.util.Optional.of(presupuesto));
        when(necesidadRepository.findByIdPresupuestoAndIdPeriodo(
                presupuesto.getId(), idPeriodo))
                .thenAnswer(invocation -> necesidades);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void bsonDeColeccionRealIncluyeOchoNecesidadesEnPrecalculoYOptimizacion() {
        OptimizationPreloadResponseDTO preload = service.preload(idPeriodo);

        assertEquals(8, preload.getCategorias().size());
        assertEquals(1_840_000.0, preload.getTotalMinimos(), 0.001);
        assertEquals(6, preload.getCategorias().stream()
                .filter(category -> Integer.valueOf(1).equals(category.getEsPredeterminada()))
                .count());
        assertEquals(2, preload.getCategorias().stream()
                .filter(category -> Integer.valueOf(0).equals(category.getEsPredeterminada()))
                .count());
        assertEquals(600_000.0, preload.getCategorias().get(0).getGastoReal(), 0.001);
        assertEquals(50_000.0, preload.getCategorias().get(6).getGastoReal(), 0.001);
        assertEquals(650_000.0, preload.getCategorias().get(7).getGastoReal(), 0.001);
        assertEquals("Natilla", preload.getCategorias().get(6).getDescripcion());
        assertEquals("Ropa", preload.getCategorias().get(7).getDescripcion());
        assertEquals("6afa3a8316cd483d70c5c0c2",
                preload.getCategorias().get(7).getIdNecesidad());

        OptimizationResponseDTO result = service.optimize(requestFrom(preload));

        assertEquals(8, result.getDistribucion().size());
        assertEquals(1_840_000.0, result.getTotalGastosOptimizados(), 0.001);
        assertEquals(160_000.0, result.getAhorroMaximo(), 0.001);
        assertEquals(8, result.getDistribucion().stream()
                .map(item -> item.getIdNecesidad())
                .distinct()
                .count());
        verify(necesidadRepository, times(2))
                .findByIdPresupuestoAndIdPeriodo(presupuesto.getId(), idPeriodo);
    }

    @Test
    void unaNuevaNecesidadPersonalizadaGeneraUnaFilaAdicional() {
        service.preload(idPeriodo);

        necesidades.add(readBsonNeed(
                new Document("_id", new ObjectId())
                        .append("esPredeterminada", 0)
                        .append("descripcion", "Internet")
                        .append("monto", 90_000.0)
                        .append("excedePresupuesto", false)
                        .append("idPerfil", idPerfil)
                        .append("idPeriodo", idPeriodo)
                        .append("idPresupuesto", presupuesto.getId())
                        .append("_class", CLASS_NAME)));

        OptimizationPreloadResponseDTO refreshed = service.preload(idPeriodo);

        assertEquals(9, refreshed.getCategorias().size());
        assertEquals(1_930_000.0, refreshed.getTotalMinimos(), 0.001);
        assertEquals("Internet", refreshed.getCategorias().get(8).getDescripcion());
    }

    private OptimizationRequestDTO requestFrom(OptimizationPreloadResponseDTO preload) {
        OptimizationRequestDTO request = new OptimizationRequestDTO();
        request.setIdPeriodo(idPeriodo.toHexString());
        request.setIdPresupuesto(presupuesto.getId().toHexString());
        List<OptimizationCategoryDTO> categories = new ArrayList<>();
        preload.getCategorias().forEach(item -> {
            OptimizationCategoryDTO category = new OptimizationCategoryDTO();
            category.setIdNecesidad(item.getIdNecesidad());
            category.setMinimum(item.getMinimum());
            category.setMaximum(item.getMaximum());
            categories.add(category);
        });
        request.setCategorias(categories);
        return request;
    }

    private Necesidad readBsonNeed(Document document) {
        return converter.read(Necesidad.class, document);
    }

    private List<Document> bsonNeeds() {
        return List.of(
                bsonNeed("6afa3a8216cd483d70c5c0bf", 1, "ALIMENTACIÓN", 600_000.0),
                bsonNeed(new ObjectId(), 1, "TRANSPORTE", 100_000.0),
                bsonNeed(new ObjectId(), 1, "ALOJAMIENTO", 250_000.0),
                bsonNeed(new ObjectId(), 1, "MATRÍCULA", 100_000.0),
                bsonNeed(new ObjectId(), 1, "ÚTILES", 40_000.0),
                bsonNeed(new ObjectId(), 1, "IMPREVISTOS", 50_000.0),
                bsonNeed(new ObjectId(), 0, "Natilla", 50_000.0),
                bsonNeed("6afa3a8316cd483d70c5c0c2", 0, "Ropa", 650_000.0));
    }

    private Document bsonNeed(String id, int predetermined, String description, double amount) {
        return bsonNeed(new ObjectId(id), predetermined, description, amount);
    }

    private Document bsonNeed(ObjectId id, int predetermined, String description, double amount) {
        return new Document("_id", id)
                .append("esPredeterminada", predetermined)
                .append("descripcion", description)
                .append("monto", amount)
                .append("excedePresupuesto", false)
                .append("idPerfil", idPerfil)
                .append("idPeriodo", idPeriodo)
                .append("idPresupuesto", presupuesto.getId())
                .append("_class", CLASS_NAME);
    }
}
