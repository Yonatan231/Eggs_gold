package com.sena.eggs_gold.dto;

import lombok.Data;

@Data
public class ProductoUpdateDTO {
    private Integer id;
    private String nombre;
    private Float precio;
    private String categoria;
    private String descripcion;
    private String estado;
    private Integer cantidad;
    private String ubicacion;
}
