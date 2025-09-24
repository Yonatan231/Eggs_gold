package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.dto.LogisticaDTO;
import com.sena.eggs_gold.service.LogisticaService;
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

    // Mostrar formulario de registro
    @GetMapping("/registro_logistica")
    public String mostrarFormulario(Model model, HttpSession session) {
        // Validar que el rol sea ADMIN
        String rol = (String) session.getAttribute("rol");
        if (rol == null || !rol.equals("ADMIN")) {
            return "redirect:/acceso_denegado"; // vista para acceso restringido
        }

        model.addAttribute("logistica", new LogisticaDTO());
        return "registro_logistica"; // busca registro_logistica.html en templates/
    }

    // Procesar el formulario de registro
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
            logisticaService.registrarLogistica(logisticaDTO);
            model.addAttribute("mensaje", "Logística registrada con éxito.");
        } catch (Exception e) {
            model.addAttribute("error", "Error al registrar logística: " + e.getMessage());
            return "registro_logistica";
        }

        return "redirect:/admin"; // o la vista que quieras después del registro
    }
}


