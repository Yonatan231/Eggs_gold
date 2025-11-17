package com.sena.eggs_gold.service;

import com.sena.eggs_gold.dto.ClienteDTO;

import java.util.List;
import java.util.Map;

public interface ClienteService {
    void registrarCliente(ClienteDTO clienteDTO);
    ClienteDTO login(String documento, String password);

    // ✅ NUEVO: Obtener pedidos del cliente
    List<Map<String, Object>> obtenerMisPedidos(Integer idCliente);

    // ✅ NUEVO: Obtener factura de un pedido
    Map<String, Object> obtenerFacturaPorPedido(Integer idPedido, Integer idCliente);
}