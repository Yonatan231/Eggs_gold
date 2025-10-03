package com.sena.eggs_gold.service.impl;

import com.sena.eggs_gold.dto.InventarioDetalleDTO;
import com.sena.eggs_gold.dto.InventarioRequestDTO;
import com.sena.eggs_gold.dto.ProductoDisponibleDTO;
import com.sena.eggs_gold.model.entity.Inventario;
import com.sena.eggs_gold.model.entity.Producto;
import com.sena.eggs_gold.model.entity.Usuario;
import com.sena.eggs_gold.repository.InventarioRepository;
import com.sena.eggs_gold.repository.PedidoRepository;
import com.sena.eggs_gold.repository.ProductoRepository;
import com.sena.eggs_gold.repository.UsuarioRepository;
import com.sena.eggs_gold.service.InventarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventarioServiceImpl implements InventarioService {
    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    PedidoRepository pedidoRepository;

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
        // Llamada al repositorio que hace el INNER JOIN y filtra cantidad > 0
        return inventarioRepository.ProductosDisponiblesEnStock();
    }





    public void agregarInventario(InventarioRequestDTO dto) {
        Producto producto = productoRepository.findById(dto.getIdProducto())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        Inventario inventario = new Inventario();
        inventario.setProducto(producto);
        inventario.setCantidadDisponible(dto.getCantidadDisponible());
        inventario.setUbicacion(dto.getUbicacion());
        inventario.setFechaCaducidad(dto.getFechaCaducidad());
        inventario.setFechaActualizacion(LocalDateTime.now());

        inventarioRepository.save(inventario);

    }

    @Override
    public List<InventarioDetalleDTO> obtenerInventarioDetallado() {
        List<Inventario> inventarios = inventarioRepository.findAll();

        return inventarios.stream().map(inventario -> {
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
            dto.setEstado(inventario.getProducto().getEstado().name());
            dto.setImagen(inventario.getProducto().getImagen());

            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public Inventario obtenerPorId(Integer id) {
        return inventarioRepository.findById(id).orElse(null);
    }

    @Override
    public boolean actualizarInventario(Inventario inventario) {
        if (!inventarioRepository.existsById(inventario.getIdInventario())) return false;

        inventario.setFechaActualizacion(LocalDateTime.now());
        inventarioRepository.save(inventario);
        return true;
    }

}

