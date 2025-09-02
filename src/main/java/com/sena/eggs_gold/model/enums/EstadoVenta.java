package com.sena.eggs_gold.model.enums;

/**
 * Enum para estado de la venta
 */
public enum EstadoVenta {
    CANCELADA("Venta Cancelada"),
    PENDIENTE("Venta Pendiente");

    private final String descripcion;

    EstadoVenta(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}