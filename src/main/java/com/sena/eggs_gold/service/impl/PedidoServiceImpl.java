package com.sena.eggs_gold.service.impl;

import com.sena.eggs_gold.dto.PedidoDTO;
import com.sena.eggs_gold.model.entity.*;
import com.sena.eggs_gold.model.enums.EstadoPedido;
import com.sena.eggs_gold.model.enums.MetodoPago;
import com.sena.eggs_gold.repository.*;
import com.sena.eggs_gold.service.EmailService; // ✅ AGREGAR
import com.sena.eggs_gold.service.PedidoService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PedidoServiceImpl implements PedidoService {

    private final PedidoRepository pedidoRepository;
    private final DetallePedidoRepository detallePedidoRepository;
    private final CarritoRepository carritoRepository;
    private final UsuarioRepository usuarioRepository;
    private final InventarioRepository inventarioRepository;
    private final FacturaRepository facturaRepository; // ✅ AGREGAR
    private final EmailService emailService; // ✅ AGREGAR

    public PedidoServiceImpl(PedidoRepository pedidoRepository,
                             DetallePedidoRepository detallePedidoRepository,
                             CarritoRepository carritoRepository,
                             UsuarioRepository usuarioRepository,
                             InventarioRepository inventarioRepository,
                             FacturaRepository facturaRepository, // ✅ AGREGAR
                             EmailService emailService) { // ✅ AGREGAR
        this.pedidoRepository = pedidoRepository;
        this.detallePedidoRepository = detallePedidoRepository;
        this.carritoRepository = carritoRepository;
        this.usuarioRepository = usuarioRepository;
        this.inventarioRepository = inventarioRepository;
        this.facturaRepository = facturaRepository; // ✅ AGREGAR
        this.emailService = emailService; // ✅ AGREGAR
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

        if (pedidoDTO.getMetodoPago() != null) {
            pedido.setMetodoPago(MetodoPago.valueOf(pedidoDTO.getMetodoPago().toUpperCase()));
        }

        int cantidadTotal = productosCarrito.stream()
                .mapToInt(Carrito::getCantidad)
                .sum();
        pedido.setCantidadTotal(cantidadTotal);

        Pedido pedidoGuardado = pedidoRepository.save(pedido);

        // 5. Crear detalles del pedido y descontar del inventario
        BigDecimal totalFactura = BigDecimal.ZERO; // ✅ AGREGAR

        for (Carrito itemCarrito : productosCarrito) {
            DetallePedido detalle = new DetallePedido();
            detalle.setPedido(pedidoGuardado);
            detalle.setProducto(itemCarrito.getProducto());
            detalle.setCantidad(itemCarrito.getCantidad());
            detalle.setPrecioUnitario(BigDecimal.valueOf(itemCarrito.getProducto().getPrecio()));
            detallePedidoRepository.save(detalle);

            // ✅ Calcular total
            BigDecimal subtotal = detalle.getPrecioUnitario()
                    .multiply(BigDecimal.valueOf(detalle.getCantidad()));
            totalFactura = totalFactura.add(subtotal);

            descontarInventario(itemCarrito.getProducto().getIdProducto(), itemCarrito.getCantidad());
        }

        // ✅ 6. CREAR FACTURA
        Factura factura = crearFactura(pedidoGuardado, totalFactura);

        // ✅ 7. ENVIAR CORREO CON FACTURA
        emailService.enviarFacturaPorCorreo(factura);

        // 8. Eliminar productos del carrito
        carritoRepository.deleteAll(productosCarrito);

        return pedidoGuardado;
    }

    // ✅ NUEVO: Crear factura
    private Factura crearFactura(Pedido pedido, BigDecimal total) {
        Factura factura = new Factura();

        // Generar número de factura único
        Integer ultimoNumero = facturaRepository.findMaxNumeroFactura();
        factura.setNumeroFactura(ultimoNumero == null ? 1 : ultimoNumero + 1);

        factura.setPedido(pedido);
        factura.setMetodoPago(pedido.getMetodoPago());
        factura.setTotalPagado(total);
        factura.setFechaPago(LocalDateTime.now());

        return facturaRepository.save(factura);
    }

    @Override
    public boolean validarStockDisponible(Integer idUsuario) {
        List<Carrito> productosCarrito = carritoRepository
                .findByUsuarioIdUsuariosAndConfirmado(idUsuario, false);

        for (Carrito item : productosCarrito) {
            Integer idProducto = item.getProducto().getIdProducto();
            Integer cantidadSolicitada = item.getCantidad();
            Integer stockDisponible = obtenerStockDisponible(idProducto);

            if (stockDisponible < cantidadSolicitada) {
                return false;
            }
        }

        return true;
    }

    private Integer obtenerStockDisponible(Integer idProducto) {
        List<Inventario> inventarios = inventarioRepository
                .findByProductoIdProductoAndCantidadDisponibleGreaterThan(idProducto, 0);

        return inventarios.stream()
                .mapToInt(Inventario::getCantidadDisponible)
                .sum();
    }

    private void descontarInventario(Integer idProducto, Integer cantidadADescontar) {
        List<Inventario> inventarios = inventarioRepository
                .findByProductoIdProductoAndCantidadDisponibleGreaterThan(idProducto, 0);

        if (inventarios.isEmpty()) {
            throw new RuntimeException("No hay inventario disponible para el producto ID: " + idProducto);
        }

        inventarios.sort((i1, i2) -> i1.getFechaCaducidad().compareTo(i2.getFechaCaducidad()));

        int cantidadRestante = cantidadADescontar;

        for (Inventario inventario : inventarios) {
            if (cantidadRestante <= 0) {
                break;
            }

            int cantidadDisponibleEnEsteInventario = inventario.getCantidadDisponible();

            if (cantidadDisponibleEnEsteInventario >= cantidadRestante) {
                inventario.setCantidadDisponible(cantidadDisponibleEnEsteInventario - cantidadRestante);
                cantidadRestante = 0;
            } else {
                cantidadRestante -= cantidadDisponibleEnEsteInventario;
                inventario.setCantidadDisponible(0);
            }

            inventarioRepository.save(inventario);
        }

        if (cantidadRestante > 0) {
            throw new RuntimeException(
                    "No hay suficiente stock disponible. Faltaron " + cantidadRestante +
                            " unidades del producto ID: " + idProducto
            );
        }
    }
}