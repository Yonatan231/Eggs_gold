package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.dto.AdminDTO;
import com.sena.eggs_gold.dto.ClienteDTO;
import com.sena.eggs_gold.dto.LogisticaDTO;
import com.sena.eggs_gold.dto.LoginDTO;
import com.sena.eggs_gold.service.AdminService;
import com.sena.eggs_gold.service.ClienteService;
import com.sena.eggs_gold.service.LogisticaService;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequestMapping
public class LoginController {

    private final ClienteService clienteService;
    private final AdminService adminService;
    private final LogisticaService logisticaService; // 👈 nuevo

    // Constructor con los tres servicios
    public LoginController(
            ClienteService clienteService,
            AdminService adminService,
            LogisticaService logisticaService
    ) {
        this.clienteService = clienteService;
        this.adminService = adminService;
        this.logisticaService = logisticaService;
    }

    @GetMapping("/login")
    public String mostrarLogin(Model model) {
        model.addAttribute("loginDTO", new LoginDTO());
        return "inicio_secion"; // templates/inicio_sesion.html
    }

    @PostMapping("/login")
    public String procesarLogin(@ModelAttribute LoginDTO loginDTO, HttpSession session, Model model) {

        // Intentar login como Cliente
        ClienteDTO cliente = clienteService.login(loginDTO.getDocumento(), loginDTO.getPassword());
        if (cliente != null) {
            session.setAttribute("usuario_id", cliente.getIdUsuarios());
            session.setAttribute("rol", "CLIENTE");
            model.addAttribute("usuario", cliente);
            return "inventario"; // pagina cliente
        }

        // Intentar login como Admin
        AdminDTO admin = adminService.login(loginDTO.getDocumento(), loginDTO.getPassword());
        if (admin != null) {
            session.setAttribute("usuario_id", admin.getIdUsuarios());
            session.setAttribute("rol", "ADMIN");
            model.addAttribute("usuario", admin);
            return "administrador"; // pagina admin
        }

        // Intentar login como Logística
        LogisticaDTO logistica = logisticaService.login(loginDTO.getDocumento(), loginDTO.getPassword());
        if (logistica != null) {
            session.setAttribute("usuario_id", logistica.getIdUsuarios());
            session.setAttribute("rol", "LOGISTICA");
            model.addAttribute("usuario", logistica);
            return "logistica"; // pagina logistica
        }

        // Si no coincide en ninguno
        model.addAttribute("error", "Credenciales incorrectas");
        return "inicio_secion";
    }

    @GetMapping("/session")
    @ResponseBody
    public Map<String, Object> getSession(HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        response.put("usuario_id", session.getAttribute("usuario_id"));
        response.put("rol", session.getAttribute("rol"));
        return response; // Devuelve JSON
    }
}




