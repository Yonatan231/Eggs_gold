package com.sena.eggs_gold.service;

import com.sena.eggs_gold.dto.PedidoDTO;
import com.sena.eggs_gold.model.entity.Pedido;

public interface PedidoService {

    // Crear pedido desde el carrito
    Pedido crearPedidoDesdeCarrito(Integer idUsuario, PedidoDTO pedidoDTO);

    // Validar stock antes de confirmar
    boolean validarStockDisponible(Integer idUsuario);
}