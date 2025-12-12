package com.sena.eggs_gold.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventarioVistaDTO {

    private Integer idProducto;
    private String nombre;
    private Float precio;
    private String categoria;
    private String descripcion;
    private String estado;
    private String imagen;

    private Integer cantidadDisponible;
    private LocalDate fechaActualizacion;
}
