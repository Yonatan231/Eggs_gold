package com.sena.eggs_gold.service;

import com.sena.eggs_gold.dto.PedidoDTO;
import com.sena.eggs_gold.model.entity.Pedido;
import com.sena.eggs_gold.model.entity.Usuario;

import java.util.List;

public interface PedidoService {

    Pedido crearPedidoDesdeCarrito(Integer idUsuario, PedidoDTO pedidoDTO);

    boolean validarStockDisponible(Integer idUsuario);

    void marcarPedidoComoListo(Integer idPedido);

    void asignarConductor(Integer idPedido, Integer idConductor);

    List<Usuario> obtenerConductoresDisponibles();
}