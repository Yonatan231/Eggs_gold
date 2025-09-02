package com.sena.eggs_gold.controller;

import org.springframework.ui.Model;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import com.sena.eggs_gold.model.entity.Usuario;
import com.sena.eggs_gold.service.UsuarioService;

@Controller
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService; // ✅ Mejor usar camelCase para variables

    @GetMapping("/registro")
    public String mostrarFormulario(Model model){
        model.addAttribute("usuario", new Usuario());
        return "registro";
    }

    @PostMapping("/registro")
    public String registrarUsuario(@ModelAttribute Usuario usuario, Model model){
        usuarioService.guardarUsuario(usuario);

        model.addAttribute("mensaje", "Usuario registrado correctamente");
        return "inicio";
    }
}