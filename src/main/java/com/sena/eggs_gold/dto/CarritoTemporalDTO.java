package com.sena.eggs_gold.dto;

import lombok.Data;

@Data
public class CarritoTemporalDTO {
    private Integer id;
    private Integer producto;
    private Integer cantidad;
    private String nombre;
    private Float precio;

    public CarritoTemporalDTO(Integer id, Integer producto, Integer cantidad, String nombre, Float precio) {
        this.id = id;
        this.producto = producto;
        this.cantidad = cantidad;
        this.nombre = nombre;
        this.precio = precio;
    }

    // Getters y setters
}
