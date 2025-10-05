package com.sena.eggs_gold.service.impl;

import com.sena.eggs_gold.dto.InventarioBusquedaDTO;
import com.sena.eggs_gold.dto.InventarioDetalleDTO;
import com.sena.eggs_gold.dto.InventarioRequestDTO;
import com.sena.eggs_gold.dto.ProductoDisponibleDTO;
import com.sena.eggs_gold.model.entity.Inventario;
import com.sena.eggs_gold.model.entity.Producto;
import com.sena.eggs_gold.model.entity.Usuario;
import com.sena.eggs_gold.model.enums.EstadoInventario;
import com.sena.eggs_gold.model.enums.EstadoProducto;
import com.sena.eggs_gold.repository.InventarioRepository;
import com.sena.eggs_gold.repository.PedidoRepository;
import com.sena.eggs_gold.repository.ProductoRepository;
import com.sena.eggs_gold.repository.UsuarioRepository;
import com.sena.eggs_gold.service.InventarioService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
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




    @Override
    @Transactional
    public void agregarInventario(InventarioRequestDTO dto) {
        Producto producto = productoRepository.findById(dto.getIdProducto())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        // 1️⃣ Guardar entrada de inventario
        Inventario inventario = new Inventario();
        inventario.setProducto(producto);
        inventario.setCantidadDisponible(dto.getCantidadDisponible());
        inventario.setUbicacion(dto.getUbicacion());
        inventario.setFechaCaducidad(dto.getFechaCaducidad());
        inventario.setFechaActualizacion(LocalDateTime.now());

        inventarioRepository.save(inventario);

        // 2️⃣ Descontar una unidad del producto
        int nuevaCantidad = producto.getCantidad() - 1;
        producto.setCantidad(Math.max(nuevaCantidad, 0)); // evita negativos

        // 3️⃣ Cambiar estado si está por agotarse
        if (nuevaCantidad <= 2) {
            producto.setEstado(EstadoProducto.AGOTADO);
        }

        productoRepository.save(producto);
    }



    @Override
    public List<InventarioDetalleDTO> obtenerInventarioDetallado() {
        List<Inventario> inventarios = inventarioRepository.listarInventarioActivo();

        return inventarios.stream().map(inventario -> {
            InventarioDetalleDTO dto = new InventarioDetalleDTO();
            dto.setIdInventario(inventario.getIdInventario());
            dto.setCantidadDisponible(inventario.getCantidadDisponible());
            dto.setUbicacion(inventario.getUbicacion());
            dto.setFechaCaducidad(inventario.getFechaCaducidad());
            dto.setFechaActualizacion(inventario.getFechaActualizacion());
            dto.setEstado(inventario.getEstado().name());
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
    public boolean actualizarInventario(Inventario inventario) {
        if (!inventarioRepository.existsById(inventario.getIdInventario())) return false;

        inventario.setFechaActualizacion(LocalDateTime.now());
        inventarioRepository.save(inventario);
        return true;
    }

    @Override
    @Transactional
    public String eliminarInventario(Integer idInventario) {
            Inventario inventario = inventarioRepository.findById(idInventario)
                    .orElseThrow(() -> new RuntimeException("Inventario no encontrado"));

            inventario.setEstado(EstadoInventario.ELIMINADO);
            inventarioRepository.save(inventario);

            return "✅ Inventario marcado como eliminado";
        }

    @Override
    public List<InventarioBusquedaDTO> buscarInventario(String buscar) {

            List<Map<String, Object>> resultados = inventarioRepository.buscarInventario(buscar.toLowerCase());

            return resultados.stream().map(row -> new InventarioBusquedaDTO(
                    (Integer) row.get("idInventario"),
                    (String) row.get("nombre"),
                    new BigDecimal(row.get("precio").toString()),
                    (String) row.get("categoria"),
                    (String) row.get("descripcion"),
                    (String) row.get("estado"),
                    (Integer) row.get("cantidadDisponible"),
                    (String) row.get("ubicacion"),
                    (String) row.get("imagen"),
                    row.get("fechaCaducidad") != null ? LocalDate.parse(row.get("fechaCaducidad").toString()) : null,
                    row.get("fechaActualizacion") != null ? LocalDateTime.parse(row.get("fechaActualizacion").toString()) : null
            )).collect(Collectors.toList());
        }



}

