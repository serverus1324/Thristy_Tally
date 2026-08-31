package com.miproyecto.service;

import com.example.CalcGastosU.service.NecesidadService;
import com.example.CalcGastosU.dto.NecesidadDTO;
import com.example.CalcGastosU.dto.ResumenPresupuestoDTO;
import com.example.CalcGastosU.entity.Necesidad;
import com.example.CalcGastosU.entity.Perfil;
import com.example.CalcGastosU.entity.Periodo;
import com.example.CalcGastosU.entity.Presupuesto;
import com.example.CalcGastosU.repository.NecesidadRepository;
import com.example.CalcGastosU.repository.PerfilRepository;
import com.example.CalcGastosU.repository.PeriodoRepository;
import com.example.CalcGastosU.repository.PresupuestoRepository;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Pruebas del Servicio de Necesidades")
class NecesidadServiceTest {

    @Mock
    private NecesidadRepository necesidadRepository;

    @Mock
    private PerfilRepository perfilRepository;

    @Mock
    private PeriodoRepository periodoRepository;

    @Mock
    private PresupuestoRepository presupuestoRepository;

    @InjectMocks
    private NecesidadService necesidadService;

    private ObjectId idPerfil;
    private ObjectId idPeriodo;
    private ObjectId idPresupuesto;
    private ObjectId idNecesidad;
    private Perfil perfil;
    private Periodo periodo;
    private Presupuesto presupuesto;
    private Necesidad necesidad1;
    private Necesidad necesidad2;
    private NecesidadDTO necesidadDTO;
    private List<Necesidad> listaNecesidades;

    @BeforeEach
    void setUp() {
        // Generar IDs
        idPerfil = new ObjectId();
        idPeriodo = new ObjectId();
        idPresupuesto = new ObjectId();
        idNecesidad = new ObjectId();

        // Crear entidades de prueba
        perfil = new Perfil();
        perfil.setId(idPerfil);
        perfil.setNombre("Perfil Prueba");

        periodo = new Periodo();
        periodo.setId(idPeriodo);
        periodo.setNombre("Enero 2026");

        presupuesto = new Presupuesto();
        presupuesto.setId(idPresupuesto);
        presupuesto.setMonto(1000.0);
        presupuesto.setDescripcion("Presupuesto Mensual");

        necesidad1 = new Necesidad();
        necesidad1.setId(new ObjectId());
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

        // Crear DTO de prueba
        necesidadDTO = new NecesidadDTO();
        necesidadDTO.setId(idNecesidad);
        necesidadDTO.setDescripcion("Nueva Necesidad");
        necesidadDTO.setMonto(150.0);
        necesidadDTO.setEsPredeterminada(0);
        necesidadDTO.setIdPerfil(idPerfil);
        necesidadDTO.setIdPeriodo(idPeriodo);
        necesidadDTO.setIdPresupuesto(idPresupuesto);
    }

    // ============================================================
    // PRUEBAS DE getAll()
    // ============================================================
    @Nested
    @DisplayName("Pruebas de getAll() - Obtener todas las necesidades")
    class GetAllTests {

        @Test
        @DisplayName("Debería devolver todas las necesidades")
        void testGetAllExitoso() {
            // Arrange
            when(necesidadRepository.findAll()).thenReturn(listaNecesidades);

            // Act
            List<Necesidad> resultado = necesidadService.getAll();

            // Assert
            assertNotNull(resultado);
            assertEquals(2, resultado.size());
            assertEquals("Alimentación", resultado.get(0).getDescripcion());
            assertEquals("Transporte", resultado.get(1).getDescripcion());
            verify(necesidadRepository, times(1)).findAll();
        }

        @Test
        @DisplayName("Debería devolver lista vacía cuando no hay necesidades")
        void testGetAllVacio() {
            // Arrange
            when(necesidadRepository.findAll()).thenReturn(Arrays.asList());

            // Act
            List<Necesidad> resultado = necesidadService.getAll();

            // Assert
            assertNotNull(resultado);
            assertTrue(resultado.isEmpty());
            verify(necesidadRepository, times(1)).findAll();
        }
    }

    // ============================================================
    // PRUEBAS DE getById()
    // ============================================================
    @Nested
    @DisplayName("Pruebas de getById() - Buscar necesidad por ID")
    class GetByIdTests {

        @Test
        @DisplayName("Debería encontrar una necesidad por ID")
        void testGetByIdExitoso() {
            // Arrange
            when(necesidadRepository.findById(idNecesidad)).thenReturn(Optional.of(necesidad1));

            // Act
            Optional<Necesidad> resultado = necesidadService.getById(idNecesidad);

            // Assert
            assertTrue(resultado.isPresent());
            assertEquals("Alimentación", resultado.get().getDescripcion());
            assertEquals(300.0, resultado.get().getMonto());
            verify(necesidadRepository, times(1)).findById(idNecesidad);
        }

        @Test
        @DisplayName("Debería devolver Optional vacío cuando la necesidad no existe")
        void testGetByIdNoExistente() {
            // Arrange
            ObjectId idInexistente = new ObjectId();
            when(necesidadRepository.findById(idInexistente)).thenReturn(Optional.empty());

            // Act
            Optional<Necesidad> resultado = necesidadService.getById(idInexistente);

            // Assert
            assertFalse(resultado.isPresent());
            verify(necesidadRepository, times(1)).findById(idInexistente);
        }
    }

    // ============================================================
    // PRUEBAS DE save()
    // ============================================================
    @Nested
    @DisplayName("Pruebas de save() - Guardar lista de necesidades")
    class SaveTests {

        @Test
        @DisplayName("Debería guardar una lista de necesidades correctamente")
        void testSaveListaExitoso() {
            // Arrange
            List<NecesidadDTO> dtoList = Arrays.asList(necesidadDTO);
            
            when(perfilRepository.findById(idPerfil)).thenReturn(Optional.of(perfil));
            when(periodoRepository.findById(idPeriodo)).thenReturn(Optional.of(periodo));
            when(necesidadRepository.save(any(Necesidad.class))).thenReturn(necesidad1);

            // Act
            List<Necesidad> resultado = necesidadService.save(dtoList);

            // Assert
            assertNotNull(resultado);
            assertEquals(1, resultado.size());
            verify(perfilRepository, times(1)).findById(idPerfil);
            verify(periodoRepository, times(1)).findById(idPeriodo);
            verify(necesidadRepository, times(1)).save(any(Necesidad.class));
        }

        @Test
        @DisplayName("Debería devolver lista vacía cuando el DTO es null")
        void testSaveListaNull() {
            // Act
            List<Necesidad> resultado = necesidadService.save(null);

            // Assert
            assertNotNull(resultado);
            assertTrue(resultado.isEmpty());
            verify(necesidadRepository, never()).save(any(Necesidad.class));
        }

        @Test
        @DisplayName("Debería devolver lista vacía cuando la lista está vacía")
        void testSaveListaVacia() {
            // Act
            List<Necesidad> resultado = necesidadService.save(Arrays.asList());

            // Assert
            assertNotNull(resultado);
            assertTrue(resultado.isEmpty());
            verify(necesidadRepository, never()).save(any(Necesidad.class));
        }

        @Test
        @DisplayName("Debería lanzar excepción cuando el Perfil no existe")
        void testSavePerfilNoEncontrado() {
            // Arrange
            List<NecesidadDTO> dtoList = Arrays.asList(necesidadDTO);
            when(perfilRepository.findById(idPerfil)).thenReturn(Optional.empty());

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class, () -> {
                necesidadService.save(dtoList);
            });
            assertEquals("Perfil no encontrado con ID: " + idPerfil, exception.getMessage());
            verify(periodoRepository, never()).findById(any());
            verify(necesidadRepository, never()).save(any(Necesidad.class));
        }

        @Test
        @DisplayName("Debería lanzar excepción cuando el Periodo no existe")
        void testSavePeriodoNoEncontrado() {
            // Arrange
            List<NecesidadDTO> dtoList = Arrays.asList(necesidadDTO);
            when(perfilRepository.findById(idPerfil)).thenReturn(Optional.of(perfil));
            when(periodoRepository.findById(idPeriodo)).thenReturn(Optional.empty());

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class, () -> {
                necesidadService.save(dtoList);
            });
            assertEquals("Periodo no encontrado con ID: " + idPeriodo, exception.getMessage());
            verify(necesidadRepository, never()).save(any(Necesidad.class));
        }
    }

    // ============================================================
    // PRUEBAS DE findByIdPerfilAndIdPeriodo()
    // ============================================================
    @Nested
    @DisplayName("Pruebas de findByIdPerfilAndIdPeriodo()")
    class FindByPerfilAndPeriodoTest {

        @Test
        @DisplayName("Debería encontrar necesidades por Perfil y Periodo")
        void testFindByPerfilYPeriodoExitoso() {
            // Arrange
            when(necesidadRepository.findByIdPerfilAndIdPeriodo(idPerfil, idPeriodo))
                .thenReturn(listaNecesidades);

            // Act
            List<Necesidad> resultado = necesidadService.findByIdPerfilAndIdPeriodo(idPerfil, idPeriodo);

            // Assert
            assertNotNull(resultado);
            assertEquals(2, resultado.size());
            verify(necesidadRepository, times(1))
                .findByIdPerfilAndIdPeriodo(idPerfil, idPeriodo);
        }

        @Test
        @DisplayName("Debería devolver lista vacía cuando no hay necesidades")
        void testFindByPerfilYPeriodoVacio() {
            // Arrange
            when(necesidadRepository.findByIdPerfilAndIdPeriodo(idPerfil, idPeriodo))
                .thenReturn(Arrays.asList());

            // Act
            List<Necesidad> resultado = necesidadService.findByIdPerfilAndIdPeriodo(idPerfil, idPeriodo);

            // Assert
            assertNotNull(resultado);
            assertTrue(resultado.isEmpty());
            verify(necesidadRepository, times(1))
                .findByIdPerfilAndIdPeriodo(idPerfil, idPeriodo);
        }
    }

    // ============================================================
    // PRUEBAS DE findByIdPresupuesto()
    // ============================================================
    @Nested
    @DisplayName("Pruebas de findByIdPresupuesto()")
    class FindByPresupuestoTests {

        @Test
        @DisplayName("Debería encontrar necesidades por Presupuesto")
        void testFindByPresupuestoExitoso() {
            // Arrange
            when(necesidadRepository.findByIdPresupuesto(idPresupuesto))
                .thenReturn(listaNecesidades);

            // Act
            List<Necesidad> resultado = necesidadService.findByIdPresupuesto(idPresupuesto);

            // Assert
            assertNotNull(resultado);
            assertEquals(2, resultado.size());
            verify(necesidadRepository, times(1))
                .findByIdPresupuesto(idPresupuesto);
        }
    }

    // ============================================================
    // PRUEBAS DE update()
    // ============================================================
    @Nested
    @DisplayName("Pruebas de update() - Actualizar necesidad")
    class UpdateTests {

        @Test
        @DisplayName("Debería actualizar una necesidad correctamente")
        void testUpdateExitoso() {
            // Arrange
            necesidadDTO.setDescripcion("Nueva Descripción");
            necesidadDTO.setMonto(500.0);
            
            when(necesidadRepository.findById(idNecesidad))
                .thenReturn(Optional.of(necesidad1));
            when(necesidadRepository.save(any(Necesidad.class)))
                .thenReturn(necesidad1);

            // Act
            Necesidad resultado = necesidadService.update(necesidadDTO);

            // Assert
            assertNotNull(resultado);
            verify(necesidadRepository, times(1)).findById(idNecesidad);
            verify(necesidadRepository, times(1)).save(any(Necesidad.class));
        }

        @Test
        @DisplayName("Debería lanzar excepción cuando el DTO es null")
        void testUpdateDtoNull() {
            // Act & Assert
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
                necesidadService.update(null);
            });
            assertEquals("Se requiere el ID de la necesidad para actualizar", 
                exception.getMessage());
        }

        @Test
        @DisplayName("Debería lanzar excepción cuando el ID es null")
        void testUpdateIdNull() {
            // Arrange
            NecesidadDTO dtoSinId = new NecesidadDTO();
            dtoSinId.setDescripcion("Sin ID");

            // Act & Assert
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
                necesidadService.update(dtoSinId);
            });
            assertEquals("Se requiere el ID de la necesidad para actualizar", 
                exception.getMessage());
        }

        @Test
        @DisplayName("Debería lanzar excepción cuando la necesidad no existe")
        void testUpdateNoExistente() {
            // Arrange
            ObjectId idInexistente = new ObjectId();
            necesidadDTO.setId(idInexistente);
            when(necesidadRepository.findById(idInexistente))
                .thenReturn(Optional.empty());

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class, () -> {
                necesidadService.update(necesidadDTO);
            });
            assertEquals("Necesidad no encontrada para actualizar", 
                exception.getMessage());
        }
    }

    // ============================================================
    // PRUEBAS DE delete()
    // ============================================================
    @Nested
    @DisplayName("Pruebas de delete() - Eliminar necesidad")
    class DeleteTests {

        @Test
        @DisplayName("Debería eliminar una necesidad correctamente")
        void testDeleteExitoso() {
            // Arrange
            doNothing().when(necesidadRepository).deleteById(idNecesidad);

            // Act
            necesidadService.delete(idNecesidad);

            // Assert
            verify(necesidadRepository, times(1)).deleteById(idNecesidad);
        }
    }

    // ============================================================
    // PRUEBAS DE guardarConValidacionPresupuesto()
    // ============================================================
    @Nested
    @DisplayName("Pruebas de guardarConValidacionPresupuesto()")
    class GuardarConValidacionPresupuestoTests {

        @Test
        @DisplayName("Debería guardar cuando el presupuesto existe y no excede")
        void testGuardarConValidacionExitoso() {
            // Arrange
            when(perfilRepository.findById(idPerfil)).thenReturn(Optional.of(perfil));
            when(periodoRepository.findById(idPeriodo)).thenReturn(Optional.of(periodo));
            when(presupuestoRepository.findById(idPresupuesto))
                .thenReturn(Optional.of(presupuesto));
            when(necesidadRepository.findByIdPresupuesto(idPresupuesto))
                .thenReturn(Arrays.asList(necesidad1)); // 300.0 usado
            when(necesidadRepository.save(any(Necesidad.class)))
                .thenReturn(necesidad1);

            // Act
            Necesidad resultado = necesidadService.guardarConValidacionPresupuesto(
                necesidadDTO, false);

            // Assert
            assertNotNull(resultado);
            assertFalse(resultado.getExcedePresupuesto());
            verify(necesidadRepository, times(1)).save(any(Necesidad.class));
        }

        @Test
        @DisplayName("Debería lanzar excepción cuando excede el presupuesto y no se fuerza")
        void testGuardarExcedePresupuesto() {
            // Arrange
            necesidadDTO.setMonto(800.0); // 300 + 800 = 1100 > 1000
            when(perfilRepository.findById(idPerfil)).thenReturn(Optional.of(perfil));
            when(periodoRepository.findById(idPeriodo)).thenReturn(Optional.of(periodo));
            when(presupuestoRepository.findById(idPresupuesto))
                .thenReturn(Optional.of(presupuesto));
            when(necesidadRepository.findByIdPresupuesto(idPresupuesto))
                .thenReturn(Arrays.asList(necesidad1)); // 300.0 usado

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class, () -> {
                necesidadService.guardarConValidacionPresupuesto(necesidadDTO, false);
            });
            assertEquals("La necesidad excede el presupuesto asignado", 
                exception.getMessage());
            verify(necesidadRepository, never()).save(any(Necesidad.class));
        }

        @Test
        @DisplayName("Debería guardar con excedePresupuesto=true cuando se fuerza")
        void testGuardarExcedePresupuestoForzado() {
            // Arrange
            necesidadDTO.setMonto(800.0);
            when(perfilRepository.findById(idPerfil)).thenReturn(Optional.of(perfil));
            when(periodoRepository.findById(idPeriodo)).thenReturn(Optional.of(periodo));
            when(presupuestoRepository.findById(idPresupuesto))
                .thenReturn(Optional.of(presupuesto));
            when(necesidadRepository.findByIdPresupuesto(idPresupuesto))
                .thenReturn(Arrays.asList(necesidad1));
            when(necesidadRepository.save(any(Necesidad.class)))
                .thenReturn(necesidad1);

            // Act
            Necesidad resultado = necesidadService.guardarConValidacionPresupuesto(
                necesidadDTO, true);

            // Assert
            assertNotNull(resultado);
            assertTrue(resultado.getExcedePresupuesto());
            verify(necesidadRepository, times(1)).save(any(Necesidad.class));
        }
    }

    // ============================================================
    // PRUEBAS DE obtenerResumenPorPeriodo()
    // ============================================================
    @Nested
    @DisplayName("Pruebas de obtenerResumenPorPeriodo()")
    class ObtenerResumenPorPeriodoTests {

        @Test
        @DisplayName("Debería obtener el resumen correctamente")
        void testObtenerResumenExitoso() {
            // Arrange
            when(presupuestoRepository.findByIdPerfilAndIdPeriodo(idPerfil, idPeriodo))
                .thenReturn(Optional.of(presupuesto));
            when(necesidadRepository.findByIdPresupuesto(idPresupuesto))
                .thenReturn(listaNecesidades); // 300 + 200 = 500

            // Act
            ResumenPresupuestoDTO resultado = necesidadService
                .obtenerResumenPorPeriodo(idPerfil, idPeriodo);

            // Assert
            assertNotNull(resultado);
            assertEquals("Presupuesto Mensual", resultado.getDescripcionPresupuesto());
            assertEquals(1000.0, resultado.getTotalAsignado());
            assertEquals(500.0, resultado.getTotalGastado());
            assertEquals(50.0, resultado.getPorcentajeConsumido());
            assertEquals(500.0, resultado.getDisponible());
            verify(presupuestoRepository, times(1))
                .findByIdPerfilAndIdPeriodo(idPerfil, idPeriodo);
            verify(necesidadRepository, times(1))
                .findByIdPresupuesto(idPresupuesto);
        }

        @Test
        @DisplayName("Debería lanzar excepción cuando el presupuesto no existe")
        void testObtenerResumenPresupuestoNoEncontrado() {
            // Arrange
            when(presupuestoRepository.findByIdPerfilAndIdPeriodo(idPerfil, idPeriodo))
                .thenReturn(Optional.empty());

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class, () -> {
                necesidadService.obtenerResumenPorPeriodo(idPerfil, idPeriodo);
            });
            assertEquals("Presupuesto no encontrado", exception.getMessage());
            verify(necesidadRepository, never())
                .findByIdPresupuesto(any());
        }

        @Test
        @DisplayName("Debería calcular correctamente cuando no hay necesidades")
        void testObtenerResumenSinNecesidades() {
            // Arrange
            when(presupuestoRepository.findByIdPerfilAndIdPeriodo(idPerfil, idPeriodo))
                .thenReturn(Optional.of(presupuesto));
            when(necesidadRepository.findByIdPresupuesto(idPresupuesto))
                .thenReturn(Arrays.asList());

            // Act
            ResumenPresupuestoDTO resultado = necesidadService
                .obtenerResumenPorPeriodo(idPerfil, idPeriodo);

            // Assert
            assertNotNull(resultado);
            assertEquals(1000.0, resultado.getTotalAsignado());
            assertEquals(0.0, resultado.getTotalGastado());
            assertEquals(0.0, resultado.getPorcentajeConsumido());
            assertEquals(1000.0, resultado.getDisponible());
        }
    }

    // ============================================================
    // PRUEBAS DE asignarPresupuestoANecesidad()
    // ============================================================
    @Nested
    @DisplayName("Pruebas de asignarPresupuestoANecesidad()")
    class AsignarPresupuestoTests {

        @Test
        @DisplayName("Debería asignar un presupuesto a una necesidad correctamente")
        void testAsignarPresupuestoExitoso() {
            // Arrange
            when(necesidadRepository.findById(idNecesidad))
                .thenReturn(Optional.of(necesidad1));
            when(presupuestoRepository.findById(idPresupuesto))
                .thenReturn(Optional.of(presupuesto));
            when(necesidadRepository.save(any(Necesidad.class)))
                .thenReturn(necesidad1);

            // Act
            Necesidad resultado = necesidadService
                .asignarPresupuestoANecesidad(idNecesidad, idPresupuesto);

            // Assert
            assertNotNull(resultado);
            assertEquals(idPresupuesto, resultado.getIdPresupuesto());
            verify(necesidadRepository, times(1)).findById(idNecesidad);
            verify(presupuestoRepository, times(1)).findById(idPresupuesto);
            verify(necesidadRepository, times(1)).save(any(Necesidad.class));
        }

        @Test
        @DisplayName("Debería lanzar excepción cuando la necesidad no existe")
        void testAsignarPresupuestoNecesidadNoEncontrada() {
            // Arrange
            when(necesidadRepository.findById(idNecesidad))
                .thenReturn(Optional.empty());

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class, () -> {
                necesidadService.asignarPresupuestoANecesidad(idNecesidad, idPresupuesto);
            });
            assertEquals("Necesidad no encontrada", exception.getMessage());
            verify(presupuestoRepository, never()).findById(any());
        }

        @Test
        @DisplayName("Debería lanzar excepción cuando el presupuesto no existe")
        void testAsignarPresupuestoNoEncontrado() {
            // Arrange
            when(necesidadRepository.findById(idNecesidad))
                .thenReturn(Optional.of(necesidad1));
            when(presupuestoRepository.findById(idPresupuesto))
                .thenReturn(Optional.empty());

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class, () -> {
                necesidadService.asignarPresupuestoANecesidad(idNecesidad, idPresupuesto);
            });
            assertEquals("Presupuesto no encontrado", exception.getMessage());
        }
    }
}