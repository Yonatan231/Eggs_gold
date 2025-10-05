package com.sena.eggs_gold.repository;

import com.sena.eggs_gold.dto.PedidoConductorHistorialDTO;

import java.util.List;

public interface PedidoRepositoryHistorial {
    List<PedidoConductorHistorialDTO> buscarPedidosPorConductor(Integer conductorId);
}
