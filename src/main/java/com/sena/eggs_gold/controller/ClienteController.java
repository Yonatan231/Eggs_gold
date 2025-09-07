package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.dto.ClienteDTO;
import com.sena.eggs_gold.dto.LoginDTO;
import com.sena.eggs_gold.service.ClienteService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @GetMapping("/registro")
    public String mostrarFormularioRegistro(Model model) {
        model.addAttribute("clienteDTO", new ClienteDTO());
        return "registro";
    }

    @PostMapping("/registro")
    public String registrarCliente(@ModelAttribute("clienteDTO") ClienteDTO clienteDTO, Model model) {
        try {
            clienteService.registrarCliente(clienteDTO);
            model.addAttribute("mensaje", "Cliente registrado exitosamente");
        } catch (Exception e) {
            model.addAttribute("error", "Error al registrar cliente: " + e.getMessage());
        }
        return "redirect:/login";

    }

    @GetMapping("/login")
    public String mostrarLogin(Model model) {
        model.addAttribute("loginDTO", new LoginDTO());
        return "inicio_secion"; // templates/inicio_sesion.html

    }

    @PostMapping("/login")
    public String procesarLogin(@ModelAttribute("loginDTO") LoginDTO loginDTO, Model model) {
        ClienteDTO cliente = clienteService.login(loginDTO.getDocumento(), loginDTO.getPassword());

        if (cliente != null) {
            model.addAttribute("cliente", cliente);
            return "bienvenido"; // ejemplo: templates/bienvenido.html
        } else {
            model.addAttribute("error", "Documento o contraseña incorrectos");
            return "inicio_secion";
        }

    }

}
