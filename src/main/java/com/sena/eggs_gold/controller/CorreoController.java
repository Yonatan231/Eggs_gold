package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.repository.UsuarioRepository;
import com.sena.eggs_gold.repository.RolRepository;
import com.sena.eggs_gold.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Controller
@RequestMapping("/correos")
public class CorreoController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private EmailService emailService;

    @GetMapping
    public String mostrarFormulario(Model model) {
        model.addAttribute("roles", rolRepository.findAll());
        return "administrador/correo_admin";
    }

    @PostMapping("/enviar")
    public String enviarCorreosForm(@RequestParam(required = false) List<Integer> rolIds,
                                    @RequestParam(required = false) String emails,
                                    @RequestParam String asunto,
                                    @RequestParam String mensaje,
                                    Model model) {
        try {
            List<String> destinatarios = new ArrayList<>();

            if (rolIds != null && !rolIds.isEmpty()) {
                destinatarios.addAll(usuarioRepository.findEmailsByRolIds(rolIds));
            }

            if (emails != null && !emails.isEmpty()) {
                destinatarios.addAll(Arrays.asList(emails.split(",")));
            }

            if (destinatarios.isEmpty()) {
                model.addAttribute("error", " No se encontraron correos para los roles seleccionados.");
                model.addAttribute("roles", rolRepository.findAll());
                return "administrador/correo_admin";
            }

            emailService.enviarCorreosMasivos(destinatarios, asunto, mensaje);
            model.addAttribute("success", " Correos enviados exitosamente a " + destinatarios.size() + " destinatarios.");
        } catch (Exception e) {
            String mensajeError = e.getMessage();
            if (mensajeError != null && mensajeError.contains("AuthenticationFailedException")) {
                model.addAttribute("error", " Error de autenticación: revisa tu usuario o contraseña SMTP.");
            } else {
                model.addAttribute("error", " Error al enviar correos: " + mensajeError);
            }
        }

        model.addAttribute("roles", rolRepository.findAll());
        return "administrador/correo_admin";
    }

    @ResponseBody
    @PostMapping("/api/enviar")
    public ResponseEntity<?> enviarCorreosAjax(@RequestBody Map<String, Object> datos) {
        try {
            List<Integer> rolIds = (List<Integer>) datos.get("rolIds");
            String asunto = (String) datos.get("asunto");
            String mensaje = (String) datos.get("mensaje");

            List<String> destinatarios = new ArrayList<>();

            if (rolIds != null && !rolIds.isEmpty()) {
                destinatarios.addAll(usuarioRepository.findEmailsByRolIds(rolIds));
            }

            if (destinatarios.isEmpty()) {
                return ResponseEntity.badRequest().body(" No se encontraron destinatarios para los roles seleccionados.");
            }

            emailService.enviarCorreosMasivos(destinatarios, asunto, mensaje);
            return ResponseEntity.ok(" Correos enviados a " + destinatarios.size() + " usuarios.");
        } catch (Exception e) {
            String mensajeError = e.getMessage();
            if (mensajeError != null && mensajeError.contains("AuthenticationFailedException")) {
                return ResponseEntity.status(401).body(" Error de autenticación SMTP: revisa usuario y contraseña.");
            }
            return ResponseEntity.status(500).body(" Error al enviar correos: " + mensajeError);
        }
    }
}
