package com.sena.eggs_gold.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CarritoDTO {
    private Integer id;
    private Integer idProducto;
    private String nombreProducto;
    private String imagenProducto;
    private Float precioUnitario;
    private Integer cantidad;
    private Float subtotal;
}