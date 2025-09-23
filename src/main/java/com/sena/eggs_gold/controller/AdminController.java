package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.dto.AdminDTO;
import com.sena.eggs_gold.dto.ClienteDTO;
import com.sena.eggs_gold.dto.LoginDTO;
import com.sena.eggs_gold.service.AdminService;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class AdminController {


    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }



}
