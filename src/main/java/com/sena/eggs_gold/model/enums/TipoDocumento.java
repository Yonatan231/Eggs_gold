package com.sena.eggs_gold.model.enums;

/**
 * Enum para tipos de documento de usuario
 */
public enum TipoDocumento {
    CC("Cédula de Ciudadanía"),
    CED("Cédula de Extranjería");

    private final String descripcion;

    TipoDocumento(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
