package com.sena.eggs_gold.dto;


import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@AllArgsConstructor
public class InventarioRequestDTO {
    private Integer idProducto;
    private Integer cantidadDisponible;
    private String ubicacion;
    private LocalDate fechaCaducidad;
    private LocalDateTime fechaActualizacion;
}
