package com.sena.eggs_gold.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class InventarioDetalleDTO {
    private Integer idInventario;
    private Integer cantidadDisponible;
    private String ubicacion;
    private LocalDate fechaCaducidad;
    private LocalDateTime fechaActualizacion;

    // Datos del producto
    private String nombre;
    private Float precio;
    private String categoria;
    private String descripcion;
    private String estado;
    private String imagen;
}
