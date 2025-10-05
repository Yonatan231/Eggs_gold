package com.sena.eggs_gold.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventarioBusquedaDTO {
    private Integer idInventario;
    private String nombre;
    private BigDecimal precio;
    private String categoria;
    private String descripcion;
    private String estado;
    private Integer cantidadDisponible;
    private String ubicacion;
    private String imagen;
    private LocalDate fechaCaducidad;
    private LocalDateTime fechaActualizacion;
}

