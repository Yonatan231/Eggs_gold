package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.model.enums.EstadoPedido;
import com.sena.eggs_gold.repository.PedidoRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Controlador REST para el panel de conductor
 * Proporciona endpoints para obtener datos en formato JSON
 */
@RestController
@RequestMapping("/api/conductor")
public class ConductorRestController {

    private final PedidoRepository pedidoRepository;

    public ConductorRestController(PedidoRepository pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }

    /**
     * Obtiene datos para las tarjetas de resumen del dashboard de conductor
     * - Pedidos asignados (estado ASIGNADO)
     * - Pedidos pendientes (estado EN_CAMINO)
     */
    @GetMapping("/dashboard/resumen")
    public ResponseEntity<Map<String, Object>> obtenerResumenDashboard(HttpSession session) {
        Map<String, Object> resumen = new HashMap<>();

        try {
            Integer idConductor = (Integer) session.getAttribute("usuario_id");

            if (idConductor == null) {
                resumen.put("error", "Sesión no válida");
                return ResponseEntity.status(401).body(resumen);
            }

            // 1. Contar pedidos asignados (estado ASIGNADO)
            long pedidosAsignados = pedidoRepository
                    .findByConductorIdUsuariosAndEstado(idConductor, EstadoPedido.ASIGNADO)
                    .size();
            resumen.put("pedidosAsignados", pedidosAsignados);

            // 2. Contar pedidos pendientes (estado EN_CAMINO)
            long pedidosPendientes = pedidoRepository
                    .findByConductorIdUsuariosAndEstado(idConductor, EstadoPedido.EN_CAMINO)
                    .size();
            resumen.put("pedidosPendientes", pedidosPendientes);

            return ResponseEntity.ok(resumen);

        } catch (Exception e) {
            resumen.put("error", "Error al cargar dashboard: " + e.getMessage());
            return ResponseEntity.status(500).body(resumen);
        }
    }
}