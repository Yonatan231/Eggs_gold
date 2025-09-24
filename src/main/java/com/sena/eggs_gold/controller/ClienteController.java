package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.dto.ClienteDTO;
import com.sena.eggs_gold.repository.UsuarioRepository;
import com.sena.eggs_gold.service.ClienteService;
import com.sena.eggs_gold.service.UsuarioService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
public class ClienteController {

    private final ClienteService clienteService;
    private final UsuarioService usuarioService;


    public ClienteController(ClienteService clienteService, UsuarioService usuarioService, UsuarioRepository usuarioRepository) {
        this.clienteService = clienteService;
        this.usuarioService = usuarioService;

    }

    @GetMapping("/registro")
    public String mostrarFormularioRegistro(Model model) {
        model.addAttribute("clienteDTO", new ClienteDTO());
        return "registro";
    }

    @PostMapping("/registro")
    public String registrarCliente(@ModelAttribute("clienteDTO") ClienteDTO clienteDTO, Model model) {
        if (usuarioService.documentoYaExistente(clienteDTO.getNumDocumento())) {
            model.addAttribute("error", "El número de documento ya está registrado");
            return "registro";
        }
        try {
            clienteService.registrarCliente(clienteDTO);
            model.addAttribute("mensaje", "Cliente registrado exitosamente");
        } catch (Exception e) {
            model.addAttribute("error", "Error al registrar cliente: " + e.getMessage());
        }
        return "redirect:auth/login";

    }

}
