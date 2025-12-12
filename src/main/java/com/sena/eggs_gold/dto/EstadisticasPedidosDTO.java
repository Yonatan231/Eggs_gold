package com.sena.eggs_gold.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EstadisticasPedidosDTO {

    private Long totalPedidos;

    private Map<String, Long> pedidosPorEstado;

    private Map<String, Long> pedidosPorMetodoPago;

    private Map<String, BigDecimal> ventasPorMes;

    private Map<String, Long> crecimientoPorMes;
}