package com.sena.eggs_gold.service.impl;

import com.sena.eggs_gold.dto.PedidoDTO;
import com.sena.eggs_gold.model.entity.*;
import com.sena.eggs_gold.model.enums.EstadoPedido;
import com.sena.eggs_gold.model.enums.MetodoPago;
import com.sena.eggs_gold.repository.*;
import com.sena.eggs_gold.service.EmailService;
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
    private final FacturaRepository facturaRepository;
    private final EmailService emailService;

    public PedidoServiceImpl(PedidoRepository pedidoRepository,
                             DetallePedidoRepository detallePedidoRepository,
                             CarritoRepository carritoRepository,
                             UsuarioRepository usuarioRepository,
                             InventarioRepository inventarioRepository,
                             FacturaRepository facturaRepository,
                             EmailService emailService) {
        this.pedidoRepository = pedidoRepository;
        this.detallePedidoRepository = detallePedidoRepository;
        this.carritoRepository = carritoRepository;
        this.usuarioRepository = usuarioRepository;
        this.inventarioRepository = inventarioRepository;
        this.facturaRepository = facturaRepository;
        this.emailService = emailService;
    }

    @Override
    @Transactional
    public Pedido crearPedidoDesdeCarrito(Integer idUsuario, PedidoDTO pedidoDTO) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        List<Carrito> productosCarrito = carritoRepository
                .findByUsuarioIdUsuariosAndConfirmado(idUsuario, false);

        if (productosCarrito.isEmpty()) {
            throw new RuntimeException("El carrito está vacío");
        }

        if (!validarStockDisponible(idUsuario)) {
            throw new RuntimeException("No hay stock suficiente para algunos productos");
        }

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

        BigDecimal totalFactura = BigDecimal.ZERO;

        for (Carrito itemCarrito : productosCarrito) {
            DetallePedido detalle = new DetallePedido();
            detalle.setPedido(pedidoGuardado);
            detalle.setProducto(itemCarrito.getProducto());
            detalle.setCantidad(itemCarrito.getCantidad());
            detalle.setPrecioUnitario(BigDecimal.valueOf(itemCarrito.getProducto().getPrecio()));
            detallePedidoRepository.save(detalle);

            BigDecimal subtotal = detalle.getPrecioUnitario()
                    .multiply(BigDecimal.valueOf(detalle.getCantidad()));
            totalFactura = totalFactura.add(subtotal);

            descontarInventario(itemCarrito.getProducto().getIdProducto(), itemCarrito.getCantidad());
        }

        Factura factura = crearFactura(pedidoGuardado, totalFactura);

        emailService.enviarFacturaPorCorreo(factura);

        carritoRepository.deleteAll(productosCarrito);

        return pedidoGuardado;
    }

    private Factura crearFactura(Pedido pedido, BigDecimal total) {
        Factura factura = new Factura();

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

    @Override
    @Transactional
    public void marcarPedidoComoListo(Integer idPedido) {
        Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        if (pedido.getEstado() != EstadoPedido.EN_ALISTAMIENTO) {
            throw new RuntimeException("El pedido debe estar en alistamiento");
        }

        pedido.setEstado(EstadoPedido.LISTO);
        pedidoRepository.save(pedido);
    }

    @Override
    @Transactional
    public void asignarConductor(Integer idPedido, Integer idConductor) {
        Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        Usuario conductor = usuarioRepository.findById(idConductor)
                .orElseThrow(() -> new RuntimeException("Conductor no encontrado"));

        if (pedido.getEstado() != EstadoPedido.LISTO) {
            throw new RuntimeException("El pedido debe estar listo");
        }

        pedido.setConductor(conductor);
        pedido.setEstado(EstadoPedido.ASIGNADO);
        pedidoRepository.save(pedido);
    }

    @Override
    public List<Usuario> obtenerConductoresDisponibles() {
        return usuarioRepository.findAll().stream()
                .filter(u -> u.getRol().getIdRoles() == 3) // Rol conductor
                .filter(u -> u.getEstado() == com.sena.eggs_gold.model.enums.EstadoUsuario.ACTIVO)
                .toList();
    }


}