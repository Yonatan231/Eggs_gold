package com.sena.eggs_gold.service.impl;

import com.sena.eggs_gold.dto.InventarioDetalleDTO;
import com.sena.eggs_gold.dto.ProductoDisponibleDTO;
import com.sena.eggs_gold.model.entity.Inventario;
import com.sena.eggs_gold.model.entity.Producto;
import com.sena.eggs_gold.repository.InventarioRepository;
import com.sena.eggs_gold.repository.ProductoRepository;
import com.sena.eggs_gold.service.InventarioService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventarioServiceImpl implements InventarioService {

    @Autowired
    private ProductoRepository productoRepository;

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
        return inventarioRepository.ProductosDisponiblesEnStock();
    }

    @Override
    public List<InventarioDetalleDTO> obtenerInventarioDetallado() {
        List<Inventario> inventarios = inventarioRepository.findAll();

        return inventarios.stream()
                // Mostrar TODOS los inventarios sin importar la cantidad disponible
                .map(inventario -> {
                    InventarioDetalleDTO dto = new InventarioDetalleDTO();
                    dto.setIdInventario(inventario.getIdInventario());
                    dto.setCantidadDisponible(inventario.getCantidadDisponible());
                    dto.setUbicacion(inventario.getUbicacion());
                    dto.setFechaCaducidad(inventario.getFechaCaducidad());
                    dto.setFechaActualizacion(inventario.getFechaActualizacion());
                    // Datos del producto
                    dto.setNombre(inventario.getProducto().getNombre());
                    dto.setPrecio(inventario.getProducto().getPrecio());
                    dto.setCategoria(inventario.getProducto().getCategoria().name());
                    dto.setDescripcion(inventario.getProducto().getDescripcion());
                    dto.setImagen(inventario.getProducto().getImagen());

                    return dto;
                }).collect(Collectors.toList());
    }

    @Override
    public Inventario obtenerPorId(Integer id) {
        return inventarioRepository.findById(id).orElse(null);
    }

    @Override
    @Transactional
    public boolean actualizarInventario(Inventario inventario) {
        if (!inventarioRepository.existsById(inventario.getIdInventario())) return false;

        inventario.setFechaActualizacion(LocalDate.now());
        inventarioRepository.save(inventario);
        return true;
    }

    // ✅ NUEVO MÉTODO: Crear inventario desde entrada aprobada
    @Override
    @Transactional
    public Inventario crearInventarioDesdeEntrada(Integer idProducto, Integer cantidad, String ubicacion, String observacion) {
        // Buscar el producto
        Producto producto = productoRepository.findById(idProducto)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        // Crear nuevo registro de inventario
        Inventario inventario = new Inventario();
        inventario.setProducto(producto);
        inventario.setCantidadDisponible(cantidad);
        inventario.setUbicacion(ubicacion != null && !ubicacion.isEmpty() ? ubicacion : "Bodega Principal");
        inventario.setFechaCaducidad(LocalDate.now().plusMonths(6)); // 6 meses por defecto
        inventario.setFechaActualizacion(LocalDate.now());

        return inventarioRepository.save(inventario);
    }
}