package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.service.AdminService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AdministradorController {

    private final AdminService adminService;

    public AdministradorController(AdminService adminService) {
        this.adminService = adminService;
    }

    // Endpoint para el panel de administrador
    @GetMapping("/administrador_inicio")
    public String mostrarPanelAdmin() {
        return "administrador/administrador_inicio"; // admin.html en src/main/resources/templates
    }

    @GetMapping("/entrada_stock")
    public String mostrarLlegadaStock() {
        return "administrador/entrada_stock"; // admin.html en src/main/resources/templates
    }


}

