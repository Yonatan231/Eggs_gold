package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.repository.UsuarioRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import com.sena.eggs_gold.dto.ClienteRegistroDTO;
import com.sena.eggs_gold.model.entity.Usuario;
import com.sena.eggs_gold.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@Controller
public class UsuarioController {
    private UsuarioRepository usuarioRepository;

    public void registrarUsuario(Usuario nuevoUsuario) {
        if (usuarioRepository.existsByNumDocumento(nuevoUsuario.getNumDocumento())) {
            throw new IllegalArgumentException("El documento ya está registrado.");
        }
        usuarioRepository.save(nuevoUsuario);
    }

}



