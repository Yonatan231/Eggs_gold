package com.sena.eggs_gold.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * DTO que contiene todas las estadísticas de usuarios
 * para generar el reporte en PDF
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EstadisticasUsuariosDTO {

    // Total de usuarios en el sistema
    private Long totalUsuarios;

    // Usuarios por rol: Map<nombreRol, cantidad>
    // Ejemplo: {"ADMIN": 2, "LOGISTICA": 5, "CONDUCTOR": 10, "CLIENTE": 150}
    private Map<String, Long> usuariosPorRol;

    // Usuarios por estado: Map<estado, cantidad>
    // Ejemplo: {"ACTIVO": 160, "INACTIVO": 7}
    private Map<String, Long> usuariosPorEstado;

    // Crecimiento de usuarios por mes: Map<mes, cantidad>
    // Ejemplo: {"2024-01": 20, "2024-02": 35, "2024-03": 42}
    private Map<String, Long> crecimientoPorMes;
}