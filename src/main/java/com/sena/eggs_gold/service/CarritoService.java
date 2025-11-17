package com.sena.eggs_gold.service;

import com.sena.eggs_gold.dto.CarritoDTO;
import com.sena.eggs_gold.model.entity.Carrito;

import java.util.List;

public interface CarritoService {

    // Agregar producto al carrito
    Carrito agregarAlCarrito(Integer idUsuario, Integer idProducto, Integer cantidad);

    // Listar productos del carrito del usuario
    List<CarritoDTO> obtenerCarritoUsuario(Integer idUsuario);

    // Actualizar cantidad de un producto en el carrito
    boolean actualizarCantidad(Integer idCarrito, Integer nuevaCantidad);

    // Eliminar producto del carrito
    boolean eliminarDelCarrito(Integer idCarrito);

    // Obtener total del carrito
    Float calcularTotal(Integer idUsuario);

    // Contar productos en el carrito
    Integer contarProductosEnCarrito(Integer idUsuario);
}