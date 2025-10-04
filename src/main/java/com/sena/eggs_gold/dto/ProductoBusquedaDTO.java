package com.sena.eggs_gold.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductoBusquedaDTO {
    private Integer idProducto;
    private String nombre;
    private Double precio;
    private String categoria;
    private String descripcion;
    private String estado;
    private String imagen;
    private Integer cantidadDisponible;
}
