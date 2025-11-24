package com.sena.eggs_gold.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

/**
 * DTO que contiene todas las estadísticas de pedidos
 * para generar el reporte en PDF
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EstadisticasPedidosDTO {

    // Total de pedidos en el sistema
    private Long totalPedidos;

    // Pedidos por estado: Map<estado, cantidad>
    // Ejemplo: {"PENDIENTE": 10, "EN_ALISTAMIENTO": 5, "ENTREGADO": 50}
    private Map<String, Long> pedidosPorEstado;

    // Pedidos por método de pago: Map<metodoPago, cantidad>
    // Ejemplo: {"VISA": 30, "NEQUI": 25}
    private Map<String, Long> pedidosPorMetodoPago;

    // Ventas totales por mes: Map<mes, totalVentas>
    // Ejemplo: {"2024-01": 1500000, "2024-02": 2000000}
    private Map<String, BigDecimal> ventasPorMes;

    // Crecimiento de pedidos por mes: Map<mes, cantidad>
    // Ejemplo: {"2024-01": 20, "2024-02": 35, "2024-03": 42}
    private Map<String, Long> crecimientoPorMes;
}