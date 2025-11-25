package com.sena.eggs_gold.service;

import com.sena.eggs_gold.dto.VehiculoDTO;
import com.sena.eggs_gold.dto.VehiculoResponseDTO;

import java.util.List;

public interface VehiculoService {

    // Registrar un nuevo vehículo - retorna DTO
    VehiculoResponseDTO registrarVehiculo(VehiculoDTO dto, Integer idConductor);

    // Listar todos los vehículos de un conductor - retorna DTOs
    List<VehiculoResponseDTO> listarVehiculosPorConductor(Integer idConductor);

    // Actualizar un vehículo existente - retorna DTO
    VehiculoResponseDTO actualizarVehiculo(Integer idVehiculo, VehiculoDTO dto, Integer idConductor);

    // Buscar un vehículo por ID - retorna DTO
    VehiculoResponseDTO buscarPorId(Integer idVehiculo);

    // Cambiar el estado de un vehículo (activar/inactivar) - retorna DTO
    // Si se activa uno, los demás se desactivan automáticamente
    VehiculoResponseDTO cambiarEstado(Integer idVehiculo, Integer idConductor);
}