package com.sena.eggs_gold.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ConductorPedidosDTO {
    private Integer idConductor;
    private String nombre;
    private String apellido;
    private String numDocumento;
    private String direccionUsuario;
    private String telefono;
    private Long pedidosEntregados;
}
