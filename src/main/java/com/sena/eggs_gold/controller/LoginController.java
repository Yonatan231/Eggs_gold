package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.dto.AdminDTO;
import com.sena.eggs_gold.dto.ClienteDTO;
import com.sena.eggs_gold.dto.LogisticaDTO;
import com.sena.eggs_gold.dto.ConductorDTO;
import com.sena.eggs_gold.dto.LoginDTO;
import com.sena.eggs_gold.service.AdminService;
import com.sena.eggs_gold.service.ClienteService;
import com.sena.eggs_gold.service.LogisticaService;
import com.sena.eggs_gold.service.ConductorService;
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
    private final LogisticaService logisticaService;
    private final ConductorService conductorService;

    public LoginController(
            ClienteService clienteService,
            AdminService adminService,
            LogisticaService logisticaService,
            ConductorService conductorService
    ) {
        this.clienteService = clienteService;
        this.adminService = adminService;
        this.logisticaService = logisticaService;
        this.conductorService = conductorService;
    }

    // Página de login
    @GetMapping("/login")
    public String mostrarLogin(Model model) {
        model.addAttribute("loginDTO", new LoginDTO());
        return "inicio_secion"; // tu template HTML
    }

    // Procesar login
    @PostMapping("/login")
    public String procesarLogin(@ModelAttribute LoginDTO loginDTO, HttpSession session, Model model) {

        // Cliente
        ClienteDTO cliente = clienteService.login(loginDTO.getDocumento(), loginDTO.getPassword());
        if (cliente != null) {
            session.setAttribute("usuario_id", cliente.getIdUsuarios());
            session.setAttribute("rol", "CLIENTE");
            session.setAttribute("cliente", cliente);
            model.addAttribute("usuario", cliente);
            return "redirect:/inventario";
        }

        // Admin
        AdminDTO admin = adminService.login(loginDTO.getDocumento(), loginDTO.getPassword());
        if (admin != null) {
            session.setAttribute("usuario_id", admin.getIdUsuarios());
            session.setAttribute("rol", "ADMIN");
            model.addAttribute("usuario", admin);
            return "redirect:/administrador";
        }

        // Logística
        LogisticaDTO logistica = logisticaService.login(loginDTO.getDocumento(), loginDTO.getPassword());
        if (logistica != null) {
            session.setAttribute("usuario_id", logistica.getIdUsuarios());
            session.setAttribute("rol", "LOGISTICA");
            model.addAttribute("usuario", logistica);
            return "redirect:/logistica";
        }

        // Conductor
        ConductorDTO conductor = conductorService.login(loginDTO.getDocumento(), loginDTO.getPassword());
        if (conductor != null) {
            session.setAttribute("usuario_id", conductor.getIdUsuarios());
            session.setAttribute("rol", "CONDUCTOR");
            model.addAttribute("usuario", conductor);
            return "redirect:/conductor";
        }

        // Si no coincide en ninguno
        model.addAttribute("error", "Credenciales incorrectas");
        return "inicio_secion";
    }

    @GetMapping("/administrador")
    public String mostrarAdmin(Model model, HttpSession session) {
        // Opcional: agregar datos al modelo si quieres
        return "administrador"; // esto apunta a resources/templates/administrador.html
    }


    // Ver datos de sesión
    @GetMapping("/session")
    @ResponseBody
    public Map<String, Object> getSession(HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        response.put("usuario_id", session.getAttribute("usuario_id"));
        response.put("rol", session.getAttribute("rol"));
        return response;
    }


    // Logout (equivalente a session_destroy() en PHP)
    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/login";
    }


}







