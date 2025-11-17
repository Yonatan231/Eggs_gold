package com.sena.eggs_gold.service.impl;

import com.sena.eggs_gold.dto.CarritoDTO;
import com.sena.eggs_gold.model.entity.Carrito;
import com.sena.eggs_gold.model.entity.Producto;
import com.sena.eggs_gold.model.entity.Usuario;
import com.sena.eggs_gold.repository.CarritoRepository;
import com.sena.eggs_gold.repository.ProductoRepository;
import com.sena.eggs_gold.repository.UsuarioRepository;
import com.sena.eggs_gold.service.CarritoService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CarritoServiceImpl implements CarritoService {

    private final CarritoRepository carritoRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    public CarritoServiceImpl(CarritoRepository carritoRepository,
                              ProductoRepository productoRepository,
                              UsuarioRepository usuarioRepository) {
        this.carritoRepository = carritoRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    @Transactional
    public Carrito agregarAlCarrito(Integer idUsuario, Integer idProducto, Integer cantidad) {
        // Buscar usuario
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Buscar producto
        Producto producto = productoRepository.findById(idProducto)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        // Verificar si el producto ya está en el carrito
        Carrito carritoExistente = carritoRepository
                .findByUsuarioIdUsuariosAndProductoIdProductoAndConfirmado(idUsuario, idProducto, false);

        if (carritoExistente != null) {
            // Si ya existe, actualizar la cantidad
            carritoExistente.setCantidad(carritoExistente.getCantidad() + cantidad);
            return carritoRepository.save(carritoExistente);
        } else {
            // Si no existe, crear nuevo registro
            Carrito nuevoCarrito = new Carrito();
            nuevoCarrito.setUsuario(usuario);
            nuevoCarrito.setProducto(producto);
            nuevoCarrito.setCantidad(cantidad);
            nuevoCarrito.setConfirmado(false);
            return carritoRepository.save(nuevoCarrito);
        }
    }

    @Override
    public List<CarritoDTO> obtenerCarritoUsuario(Integer idUsuario) {
        List<Carrito> carritos = carritoRepository.findByUsuarioIdUsuariosAndConfirmado(idUsuario, false);

        return carritos.stream().map(carrito -> {
            CarritoDTO dto = new CarritoDTO();
            dto.setId(carrito.getId());
            dto.setIdProducto(carrito.getProducto().getIdProducto());
            dto.setNombreProducto(carrito.getProducto().getNombre());
            dto.setImagenProducto(carrito.getProducto().getImagen());
            dto.setPrecioUnitario(carrito.getProducto().getPrecio());
            dto.setCantidad(carrito.getCantidad());
            dto.setSubtotal(carrito.getProducto().getPrecio() * carrito.getCantidad());
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public boolean actualizarCantidad(Integer idCarrito, Integer nuevaCantidad) {
        try {
            Carrito carrito = carritoRepository.findById(idCarrito)
                    .orElseThrow(() -> new RuntimeException("Producto en carrito no encontrado"));

            carrito.setCantidad(nuevaCantidad);
            carritoRepository.save(carrito);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    @Transactional
    public boolean eliminarDelCarrito(Integer idCarrito) {
        try {
            carritoRepository.deleteById(idCarrito);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public Float calcularTotal(Integer idUsuario) {
        List<Carrito> carritos = carritoRepository.findByUsuarioIdUsuariosAndConfirmado(idUsuario, false);

        return carritos.stream()
                .map(c -> c.getProducto().getPrecio() * c.getCantidad())
                .reduce(0f, Float::sum);
    }

    @Override
    public Integer contarProductosEnCarrito(Integer idUsuario) {
        return carritoRepository.countByUsuarioIdUsuariosAndConfirmado(idUsuario, false);
    }
}