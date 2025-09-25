package com.sena.eggs_gold.service;

import com.sena.eggs_gold.dto.VehiculoDTO;
import com.sena.eggs_gold.model.entity.Vehiculo;

public interface VehiculoService {
    Vehiculo registrarVehiculo(VehiculoDTO dto, Integer idConductor);
}

