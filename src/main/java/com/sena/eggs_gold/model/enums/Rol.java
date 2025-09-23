package com.sena.eggs_gold.model.enums;

public enum Rol {
    ADMIN(1),
    CLIENTE(4),
    LOGISTICA(2),
    CONDUCTOR(3);

    private final int codigo;

    Rol(int codigo) {
        this.codigo = codigo;
    }

    public int getCodigo() {
        return codigo;
    }

    // Método para obtener enum por código
    public static Rol fromCodigo(int codigo) {
        for (Rol r : values()) {
            if (r.codigo == codigo) return r;
        }
        throw new IllegalArgumentException("Código de rol inválido: " + codigo);
    }
}
