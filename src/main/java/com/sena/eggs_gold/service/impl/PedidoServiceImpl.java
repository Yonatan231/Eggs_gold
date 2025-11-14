package com.sena.eggs_gold.service.impl;

import com.sena.eggs_gold.dto.PedidoDTO;
import com.sena.eggs_gold.model.entity.*;
import com.sena.eggs_gold.model.enums.EstadoPedido;
import com.sena.eggs_gold.model.enums.MetodoPago;
import com.sena.eggs_gold.repository.*;
import com.sena.eggs_gold.service.PedidoService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class PedidoServiceImpl implements PedidoService {

    private final PedidoRepository pedidoRepository;
    private final DetallePedidoRepository detallePedidoRepository;
    private final CarritoRepository carritoRepository;
    private final UsuarioRepository usuarioRepository;
    private final InventarioRepository inventarioRepository;

    public PedidoServiceImpl(PedidoRepository pedidoRepository,
                             DetallePedidoRepository detallePedidoRepository,
                             CarritoRepository carritoRepository,
                             UsuarioRepository usuarioRepository,
                             InventarioRepository inventarioRepository) {
        this.pedidoRepository = pedidoRepository;
        this.detallePedidoRepository = detallePedidoRepository;
        this.carritoRepository = carritoRepository;
        this.usuarioRepository = usuarioRepository;
        this.inventarioRepository = inventarioRepository;
    }

    @Override
    @Transactional
    public Pedido crearPedidoDesdeCarrito(Integer idUsuario, PedidoDTO pedidoDTO) {
        // 1. Buscar usuario
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // 2. Obtener productos del carrito
        List<Carrito> productosCarrito = carritoRepository
                .findByUsuarioIdUsuariosAndConfirmado(idUsuario, false);

        if (productosCarrito.isEmpty()) {
            throw new RuntimeException("El carrito está vacío");
        }

        // 3. Validar stock disponible
        if (!validarStockDisponible(idUsuario)) {
            throw new RuntimeException("No hay stock suficiente para algunos productos");
        }

        // 4. Crear el pedido
        Pedido pedido = new Pedido();
        pedido.setCliente(usuario);
        pedido.setDireccion(pedidoDTO.getDireccion());
        pedido.setDetalleCliente(pedidoDTO.getDetalleCliente());
        pedido.setEstado(EstadoPedido.PENDIENTE);

        // Convertir método de pago de String a Enum
        if (pedidoDTO.getMetodoPago() != null) {
            pedido.setMetodoPago(MetodoPago.valueOf(pedidoDTO.getMetodoPago().toUpperCase()));
        }

        // Calcular cantidad total
        int cantidadTotal = productosCarrito.stream()
                .mapToInt(Carrito::getCantidad)
                .sum();
        pedido.setCantidadTotal(cantidadTotal);

        // Guardar el pedido
        Pedido pedidoGuardado = pedidoRepository.save(pedido);

        // 5. Crear detalles del pedido y descontar del inventario
        for (Carrito itemCarrito : productosCarrito) {
            // Crear detalle
            DetallePedido detalle = new DetallePedido();
            detalle.setPedido(pedidoGuardado);
            detalle.setProducto(itemCarrito.getProducto());
            detalle.setCantidad(itemCarrito.getCantidad());
            detalle.setPrecioUnitario(BigDecimal.valueOf(itemCarrito.getProducto().getPrecio()));
            detallePedidoRepository.save(detalle);

            // ✅ CORREGIDO: Descontar del inventario
            descontarInventario(itemCarrito.getProducto().getIdProducto(), itemCarrito.getCantidad());
        }

        // ✅ CORREGIDO: ELIMINAR los productos del carrito (en lugar de solo marcar como confirmado)
        carritoRepository.deleteAll(productosCarrito);

        // ALTERNATIVA: Si quieres mantener historial, puedes usar esto en su lugar:
        // productosCarrito.forEach(item -> {
        //     item.setConfirmado(true);
        //     carritoRepository.save(item);
        // });

        return pedidoGuardado;
    }

    @Override
    public boolean validarStockDisponible(Integer idUsuario) {
        // Obtener productos del carrito
        List<Carrito> productosCarrito = carritoRepository
                .findByUsuarioIdUsuariosAndConfirmado(idUsuario, false);

        // Validar cada producto
        for (Carrito item : productosCarrito) {
            Integer idProducto = item.getProducto().getIdProducto();
            Integer cantidadSolicitada = item.getCantidad();

            // Obtener stock disponible del inventario
            Integer stockDisponible = obtenerStockDisponible(idProducto);

            if (stockDisponible < cantidadSolicitada) {
                return false;
            }
        }

        return true;
    }

    // ✅ Método auxiliar para obtener stock disponible
    private Integer obtenerStockDisponible(Integer idProducto) {
        List<Inventario> inventarios = inventarioRepository
                .findByProductoIdProductoAndCantidadDisponibleGreaterThan(idProducto, 0);

        return inventarios.stream()
                .mapToInt(Inventario::getCantidadDisponible)
                .sum();
    }

    // ✅ CORREGIDO: Método completo para descontar del inventario (FIFO)
    private void descontarInventario(Integer idProducto, Integer cantidadADescontar) {
        // Obtener inventarios disponibles del producto (ordenados por fecha de caducidad - FIFO)
        List<Inventario> inventarios = inventarioRepository
                .findByProductoIdProductoAndCantidadDisponibleGreaterThan(idProducto, 0);

        if (inventarios.isEmpty()) {
            throw new RuntimeException("No hay inventario disponible para el producto ID: " + idProducto);
        }

        // Ordenar por fecha de caducidad (primero los que vencen antes - FIFO)
        inventarios.sort((i1, i2) -> i1.getFechaCaducidad().compareTo(i2.getFechaCaducidad()));

        int cantidadRestante = cantidadADescontar;

        // Descontar de los inventarios disponibles
        for (Inventario inventario : inventarios) {
            if (cantidadRestante <= 0) {
                break; // Ya se descontó toda la cantidad necesaria
            }

            int cantidadDisponibleEnEsteInventario = inventario.getCantidadDisponible();

            if (cantidadDisponibleEnEsteInventario >= cantidadRestante) {
                // Este inventario tiene suficiente para completar el pedido
                inventario.setCantidadDisponible(cantidadDisponibleEnEsteInventario - cantidadRestante);
                cantidadRestante = 0;
            } else {
                // Este inventario no tiene suficiente, usar todo lo disponible
                cantidadRestante -= cantidadDisponibleEnEsteInventario;
                inventario.setCantidadDisponible(0);
            }

            // Guardar el inventario actualizado
            inventarioRepository.save(inventario);
        }

        // Si después de recorrer todos los inventarios aún queda cantidad por descontar
        if (cantidadRestante > 0) {
            throw new RuntimeException(
                    "No hay suficiente stock disponible. Faltaron " + cantidadRestante +
                            " unidades del producto ID: " + idProducto
            );
        }
    }
}