package com.sena.eggs_gold.service;

import com.sena.eggs_gold.dto.PedidoDTO;
import com.sena.eggs_gold.model.entity.Pedido;
import com.sena.eggs_gold.model.entity.Usuario;

import java.util.List;

public interface PedidoService {

    // Crear pedido desde el carrito
    Pedido crearPedidoDesdeCarrito(Integer idUsuario, PedidoDTO pedidoDTO);

    // Validar stock antes de confirmar
    boolean validarStockDisponible(Integer idUsuario);

    // ✅ NUEVO: Cambiar estado a LISTO
    void marcarPedidoComoListo(Integer idPedido);

    // ✅ NUEVO: Asignar conductor al pedido
    void asignarConductor(Integer idPedido, Integer idConductor);

    // ✅ NUEVO: Obtener conductores disponibles
    List<Usuario> obtenerConductoresDisponibles();
}