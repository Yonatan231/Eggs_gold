package com.sena.eggs_gold.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DashboardStatsDTO {
    private long usuarios;
    private double ventas;
    private long productos;

}
