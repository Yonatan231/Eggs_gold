package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.dto.ConductorDTO;
import com.sena.eggs_gold.service.ConductorService;
import com.sena.eggs_gold.service.EmailService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class ConductorController {

    @Autowired
    private ConductorService conductorService;

    @Autowired
    private EmailService emailService;

    // Mostrar formulario de registro de conductor (solo logística)
    @GetMapping("/registro_conductor")
    public String mostrarFormulario(Model model, HttpSession session) {
        // Validar que el rol sea LOGISTICA
        String rol = (String) session.getAttribute("rol");
        if (rol == null || !rol.equals("LOGISTICA")) {
            return "redirect:/acceso_denegado"; // vista para acceso restringido
        }

        model.addAttribute("conductor", new ConductorDTO());
        return "registro_conductor"; // busca registro_conductor.html en templates/
    }

    // Procesar el formulario de registro
    @PostMapping("/registro_conductor")
    public String registrarConductor(@ModelAttribute("conductor") ConductorDTO conductorDTO,
                                     HttpSession session,
                                     Model model) {
        // Validar que el rol sea LOGISTICA
        String rol = (String) session.getAttribute("rol");
        if (rol == null || !rol.equals("LOGISTICA")) {
            return "redirect:/acceso_denegado";
        }

        try {
            // Guardar en BD
            conductorService.registrarConductor(conductorDTO);

            // Enviar correo de bienvenida
            emailService.enviarCorreoBienvenida(
                    conductorDTO.getCorreo(),   // correo del conductor
                    conductorDTO.getNombre()    // nombre para personalizar
            );

            model.addAttribute("mensaje", "Conductor registrado con éxito y correo enviado.");
        } catch (Exception e) {
            model.addAttribute("error", "El conductor se registró, pero hubo un problema: " + e.getMessage());
            return "registro_conductor";
        }

        // Redirige al panel logística
        return "redirect:/logistica";
    }
}

