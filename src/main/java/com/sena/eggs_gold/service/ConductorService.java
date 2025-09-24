package com.sena.eggs_gold.service;

import com.sena.eggs_gold.dto.ConductorDTO;

public interface ConductorService {

    // Solo logística puede registrar un conductor
    void registrarConductor(ConductorDTO dto);

    // Para login de conductor
    ConductorDTO login(String numDocumento, String password);
}


