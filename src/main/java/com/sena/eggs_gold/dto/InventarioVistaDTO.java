package com.sena.eggs_gold.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventarioVistaDTO {

    // ID del Producto (para identificar y editar)
    private Integer idProducto;

    // Datos del producto
    private String nombre;
    private Float precio;
    private String categoria;
    private String descripcion;
    private String estado;
    private String imagen;

    // Datos del inventario
    private Integer cantidadDisponible;
    private LocalDate fechaActualizacion;
}
