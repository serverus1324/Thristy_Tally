package com.example.CalcGastosU.config;

import com.example.CalcGastosU.entity.Perfil;
import com.example.CalcGastosU.entity.Usuario;
import com.example.CalcGastosU.enums.Role;
import com.example.CalcGastosU.repository.PerfilRepository;
import com.example.CalcGastosU.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminSeederTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PerfilRepository perfilRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private AdminSeeder adminSeeder;

    @BeforeEach
    void setUp() {
        adminSeeder = new AdminSeeder(usuarioRepository, perfilRepository, passwordEncoder);
        ReflectionTestUtils.setField(adminSeeder, "adminUsername", "root");
        ReflectionTestUtils.setField(adminSeeder, "adminPassword", "Secreta123");
        ReflectionTestUtils.setField(adminSeeder, "adminEmail", "root@thriftytally.local");
        ReflectionTestUtils.setField(adminSeeder, "adminNombre", "Administrador");
    }

    @Test
    void noCreaAdminCuandoFaltanCredenciales() {
        ReflectionTestUtils.setField(adminSeeder, "adminUsername", "  ");
        ReflectionTestUtils.setField(adminSeeder, "adminPassword", "");

        adminSeeder.run();

        verifyNoInteractions(usuarioRepository, perfilRepository, passwordEncoder);
    }

    @Test
    void noCreaAdminSiElUsuarioYaExiste() {
        when(usuarioRepository.existsByUsername("root")).thenReturn(true);

        adminSeeder.run();

        verify(usuarioRepository, never()).save(any(Usuario.class));
        verify(perfilRepository, never()).save(any(Perfil.class));
    }

    @Test
    void creaAdminConRolAdminPasswordHasheadaYActivo() {
        when(usuarioRepository.existsByUsername("root")).thenReturn(false);
        when(passwordEncoder.encode("Secreta123")).thenReturn("$2a$hash");

        adminSeeder.run();

        ArgumentCaptor<Usuario> captor = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(captor.capture());
        Usuario admin = captor.getValue();

        assertEquals("root", admin.getUsername());
        assertEquals("$2a$hash", admin.getPassword());
        assertEquals("Administrador", admin.getNombre());
        assertTrue(admin.getRoles().contains(Role.ROLE_ADMIN));
        assertTrue(admin.getActivo());
        assertNotNull(admin.getIdPerfil());

        ArgumentCaptor<Perfil> perfilCaptor = ArgumentCaptor.forClass(Perfil.class);
        verify(perfilRepository).save(perfilCaptor.capture());
        assertEquals(admin.getIdPerfil(), perfilCaptor.getValue().getId());
    }

    @Test
    void generaEmailPorDefectoCuandoNoSeConfigura() {
        ReflectionTestUtils.setField(adminSeeder, "adminEmail", "");
        when(usuarioRepository.existsByUsername("root")).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("hash");

        adminSeeder.run();

        ArgumentCaptor<Usuario> captor = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(captor.capture());
        assertEquals("root@thriftytally.local", captor.getValue().getEmail());
    }
}
