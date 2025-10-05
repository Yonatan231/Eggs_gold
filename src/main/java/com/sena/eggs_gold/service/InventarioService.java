package com.sena.eggs_gold.service;

import com.sena.eggs_gold.dto.InventarioBusquedaDTO;
import com.sena.eggs_gold.dto.InventarioDetalleDTO;
import com.sena.eggs_gold.dto.InventarioRequestDTO;
import com.sena.eggs_gold.dto.ProductoDisponibleDTO;
import com.sena.eggs_gold.model.entity.Inventario;

import java.util.List;

public interface InventarioService {
    List<ProductoDisponibleDTO> ListaProductoDisponible();
    List<ProductoDisponibleDTO> obtenerProductosDisponibles();

    void agregarInventario(InventarioRequestDTO dto);
    List<InventarioDetalleDTO> obtenerInventarioDetallado();


    Inventario obtenerPorId(Integer id);
    boolean actualizarInventario(Inventario inventario);

    String eliminarInventario(Integer idInventario);
    List<InventarioBusquedaDTO> buscarInventario(String buscar);
}
