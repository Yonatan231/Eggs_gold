package com.sena.eggs_gold.dto;

import com.sena.eggs_gold.model.enums.Categoria;
import com.sena.eggs_gold.model.enums.EstadoProducto;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductoDTO {

    private Integer idProducto;
    private String nombre;
    private Float precio;
    private Categoria categoria;
    private Integer cantidad;
    private String descripcion;
    private String imagen;
    private EstadoProducto estado;
}