package com.sena.eggs_gold.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventarioDetalleDTO {

    private Integer idInventario;
    private Integer cantidadDisponible;
    private String ubicacion;
    private LocalDate fechaCaducidad;
    private LocalDate fechaActualizacion;

    private String nombre;
    private Float precio;
    private String categoria;
    private String descripcion;
    private String imagen;
}