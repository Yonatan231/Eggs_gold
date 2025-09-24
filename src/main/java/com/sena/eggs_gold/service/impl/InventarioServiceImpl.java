package com.sena.eggs_gold.service.impl;

import com.sena.eggs_gold.dto.ProductoDisponibleDTO;
import com.sena.eggs_gold.model.entity.Inventario;
import com.sena.eggs_gold.repository.InventarioRepository;
import com.sena.eggs_gold.service.InventarioService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InventarioServiceImpl implements InventarioService {
    private final InventarioRepository inventarioRepository;
    public InventarioServiceImpl(InventarioRepository inventarioRepository) {
        this.inventarioRepository = inventarioRepository;
    }

    @Override
    public List<ProductoDisponibleDTO> ListaProductoDisponible() {
        return inventarioRepository.ProductosDisponiblesEnStock();
    }

    @Override
    public List<ProductoDisponibleDTO> obtenerProductosDisponibles() {
        // Llamada al repositorio que hace el INNER JOIN y filtra cantidad > 0
        return inventarioRepository.ProductosDisponiblesEnStock();
    }
}
