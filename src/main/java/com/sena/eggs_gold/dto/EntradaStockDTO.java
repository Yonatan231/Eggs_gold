package com.sena.eggs_gold.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EntradaStockDTO {
    private Integer id;
    private Integer idProducto;
    private String nombreProducto;
    private Integer cantidad;
    private String proveedor;
    private String fechaRegistro;
    private String estado;
    private String observacion;
}
