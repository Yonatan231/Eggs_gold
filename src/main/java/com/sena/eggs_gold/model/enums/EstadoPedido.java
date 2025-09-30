package com.sena.eggs_gold.model.enums;

/**
 * Enum para estado del pedido
 */
public enum EstadoPedido {
    RECHAZADO("Rechazado"),
    APROBADO("Aprobado"),
    PENDIENTE("Pendiente"),
    ENTREGADO("Entregado"),
    EN_CAMINO("En_camino");

    private final String descripcion;

    EstadoPedido(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}