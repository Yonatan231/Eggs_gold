package com.sena.eggs_gold.service;

import com.sena.eggs_gold.dto.EntradaStockDTO;
import com.sena.eggs_gold.model.entity.EntradaStock;

import java.util.List;

public interface EntradaStockService {

    // Registrar nueva entrada de stock
    EntradaStock registrarEntrada(Integer idProducto, Integer cantidad, String proveedor);

    // Listar todas las entradas
    List<EntradaStockDTO> listarTodasLasEntradas();

    // Listar solo entradas pendientes (para logística)
    List<EntradaStockDTO> listarEntradasPendientes();

    // ✅ MODIFICADO: Aprobar entrada con parámetros adicionales
    boolean aprobarEntrada(Integer idEntrada, Integer idLogistica, Integer cantidadFinal, String observacion);
}