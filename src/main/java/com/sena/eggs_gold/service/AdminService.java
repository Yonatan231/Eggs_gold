package com.sena.eggs_gold.service;

import com.sena.eggs_gold.dto.AdminDTO;
import com.sena.eggs_gold.model.enums.EstadoUsuario;


public interface AdminService {
    AdminDTO login(String documento, String password);

    void cambiarEstadoUsuario(Integer idUsuario, EstadoUsuario nuevoEstado);
}