package com.example.CalcGastosU.config;

import com.example.CalcGastosU.entity.Perfil;
import com.example.CalcGastosU.entity.Usuario;
import com.example.CalcGastosU.enums.Role;
import com.example.CalcGastosU.enums.TipoUsuario;
import com.example.CalcGastosU.repository.PerfilRepository;
import com.example.CalcGastosU.repository.UsuarioRepository;
import org.bson.types.ObjectId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

/**
 * Bootstrap del primer administrador.
 *
 * Las credenciales se leen desde el archivo .env (carpeta CalcGastosU):
 *   ADMIN_USERNAME=...
 *   ADMIN_PASSWORD=...
 *   ADMIN_EMAIL=...
 *   ADMIN_NOMBRE=...
 *
 * Si ADMIN_USERNAME o ADMIN_PASSWORD están vacíos no se crea nada.
 * Si el usuario ya existe, tampoco se toca (la contraseña del .env NO se
 * re-aplica: una vez creado, el usuario vive en MongoDB).
 */
@Component
public class AdminSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    private final UsuarioRepository usuarioRepository;
    private final PerfilRepository perfilRepository;
    private final PasswordEncoder passwordEncoder;

    // spring-dotenv expone las claves del .env tal cual (ver application-dev.properties),
    // por eso se leen en MAYÚSCULAS.
    @Value("${ADMIN_USERNAME:}")
    private String adminUsername;

    @Value("${ADMIN_PASSWORD:}")
    private String adminPassword;

    @Value("${ADMIN_EMAIL:}")
    private String adminEmail;

    @Value("${ADMIN_NOMBRE:Administrador}")
    private String adminNombre;

    public AdminSeeder(UsuarioRepository usuarioRepository,
                       PerfilRepository perfilRepository,
                       PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.perfilRepository = perfilRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (adminUsername == null || adminUsername.isBlank()
                || adminPassword == null || adminPassword.isBlank()) {
            log.info("AdminSeeder: ADMIN_USERNAME/ADMIN_PASSWORD no configurados, no se crea administrador.");
            return;
        }

        if (usuarioRepository.existsByUsername(adminUsername)) {
            usuarioRepository.findByUsername(adminUsername).ifPresent(u -> {
                Set<Role> roles = u.getRoles();
                if (roles == null) {
                    roles = new HashSet<>();
                }
                
                if (!roles.contains(Role.ROLE_ADMIN)) {
                    log.info("AdminSeeder: el usuario '{}' existe pero no es ADMIN. Promoviendo...", adminUsername);
                    roles.add(Role.ROLE_ADMIN);
                    u.setRoles(roles);
                    u.setActivo(true);
                    usuarioRepository.save(u);
                } else {
                    log.info("AdminSeeder: el usuario '{}' ya existe y es ADMIN.", adminUsername);
                }
            });
            return;
        }

        String email = (adminEmail != null && !adminEmail.isBlank())
                ? adminEmail
                : adminUsername + "@thriftytally.local";

        ObjectId idPerfil = new ObjectId();
        Perfil perfil = new Perfil();
        perfil.setId(idPerfil);
        perfil.setNombre(adminNombre);
        perfil.setEmail(email);
        perfil.setTipoUsuario(TipoUsuario.INDEPENDIENTE);
        perfilRepository.save(perfil);

        Usuario admin = new Usuario();
        admin.setUsername(adminUsername);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setEmail(email);
        admin.setNombre(adminNombre);
        admin.setIdPerfil(idPerfil);
        admin.setRoles(Set.of(Role.ROLE_ADMIN));
        admin.setActivo(true);
        usuarioRepository.save(admin);

        log.info("AdminSeeder: administrador '{}' creado correctamente.", adminUsername);
    }
}
