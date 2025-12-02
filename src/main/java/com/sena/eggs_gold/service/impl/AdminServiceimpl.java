package com.sena.eggs_gold.service.impl;

import com.sena.eggs_gold.dto.AdminDTO;
import com.sena.eggs_gold.model.entity.Rol;
import com.sena.eggs_gold.model.entity.Usuario;
import com.sena.eggs_gold.model.enums.EstadoUsuario;
import com.sena.eggs_gold.repository.AdminRepository;
import com.sena.eggs_gold.repository.RolRepository;
import com.sena.eggs_gold.repository.UsuarioRepository;
import com.sena.eggs_gold.service.AdminService;
import com.sena.eggs_gold.service.EmailService;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;

@Service
public class AdminServiceimpl implements AdminService {

    private final AdminRepository adminRepository;
    private final RolRepository rolRepository;
    private final UsuarioRepository usuarioRepository;
    private final EmailService emailService;

    public AdminServiceimpl(AdminRepository adminRepository,
                            RolRepository rolRepository,
                            UsuarioRepository usuarioRepository,
                            EmailService emailService) {
        this.adminRepository = adminRepository;
        this.rolRepository = rolRepository;
        this.usuarioRepository = usuarioRepository;
        this.emailService = emailService;
    }

    @Override
    public AdminDTO login(String numDocumento, String password){
        // paso 1: buscar admin solo por numero de documento
        return adminRepository.findByNumDocumento(numDocumento)
                .map(admin->{
                    // paso 2: verificar que el usuario este activo
                    if (admin.getEstado() != EstadoUsuario.ACTIVO) {
                        return null;
                    }

                    // paso 3: validar la contrasena usando bcrypt
                    // bcrypt.checkpw compara la contrasena en texto plano con la hasheada
                    boolean passwordCorrecta = BCrypt.checkpw(password, admin.getPassword());

                    if (!passwordCorrecta) {
                        return null;
                    }

                    // paso 4: si todo esta bien, crear y retornar el dto
                    AdminDTO dto = new AdminDTO();
                    dto.setIdUsuarios(admin.getIdUsuarios());
                    dto.setNumDocumento(admin.getNumDocumento());
                    dto.setPassword(admin.getPassword());
                    Rol rol = rolRepository.findById(1)
                            .orElseThrow(() -> new RuntimeException("Rol por defecto (ID 1) no encontrado"));
                    admin.setRol(rol);
                    return dto;
                })
                .orElse(null);
    }

    @Override
    public void cambiarEstadoUsuario(Integer idUsuario, EstadoUsuario nuevoEstado) {
        // buscar el usuario por id
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // solo enviar correo si el estado es inactivo
        if (nuevoEstado == EstadoUsuario.INACTIVO) {
            String nombreCompleto = usuario.getNombre() + " " + usuario.getApellido();
            emailService.enviarCorreoSuspension(usuario.getCorreo(), nombreCompleto);
        }
    }
}