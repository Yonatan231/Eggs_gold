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

    @GetMapping("/dashboard/resumen")
    public ResponseEntity<Map<String, Object>> obtenerResumenDashboard() {
        Map<String, Object> resumen = new HashMap<>();

        long pedidosNuevos = pedidoRepository.findByEstado(EstadoPedido.PENDIENTE).size();
        resumen.put("pedidosNuevos", pedidosNuevos);

        long entradasPendientes = entradaStockRepository.findByEstado(EstadoEntradaStock.PENDIENTE).size();
        resumen.put("entradasPendientes", entradasPendientes);

        return ResponseEntity.ok(resumen);
    }
}