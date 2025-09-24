package com.sena.eggs_gold.service;

import com.sena.eggs_gold.dto.LogisticaDTO;

public interface LogisticaService {

    // Solo el admin puede registrar logística
    void registrarLogistica(LogisticaDTO dto);

    // Para login de logística
    LogisticaDTO login(String numDocumento, String password);
}
