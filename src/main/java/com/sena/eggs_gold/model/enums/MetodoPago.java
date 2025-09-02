package com.sena.eggs_gold.model.enums;

/**
 * Enum para método de pago de la venta
 */
public enum MetodoPago {
    TRANSFERENCIA("Transferencia Bancaria"),
    EFECTIVO("Pago en Efectivo");

    private final String descripcion;

    MetodoPago(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}