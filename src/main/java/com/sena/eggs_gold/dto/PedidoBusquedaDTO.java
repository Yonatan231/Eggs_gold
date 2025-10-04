package com.sena.eggs_gold.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PedidoBusquedaDTO {
    private Integer idPedidos;
    private String nombreUsuario;
    private String nombreProducto;
    private Double precio;
    private Integer cantidad;
    private String direccion;
    private String estado;
    private LocalDateTime fechaCreacion;
    private Double total;
}
