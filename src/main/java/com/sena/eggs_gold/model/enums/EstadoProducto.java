package com.sena.eggs_gold.model.enums;

/**
 * Enum para estado del producto
 */
public enum EstadoProducto {
    DISPONIBLE("Disponible"),
    DESCONTINUADO("Descontinuado"),
    AGOTADO("Agotado");


    private final String descripcion;

    EstadoProducto(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}