package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.service.UsuarioService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

/**
 * CONTROLADOR: RecuperacionPasswordController
 * Maneja todo el flujo de recuperacion de contrasena:
 * 1. Solicitud de recuperacion (envio de correo)
 * 2. Validacion de token desde el enlace
 * 3. Actualizacion de la contrasena
 */
@Controller
public class RecuperacionPasswordController {

    private final UsuarioService usuarioService;

    public RecuperacionPasswordController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    /**
     * ENDPOINT: Procesar solicitud de recuperacion de contrasena
     * Recibe el correo del usuario y envia un email con el enlace de recuperacion
     * Siempre retorna el mismo mensaje (por seguridad, no revelamos si el correo existe)
     */
    @PostMapping("/solicitar-recuperacion")
    @ResponseBody
    public String solicitarRecuperacion(@RequestParam String correo) {
        // Solicitar recuperacion (genera token y envia correo)
        usuarioService.solicitarRecuperacionContrasena(correo);

        // Retornar mensaje generico (por seguridad)
        return "Si existe una cuenta con este correo, recibiras un enlace para restablecer tu contrasena.";
    }

    /**
     * ENDPOINT: Mostrar formulario para restablecer contrasena
     * Se accede cuando el usuario hace clic en el enlace del correo
     * Valida que el token sea valido antes de mostrar el formulario
     */
    @GetMapping("/reset-password")
    public String mostrarFormularioReset(@RequestParam String token, Model model) {
        // Validar que el token sea valido
        boolean tokenValido = usuarioService.validarToken(token);

        if (tokenValido) {
            // Si el token es valido, mostrar formulario
            model.addAttribute("token", token);
            return "iniciar_sesion/restablecer_password";
        } else {
            // Si el token es invalido o expiro, mostrar mensaje de error
            model.addAttribute("error", "El enlace ha expirado o es invalido");
            return "iniciar_sesion/token_invalido";
        }
    }

    /**
     * ENDPOINT: Procesar actualizacion de contrasena
     * Recibe el token y la nueva contrasena, actualiza en la base de datos
     */
    @PostMapping("/actualizar-password")
    @ResponseBody
    public String actualizarPassword(
            @RequestParam String token,
            @RequestParam String nuevaContrasena) {

        try {
            // Actualizar contrasena
            usuarioService.actualizarContrasena(token, nuevaContrasena);
            return "exito";
        } catch (Exception e) {
            return "error: " + e.getMessage();
        }
    }
}