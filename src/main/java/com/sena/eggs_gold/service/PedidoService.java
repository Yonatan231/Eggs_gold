package com.sena.eggs_gold.service;

import com.sena.eggs_gold.dto.PedidoDTO;
import com.sena.eggs_gold.model.enums.EstadoPedido;

import java.util.List;

public interface PedidoService {
    List<PedidoDTO> obtenerPedidosPorRol(String rol, EstadoPedido estado);
}
