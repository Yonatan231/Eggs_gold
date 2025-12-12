package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.dto.AdminDTO;
import com.sena.eggs_gold.dto.ClienteDTO;
import com.sena.eggs_gold.dto.LogisticaDTO;
import com.sena.eggs_gold.dto.ConductorDTO;
import com.sena.eggs_gold.dto.LoginDTO;
import com.sena.eggs_gold.model.entity.Cliente;
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

    @GetMapping("/login")
    public String mostrarLogin(Model model, @RequestParam(required = false) String error) {
        model.addAttribute("loginDTO", new LoginDTO());

        if (error != null) {
            model.addAttribute("error", "Documento o contraseña incorrectos");
        }

        return "iniciar_sesion/iniciar_sesion";
    }

    @PostMapping("/login")
    public String procesarLogin(@ModelAttribute LoginDTO loginDTO, HttpSession session, Model model) {

        ClienteDTO cliente = clienteService.login(loginDTO.getDocumento(), loginDTO.getPassword());
        if (cliente != null) {
            session.setAttribute("usuario_id", cliente.getIdUsuarios());
            session.setAttribute("rol", "CLIENTE");
            session.setAttribute("cliente", cliente);
            model.addAttribute("usuario", cliente);
            return "redirect:/inicio_cliente";
        }

        AdminDTO admin = adminService.login(loginDTO.getDocumento(), loginDTO.getPassword());
        if (admin != null) {
            session.setAttribute("usuario_id", admin.getIdUsuarios());
            session.setAttribute("rol", "ADMIN");
            model.addAttribute("usuario", admin);
            return "redirect:/administrador_inicio";
        }

        LogisticaDTO Logistica = logisticaService.login(loginDTO.getDocumento(), loginDTO.getPassword());
        if (Logistica != null) {
            session.setAttribute("usuario_id", Logistica.getIdUsuarios());
            session.setAttribute("rol", "LOGISTICA");
            model.addAttribute("usuario", Logistica);
            return "redirect:/logistica_inicio";
        }

        ConductorDTO conductor = conductorService.login(loginDTO.getDocumento(), loginDTO.getPassword());
        if (conductor != null) {
            session.setAttribute("usuario_id", conductor.getIdUsuarios());
            session.setAttribute("rol", "CONDUCTOR");
            session.setAttribute("idConductor", conductor.getIdUsuarios());
            model.addAttribute("usuario", conductor);
            return "redirect:/conductor_inicio";
        }

        return "redirect:/login?error";
    }

    @GetMapping("/administrador")
    public String mostrarAdmin(Model model, HttpSession session) {
        return "administrador/administrador";
    }

    @GetMapping("/session")
    @ResponseBody
    public Map<String, Object> getSession(HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        response.put("usuario_id", session.getAttribute("usuario_id"));
        response.put("rol", session.getAttribute("rol"));
        return response;
    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/login";
    }
}