package com.sena.eggs_gold.model.enums;

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
