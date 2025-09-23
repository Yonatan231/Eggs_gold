package com.sena.eggs_gold.service.impl;

import com.sena.eggs_gold.dto.AdminDTO;
import com.sena.eggs_gold.model.entity.Rol;
import com.sena.eggs_gold.repository.AdminRepository;
import com.sena.eggs_gold.repository.RolRepository;
import com.sena.eggs_gold.service.AdminService;
import org.springframework.stereotype.Service;

@Service
public class AdminServiceimpl implements AdminService {

    private final AdminRepository adminRepository;
    private final RolRepository rolRepository;

    public AdminServiceimpl(AdminRepository adminRepository, RolRepository rolRepository) {
        this.adminRepository = adminRepository;
        this.rolRepository = rolRepository;
    }



    public AdminDTO login(String numDocumento, String password){
        return adminRepository.findByNumDocumentoAndPassword(numDocumento, password)
                .map(admin->{
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

}
