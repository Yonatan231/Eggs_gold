package com.sena.eggs_gold.service;

import com.sena.eggs_gold.dto.VehiculoDTO;
import com.sena.eggs_gold.dto.VehiculoResponseDTO;

import java.util.List;

public interface VehiculoService {

    VehiculoResponseDTO registrarVehiculo(VehiculoDTO dto, Integer idConductor);

    List<VehiculoResponseDTO> listarVehiculosPorConductor(Integer idConductor);

    VehiculoResponseDTO actualizarVehiculo(Integer idVehiculo, VehiculoDTO dto, Integer idConductor);

    VehiculoResponseDTO buscarPorId(Integer idVehiculo);

    VehiculoResponseDTO cambiarEstado(Integer idVehiculo, Integer idConductor);
}