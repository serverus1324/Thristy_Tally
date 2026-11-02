package com.example.CalcGastosU.service;

import com.example.CalcGastosU.entity.Perfil;
import com.example.CalcGastosU.entity.Usuario;
import com.example.CalcGastosU.enums.Role;
import com.example.CalcGastosU.repository.PerfilRepository;
import com.example.CalcGastosU.repository.UsuarioRepository;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PerfilRepository perfilRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UsuarioService usuarioService;

    private ObjectId idUsuario;
    private ObjectId idPerfil;
    private Usuario objetivo;

    @BeforeEach
    void setUp() {
        idUsuario = new ObjectId();
        idPerfil = new ObjectId();

        objetivo = new Usuario();
        objetivo.setId(idUsuario);
        objetivo.setIdPerfil(idPerfil);
        objetivo.setUsername("juan");
        objetivo.setEmail("juan@mail.com");
        objetivo.setNombre("Juan");
        objetivo.setPassword("$2a$hashViejo");
        objetivo.setRoles(Set.of(Role.ROLE_USER));
        objetivo.setActivo(true);

        autenticarComoAdmin();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void autenticarComoAdmin() {
        Usuario admin = new Usuario();
        admin.setId(new ObjectId());
        admin.setRoles(Set.of(Role.ROLE_ADMIN));
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        admin, null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))));
    }

    @Test
    void actualizarDatosSinAutenticacionLanzaSecurityException() {
        SecurityContextHolder.clearContext();

        assertThrows(SecurityException.class,
                () -> usuarioService.actualizarDatos(idUsuario, "nuevo", null, null, null));

        verify(usuarioRepository, never()).save(any(Usuario.class));
    }

    @Test
    void actualizarDatosCambiaUsernameEmailYNombre() {
        when(usuarioRepository.findById(idUsuario)).thenReturn(Optional.of(objetivo));
        when(usuarioRepository.existsByUsername("juanito")).thenReturn(false);
        when(usuarioRepository.existsByEmail("juanito@mail.com")).thenReturn(false);
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));
        when(perfilRepository.findById(idPerfil)).thenReturn(Optional.of(new Perfil()));

        Usuario resultado = usuarioService.actualizarDatos(
                idUsuario, "juanito", "juanito@mail.com", "Juanito", null);

        assertEquals("juanito", resultado.getUsername());
        assertEquals("juanito@mail.com", resultado.getEmail());
        assertEquals("Juanito", resultado.getNombre());
        assertEquals("$2a$hashViejo", resultado.getPassword(), "la contraseña no debe cambiar si viene vacía");
        verify(perfilRepository).save(any(Perfil.class));
    }

    @Test
    void actualizarDatosHasheaLaNuevaPassword() {
        when(usuarioRepository.findById(idUsuario)).thenReturn(Optional.of(objetivo));
        when(passwordEncoder.encode("nueva123")).thenReturn("$2a$hashNuevo");
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        Usuario resultado = usuarioService.actualizarDatos(idUsuario, null, null, null, "nueva123");

        assertEquals("$2a$hashNuevo", resultado.getPassword());
    }

    @Test
    void actualizarDatosRechazaUsernameYaUsado() {
        when(usuarioRepository.findById(idUsuario)).thenReturn(Optional.of(objetivo));
        when(usuarioRepository.existsByUsername("pedro")).thenReturn(true);

        assertThrows(IllegalArgumentException.class,
                () -> usuarioService.actualizarDatos(idUsuario, "pedro", null, null, null));

        verify(usuarioRepository, never()).save(any(Usuario.class));
    }

    @Test
    void actualizarDatosRechazaEmailYaUsado() {
        when(usuarioRepository.findById(idUsuario)).thenReturn(Optional.of(objetivo));
        when(usuarioRepository.existsByEmail("pedro@mail.com")).thenReturn(true);

        assertThrows(IllegalArgumentException.class,
                () -> usuarioService.actualizarDatos(idUsuario, null, "pedro@mail.com", null, null));

        verify(usuarioRepository, never()).save(any(Usuario.class));
    }

    @Test
    void actualizarDatosConMismoUsernameNoConsultaDuplicados() {
        when(usuarioRepository.findById(idUsuario)).thenReturn(Optional.of(objetivo));
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        Usuario resultado = usuarioService.actualizarDatos(idUsuario, "juan", "juan@mail.com", "Juan", null);

        assertEquals("juan", resultado.getUsername());
        verify(usuarioRepository, never()).existsByUsername(any());
        verify(usuarioRepository, never()).existsByEmail(any());
    }

    @Test
    void actualizarDatosLanzaErrorSiElUsuarioNoExiste() {
        when(usuarioRepository.findById(idUsuario)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> usuarioService.actualizarDatos(idUsuario, "nuevo", null, null, null));
    }
}
