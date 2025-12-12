package com.sena.eggs_gold.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EstadisticasUsuariosDTO {

    private Long totalUsuarios;

    private Map<String, Long> usuariosPorRol;

    private Map<String, Long> usuariosPorEstado;

    private Map<String, Long> crecimientoPorMes;
}