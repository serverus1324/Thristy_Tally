package com.example.CalcGastosU.service;

import com.example.CalcGastosU.dto.EstudianteDTO;
import com.example.CalcGastosU.entity.Estudiante;
import com.example.CalcGastosU.entity.Perfil;
import com.example.CalcGastosU.entity.Usuario;
import com.example.CalcGastosU.repository.EstudianteRepository;
import com.example.CalcGastosU.repository.PerfilRepository;
import com.example.CalcGastosU.repository.UsuarioRepository;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class EstudianteServiceTest {

    @Mock
    private EstudianteRepository estudianteRepository;

    @Mock
    private PerfilRepository perfilRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private EstudianteService estudianteService;

    @Test
    void saveCreaPerfilAsociadoAlUsuario() {
        EstudianteDTO dto = new EstudianteDTO();
        dto.setNombre("Ana");
        dto.setEmail("ana@example.com");
        dto.setTelefono("5551234");
        dto.setUsername("ana");
        dto.setPassword("secret");

        Estudiante estudiante = estudianteService.save(dto);

        ArgumentCaptor<Perfil> perfilCaptor = ArgumentCaptor.forClass(Perfil.class);
        ArgumentCaptor<Usuario> usuarioCaptor = ArgumentCaptor.forClass(Usuario.class);
        verify(perfilRepository).save(perfilCaptor.capture());
        verify(usuarioRepository).save(usuarioCaptor.capture());

        ObjectId perfilId = perfilCaptor.getValue().getId();
        assertEquals(estudiante.getId(), perfilId);
        assertEquals(perfilId, usuarioCaptor.getValue().getIdPerfil());
        assertEquals("Ana", perfilCaptor.getValue().getNombre());
    }
}