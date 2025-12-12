package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.service.UsuarioService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
public class RecuperacionPasswordController {

    private final UsuarioService usuarioService;

    public RecuperacionPasswordController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/solicitar-recuperacion")
    @ResponseBody
    public String solicitarRecuperacion(@RequestParam String correo) {
        usuarioService.solicitarRecuperacionContrasena(correo);

        return "Si existe una cuenta con este correo, recibiras un enlace para restablecer tu contrasena.";
    }

    @GetMapping("/reset-password")
    public String mostrarFormularioReset(@RequestParam String token, Model model) {
        boolean tokenValido = usuarioService.validarToken(token);

        if (tokenValido) {
            model.addAttribute("token", token);
            return "iniciar_sesion/restablecer_password";
        } else {
            model.addAttribute("error", "El enlace ha expirado o es invalido");
            return "iniciar_sesion/token_invalido";
        }
    }

    @PostMapping("/actualizar-password")
    @ResponseBody
    public String actualizarPassword(
            @RequestParam String token,
            @RequestParam String nuevaContrasena) {

        try {
            usuarioService.actualizarContrasena(token, nuevaContrasena);
            return "exito";
        } catch (Exception e) {
            return "error: " + e.getMessage();
        }
    }
}