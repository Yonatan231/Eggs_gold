package com.sena.eggs_gold.service;

import com.sena.eggs_gold.dto.PedidoBusquedaDTO;
import com.sena.eggs_gold.dto.PedidoDTO;
import com.sena.eggs_gold.model.entity.Pedido;
import com.sena.eggs_gold.model.enums.EstadoPedido;

import java.util.List;

public interface PedidoService {
    List<PedidoDTO> obtenerPedidosPorRol(String rol, EstadoPedido estado);
    boolean aprobarPedido(Integer idPedido);
    boolean actualizarEstado(Integer idPedido, EstadoPedido nuevoEstado);
    boolean asignarPedido(Integer pedidoId, Integer conductorId);
    List<PedidoBusquedaDTO> buscarPedidos(String buscar);


}
