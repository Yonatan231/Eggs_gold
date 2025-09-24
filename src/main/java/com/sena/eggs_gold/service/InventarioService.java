package com.sena.eggs_gold.service;

import com.sena.eggs_gold.dto.ProductoDisponibleDTO;
import com.sena.eggs_gold.model.entity.Inventario;

import java.util.List;

public interface InventarioService {
    List<ProductoDisponibleDTO> ListaProductoDisponible();
    List<ProductoDisponibleDTO> obtenerProductosDisponibles();
}
