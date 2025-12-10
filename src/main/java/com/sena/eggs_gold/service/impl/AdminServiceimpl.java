package com.sena.eggs_gold.service.impl;

import com.sena.eggs_gold.dto.AdminDTO;
import com.sena.eggs_gold.model.entity.Rol;
import com.sena.eggs_gold.model.enums.EstadoUsuario;
import com.sena.eggs_gold.repository.AdminRepository;
import com.sena.eggs_gold.repository.RolRepository;
import com.sena.eggs_gold.service.AdminService;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;

@Service
public class AdminServiceimpl implements AdminService {

    private final AdminRepository adminRepository;
    private final RolRepository rolRepository;

    public AdminServiceimpl(AdminRepository adminRepository,
                            RolRepository rolRepository) {
        this.adminRepository = adminRepository;
        this.rolRepository = rolRepository;
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

    // nota: el metodo cambiarEstadoUsuario fue movido a UsuarioService
    // usar usuarioService.cambiarEstadoUsuario() en su lugar
}