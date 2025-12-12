package com.sena.eggs_gold.service;

import com.sena.eggs_gold.dto.InventarioDetalleDTO;
import com.sena.eggs_gold.dto.ProductoDisponibleDTO;
import com.sena.eggs_gold.model.entity.Inventario;

import java.util.List;

public interface InventarioService {

    List<ProductoDisponibleDTO> ListaProductoDisponible();
    List<ProductoDisponibleDTO> obtenerProductosDisponibles();
    List<InventarioDetalleDTO> obtenerInventarioDetallado();
    Inventario obtenerPorId(Integer id);
    boolean actualizarInventario(Inventario inventario);

    Inventario crearInventarioDesdeEntrada(Integer idProducto, Integer cantidad, String ubicacion, String observacion);
}