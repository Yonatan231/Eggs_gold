package com.sena.eggs_gold.service;

import com.sena.eggs_gold.dto.LogisticaDTO;


public interface LogisticaService {
    LogisticaDTO login(String numDocumento, String password);
    void registrarLogistica(LogisticaDTO dto);
}
