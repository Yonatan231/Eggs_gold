package com.sena.eggs_gold.service.impl;

import com.sena.eggs_gold.model.Usuario;
import com.sena.eggs_gold.repository.UsuarioRepository;
import com.sena.eggs_gold.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;

@Controller
public class UsuarioServiceimpl implements UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;


    @Override
    public Usuario guardarUsuario(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }
}
