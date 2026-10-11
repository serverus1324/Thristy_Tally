package com.example.CalcGastosU.service;

import com.example.CalcGastosU.entity.Estudiante;
import com.example.CalcGastosU.entity.Perfil;
import com.example.CalcGastosU.entity.Usuario;
import com.example.CalcGastosU.repository.EstudianteRepository;
import com.example.CalcGastosU.repository.PerfilRepository;
import com.example.CalcGastosU.repository.UsuarioRepository;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PerfilServiceTest {

    @Mock
    private PerfilRepository perfilRepository;

    @Mock
    private EstudianteRepository estudianteRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private PerfilService perfilService;

    @Test
    void recreaPerfilDesdeEstudianteCuandoFalta() {
        ObjectId id = new ObjectId();
        Estudiante estudiante = new Estudiante();
        estudiante.setId(id);
        estudiante.setNombre("Ana");
        estudiante.setEmail("ana@example.com");
        estudiante.setTelefono("5551234");
        when(perfilRepository.findById(id)).thenReturn(Optional.empty());
        when(estudianteRepository.findById(id)).thenReturn(Optional.of(estudiante));
        when(perfilRepository.save(org.mockito.ArgumentMatchers.any(Perfil.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Perfil perfil = perfilService.getOrCreateForId(id);

        assertEquals(id, perfil.getId());
        assertEquals("Ana", perfil.getNombre());
        assertEquals("ana@example.com", perfil.getEmail());
        assertEquals("5551234", perfil.getTelefono());
        verify(perfilRepository).save(perfil);
    }

    @Test
    void devuelvePerfilExistenteSinConsultarEstudiante() {
        ObjectId id = new ObjectId();
        Perfil perfil = new Perfil();
        perfil.setId(id);
        when(perfilRepository.findById(id)).thenReturn(Optional.of(perfil));

        assertSame(perfil, perfilService.getOrCreateForId(id));

        verify(estudianteRepository, never()).findById(id);
    }

    @Test
    void recreaPerfilDesdeUsuarioCuandoFaltaEstudiante() {
        ObjectId id = new ObjectId();
        Usuario usuario = new Usuario();
        usuario.setIdPerfil(id);
        usuario.setNombre("Ana");
        usuario.setEmail("ana@example.com");
        when(perfilRepository.findById(id)).thenReturn(Optional.empty());
        when(estudianteRepository.findById(id)).thenReturn(Optional.empty());
        when(usuarioRepository.findByIdPerfil(id)).thenReturn(Optional.of(usuario));
        when(perfilRepository.save(org.mockito.ArgumentMatchers.any(Perfil.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Perfil perfil = perfilService.getOrCreateForId(id);

        assertEquals(id, perfil.getId());
        assertEquals("Ana", perfil.getNombre());
        assertEquals("ana@example.com", perfil.getEmail());
        verify(perfilRepository).save(perfil);
    }

    @Test
    void fallaSiNoExistePerfilNiCuentaNiEstudiante() {
        ObjectId id = new ObjectId();
        when(perfilRepository.findById(id)).thenReturn(Optional.empty());
        when(estudianteRepository.findById(id)).thenReturn(Optional.empty());
        when(usuarioRepository.findByIdPerfil(id)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> perfilService.getOrCreateForId(id));
    }
}