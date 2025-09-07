package com.sena.eggs_gold.model.enums;

/**
 * Enum para estado del usuario
 */
public enum Estado {
    ACTIVO("Activo"),
    INACTIVO("Inactivo");

    private final String descripcion;

    Estado(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
