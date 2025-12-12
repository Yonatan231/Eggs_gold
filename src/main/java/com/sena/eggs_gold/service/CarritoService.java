package com.sena.eggs_gold.service;

import com.sena.eggs_gold.dto.CarritoDTO;
import com.sena.eggs_gold.model.entity.Carrito;

import java.util.List;

public interface CarritoService {

    Carrito agregarAlCarrito(Integer idUsuario, Integer idProducto, Integer cantidad);

    List<CarritoDTO> obtenerCarritoUsuario(Integer idUsuario);

    boolean actualizarCantidad(Integer idCarrito, Integer nuevaCantidad);

    boolean eliminarDelCarrito(Integer idCarrito);

    Float calcularTotal(Integer idUsuario);

    Integer contarProductosEnCarrito(Integer idUsuario);
}