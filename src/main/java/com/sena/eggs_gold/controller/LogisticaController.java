package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.dto.LogisticaDTO;
import com.sena.eggs_gold.service.LogisticaService;
import com.sena.eggs_gold.service.EmailService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class LogisticaController {

    @Autowired
    private LogisticaService logisticaService;

    @Autowired
    private EmailService emailService;

    // Mostrar formulario de registro de logística
    @GetMapping("/registrar_logistica")
    public String mostrarFormulario(Model model, HttpSession session) {
        // Validar que el rol sea ADMIN
        String rol = (String) session.getAttribute("rol");
        if (rol == null || !rol.equals("ADMIN")) {
            return "redirect:/acceso_denegado";
        }

        model.addAttribute("logistica", new LogisticaDTO());
        return "registros/registro_logistica";
    }

    // Procesar el formulario
    @PostMapping("/registro_logistica")
    public String registrarLogistica(@ModelAttribute("logistica") LogisticaDTO logisticaDTO,
                                     HttpSession session,
                                     Model model) {
        // Validar que el rol sea ADMIN
        String rol = (String) session.getAttribute("rol");
        if (rol == null || !rol.equals("ADMIN")) {
            return "redirect:/acceso_denegado";
        }

        try {
            // Guardar en la base de datos
            logisticaService.registrarLogistica(logisticaDTO);

            // Enviar correo de bienvenida
            emailService.enviarCorreoBienvenida(
                    logisticaDTO.getCorreo(),
                    logisticaDTO.getNombre()
            );

            model.addAttribute("mensaje", "Logística registrada con éxito y correo enviado.");
        } catch (Exception e) {
            model.addAttribute("error", "Error al registrar logística: " + e.getMessage());
            return "registros/registro_logistica";
        }

        return "redirect:/administrador";
    }
}