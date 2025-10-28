package com.sena.eggs_gold.model.enums;

/**
 * Enum para categoría del producto
 */
public enum Categoria {
    AAA("Categoria AAA - Premium"),
    AA("Categoria AA - Alta"),
    A("Categoria A - Estándar");

    private final String descripcion;

    Categoria(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
