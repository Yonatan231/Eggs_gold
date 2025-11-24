package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.model.enums.EstadoEntradaStock;
import com.sena.eggs_gold.model.enums.EstadoPedido;
import com.sena.eggs_gold.repository.EntradaStockRepository;
import com.sena.eggs_gold.repository.PedidoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Controlador REST para el panel de logística
 * Proporciona endpoints para obtener datos en formato JSON
 */
@RestController
@RequestMapping("/api/logistica")
public class LogisticaRestController {

    private final PedidoRepository pedidoRepository;
    private final EntradaStockRepository entradaStockRepository;

    public LogisticaRestController(PedidoRepository pedidoRepository,
                                   EntradaStockRepository entradaStockRepository) {
        this.pedidoRepository = pedidoRepository;
        this.entradaStockRepository = entradaStockRepository;
    }

    /**
     * Obtiene datos para las tarjetas de resumen del dashboard de logística
     * - Pedidos nuevos (estado PENDIENTE)
     * - Entradas de stock pendientes de aprobación
     */
    @GetMapping("/dashboard/resumen")
    public ResponseEntity<Map<String, Object>> obtenerResumenDashboard() {
        Map<String, Object> resumen = new HashMap<>();

        // 1. Contar pedidos nuevos (estado PENDIENTE)
        long pedidosNuevos = pedidoRepository.findByEstado(EstadoPedido.PENDIENTE).size();
        resumen.put("pedidosNuevos", pedidosNuevos);

        // 2. Contar entradas de stock pendientes de aprobación
        long entradasPendientes = entradaStockRepository.findByEstado(EstadoEntradaStock.PENDIENTE).size();
        resumen.put("entradasPendientes", entradasPendientes);

        return ResponseEntity.ok(resumen);
    }
}