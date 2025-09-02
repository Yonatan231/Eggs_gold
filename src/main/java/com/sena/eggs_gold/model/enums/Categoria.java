package com.sena.eggs_gold.model.enums;

/**
 * Enum para categoría del producto
 */
public enum Categoria {
    AAA("Categoría AAA - Premium"),
    AA("Categoría AA - Alta"),
    A("Categoría A - Estándar");

    private final String descripcion;

    Categoria(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
