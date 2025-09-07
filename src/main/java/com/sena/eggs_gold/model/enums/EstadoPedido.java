package com.sena.eggs_gold.model.enums;

/**
 * Enum para estado del pedido
 */
public enum EstadoPedido {
    RECHAZADO("Pedido Rechazado"),
    APROBADO("Pedido Aprobado"),
    PENDIENTE("Pedido Pendiente");

    private final String descripcion;

    EstadoPedido(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}