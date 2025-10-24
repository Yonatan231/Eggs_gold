package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.dto.ClienteDTO;
import com.sena.eggs_gold.repository.UsuarioRepository;
import com.sena.eggs_gold.service.ClienteService;
import com.sena.eggs_gold.service.EmailService;
import com.sena.eggs_gold.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

@Controller
public class ClienteController {

    private final ClienteService clienteService;
    private final UsuarioService usuarioService;
    @Autowired
    private EmailService emailService;


    public ClienteController(ClienteService clienteService, UsuarioService usuarioService, UsuarioRepository usuarioRepository) {
        this.clienteService = clienteService;
        this.usuarioService = usuarioService;

    }

    @GetMapping("/registro_cliente")
    public String mostrarFormularioRegistro(Model model) {
        model.addAttribute("clienteDTO", new ClienteDTO());
        return "registros/registro_cliente";
    }

    @PostMapping("/registro_cliente")
    public String registrarCliente(@Valid @ModelAttribute("clienteDTO") ClienteDTO clienteDTO,
                                   BindingResult result,
                                   Model model) {

        if (result.hasErrors()) {
            model.addAttribute("errores", result.getFieldErrors());
            return "registros/registro_cliente"; // vuelve al formulario con los errores
        }

        if (usuarioService.documentoYaExistente(clienteDTO.getNumDocumento())) {
            model.addAttribute("error", "El número de documento ya está registrado");
            return "registros/registro_cliente";
        }


        try {
            // Enviar correo de bienvenida
            emailService.enviarCorreoBienvenida(
                    clienteDTO.getCorreo(),
                    clienteDTO.getNombre()
            );
            clienteService.registrarCliente(clienteDTO);
            model.addAttribute("mensaje", "Cliente registrado exitosamente");
            return "redirect:/iniciar_sesion";
        } catch (Exception e) {
            model.addAttribute("error", "Error al registrar cliente: " + e.getMessage());
            return "registros/registro_cliente";
        }
    }


}
