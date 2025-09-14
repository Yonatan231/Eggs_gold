package com.sena.eggs_gold.dto;

import com.sena.eggs_gold.model.enums.Categoria;
import com.sena.eggs_gold.model.enums.EstadoProducto;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductoDisponibleDTO {

    private Integer idProducto;
    private String nombre;
    private Float precio;
    private Categoria categoria;
    private String descripcion;
    private EstadoProducto estado;
    private String imagen;
    private Integer cantidadDisponible;

    public ProductoDisponibleDTO(Integer idProducto,String nombre,Float precio,Categoria categoria,String descripcion,EstadoProducto estado,String imagen,Integer cantidadDisponible){
        this.idProducto=idProducto;
        this.nombre=nombre;
        this.precio=precio;
        this.categoria=categoria;
        this.descripcion=descripcion;
        this.estado=estado;
        this.imagen=imagen;
        this.cantidadDisponible=cantidadDisponible;

    }

}
