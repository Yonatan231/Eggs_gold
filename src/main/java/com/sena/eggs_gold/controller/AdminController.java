package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.service.AdminService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // Endpoint para el panel de administrador
    @GetMapping("/admin")
    public String mostrarPanelAdmin() {
        return "administrador"; // admin.html en src/main/resources/templates
    }

}

