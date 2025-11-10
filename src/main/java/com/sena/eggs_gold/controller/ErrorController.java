package com.sena.eggs_gold.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Controller para manejar páginas de error personalizadas
 */
@Controller
@RequestMapping("/error")
public class ErrorController {

    /**
     * Página de error 403 - Acceso Denegado
     */
    @GetMapping("/403")
    public String error403() {
        return "error/403";
    }

    /**
     * Página de error 404 - No encontrado
     */
    @GetMapping("/404")
    public String error404() {
        return "error/404";
    }

    /**
     * Página de error 500 - Error del servidor
     */
    @GetMapping("/500")
    public String error500() {
        return "error/500";
    }
}