package com.sena.eggs_gold.service.impl;

import com.sena.eggs_gold.dto.ClienteRegistroDTO;
import com.sena.eggs_gold.model.entity.Rol;
import com.sena.eggs_gold.model.entity.Usuario;
import com.sena.eggs_gold.repository.RolRepository;
import com.sena.eggs_gold.repository.UsuarioRepository;
import com.sena.eggs_gold.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;


    public UsuarioServiceImpl(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }
    @Override
    public boolean documentoYaExistente(String numDocumento) {
        return usuarioRepository.existsByNumDocumento(numDocumento);
    }
}
