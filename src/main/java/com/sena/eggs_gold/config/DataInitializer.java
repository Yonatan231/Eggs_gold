package com.sena.eggs_gold.config;

import com.sena.eggs_gold.model.entity.Admin;
import com.sena.eggs_gold.model.entity.Rol;
import com.sena.eggs_gold.model.entity.Usuario;
import com.sena.eggs_gold.model.enums.Estado;
import com.sena.eggs_gold.model.enums.TipoDocumento;
import com.sena.eggs_gold.repository.RolRepository;
import com.sena.eggs_gold.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner initAdmin(UsuarioRepository usuarioRepository, RolRepository rolRepository) {
        return args -> {
                if (usuarioRepository.findByNombre("Admin").isEmpty()) {
                    Rol rolAdmin = rolRepository.findByNombreRol("Administrador")
                            .orElseThrow(() -> new RuntimeException("No existe rol Administrador en la tabla rol"));

                    Admin admin = new Admin();
                    admin.setRol(rolAdmin);
                    admin.setVehiculo(null);
                    admin.setNombre("Admin");
                    admin.setApellido("Principal");
                    admin.setDireccionUsuario("Oficina central");
                    admin.setTipoDocumento(TipoDocumento.CC);
                    admin.setNumDocumento("123456789");
                    admin.setTelefono("0000000000");
                    admin.setEstado(Estado.ACTIVO);
                    admin.setCorreo("admin@tuapp.com");
                    admin.setPassword("1234"); // 🔒 Deberías encriptar la contraseña
                    admin.setFechaRegistro(LocalDate.now());

                    usuarioRepository.save(admin);

                    System.out.println(">>> Usuario administrador creado por defecto");


                }
            };
    }
}
