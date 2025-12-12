package com.sena.eggs_gold.service;

import com.sena.eggs_gold.dto.LogisticaDTO;

import java.util.List;
import java.util.Map;

public interface LogisticaService {
    LogisticaDTO login(String numDocumento, String password);
    void registrarLogistica(LogisticaDTO dto);

    List<Map<String, Object>> obtenerPedidosPendientes();
    void tomarPedido(Integer idPedido, Integer idLogistica);
    List<Map<String, Object>> obtenerPedidosEnAlistamiento(Integer idLogistica);
    Map<String, Object> obtenerDetallesPedido(Integer idPedido);
    void marcarPedidoListo(Integer idPedido);
}