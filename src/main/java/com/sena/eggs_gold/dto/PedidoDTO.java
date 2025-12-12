package com.sena.eggs_gold.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PedidoDTO {
    private String telefono;
    private String direccion;
    private String detalleCliente;
    private String metodoPago;
}