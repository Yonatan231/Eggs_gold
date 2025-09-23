package com.sena.eggs_gold.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class PedidoDTO {

    private Integer idPedidos;
    private String nombreUsuario;
    private List<String> productos; // Lista de productos con cantidades
    private String direccion;
    private String estado;
    private LocalDateTime fechaCreacion;
    private BigDecimal total;


}
