package com.sena.eggs_gold.dto;

import com.sena.eggs_gold.model.enums.EstadoPedido;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PedidoConductorDTO {
    private Integer idPedidos;
    private String nombreCliente;
    private String apellidoCliente;
    private String telefono;
    private String direccion;
    private EstadoPedido estado;
    private String productos;
}
