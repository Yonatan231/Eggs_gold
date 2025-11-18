package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.dto.PedidoAdminDTO;
import com.sena.eggs_gold.model.entity.DetallePedido;
import com.sena.eggs_gold.model.entity.Pedido;
import com.sena.eggs_gold.model.enums.EstadoPedido;
import com.sena.eggs_gold.repository.DetallePedidoRepository;
import com.sena.eggs_gold.repository.PedidoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/pedidos")
public class AdministradorRestController {

    private final PedidoRepository pedidoRepository;
    private final DetallePedidoRepository detallePedidoRepository;

    public AdministradorRestController(PedidoRepository pedidoRepository,
                                       DetallePedidoRepository detallePedidoRepository) {
        this.pedidoRepository = pedidoRepository;
        this.detallePedidoRepository = detallePedidoRepository;
    }

    // Obtener todos los pedidos
    @GetMapping
    public ResponseEntity<List<PedidoAdminDTO>> obtenerTodosPedidos() {
        List<Pedido> pedidos = pedidoRepository.findAll();
        List<PedidoAdminDTO> pedidosDTO = pedidos.stream()
                .map(this::convertirAPedidoAdminDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(pedidosDTO);
    }

    // Obtener pedidos por estado
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<PedidoAdminDTO>> obtenerPedidosPorEstado(@PathVariable String estado) {
        EstadoPedido estadoPedido = EstadoPedido.valueOf(estado);
        List<Pedido> pedidos = pedidoRepository.findByEstado(estadoPedido);
        List<PedidoAdminDTO> pedidosDTO = pedidos.stream()
                .map(this::convertirAPedidoAdminDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(pedidosDTO);
    }

    // Obtener detalle de un pedido específico
    @GetMapping("/{id}")
    public ResponseEntity<PedidoAdminDTO> obtenerDetallePedido(@PathVariable Integer id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        PedidoAdminDTO dto = convertirAPedidoAdminDTOCompleto(pedido);
        return ResponseEntity.ok(dto);
    }

    // Convertir Pedido a DTO básico (para lista)
    private PedidoAdminDTO convertirAPedidoAdminDTO(Pedido pedido) {
        PedidoAdminDTO dto = new PedidoAdminDTO();
        dto.setIdPedido(pedido.getIdPedidos());
        dto.setNombreCliente(pedido.getCliente().getNombre());
        dto.setApellidoCliente(pedido.getCliente().getApellido());
        dto.setEstado(pedido.getEstado());
        dto.setFechaCreacion(pedido.getFechaCreacion());
        dto.setCantidadTotal(pedido.getCantidadTotal());

        // Calcular total del pedido
        BigDecimal total = calcularTotalPedido(pedido.getIdPedidos());
        dto.setTotalPedido(total);

        return dto;
    }

    // Convertir Pedido a DTO completo (para modal)
    private PedidoAdminDTO convertirAPedidoAdminDTOCompleto(Pedido pedido) {
        PedidoAdminDTO dto = new PedidoAdminDTO();

        // Información básica
        dto.setIdPedido(pedido.getIdPedidos());
        dto.setNombreCliente(pedido.getCliente().getNombre());
        dto.setApellidoCliente(pedido.getCliente().getApellido());
        dto.setTelefonoCliente(pedido.getCliente().getTelefono());
        dto.setDireccion(pedido.getDireccion());
        dto.setDetalleCliente(pedido.getDetalleCliente());
        dto.setObservacionConductor(pedido.getObservacionConductor());
        dto.setEstado(pedido.getEstado());
        dto.setMetodoPago(pedido.getMetodoPago());
        dto.setFechaCreacion(pedido.getFechaCreacion());
        dto.setFechaEntrega(pedido.getFechaEntrega());
        dto.setCantidadTotal(pedido.getCantidadTotal());

        // Información según estado
        if (pedido.getLogistica() != null) {
            dto.setNombreLogistica(pedido.getLogistica().getNombre());
            dto.setApellidoLogistica(pedido.getLogistica().getApellido());
        }

        if (pedido.getConductor() != null) {
            dto.setNombreConductor(pedido.getConductor().getNombre());
            dto.setApellidoConductor(pedido.getConductor().getApellido());
        }

        // Productos del pedido
        List<DetallePedido> detalles = detallePedidoRepository.findByPedidoIdPedidos(pedido.getIdPedidos());
        List<PedidoAdminDTO.ProductoPedidoDTO> productos = detalles.stream()
                .map(detalle -> {
                    PedidoAdminDTO.ProductoPedidoDTO productoDTO = new PedidoAdminDTO.ProductoPedidoDTO();
                    productoDTO.setNombreProducto(detalle.getProducto().getNombre());
                    productoDTO.setCategoria(detalle.getProducto().getCategoria().toString());
                    productoDTO.setCantidad(detalle.getCantidad());
                    productoDTO.setPrecioUnitario(detalle.getPrecioUnitario());
                    productoDTO.setSubtotal(detalle.getPrecioUnitario()
                            .multiply(BigDecimal.valueOf(detalle.getCantidad())));
                    return productoDTO;
                })
                .collect(Collectors.toList());
        dto.setProductos(productos);

        // Calcular total
        BigDecimal total = productos.stream()
                .map(PedidoAdminDTO.ProductoPedidoDTO::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTotalPedido(total);

        return dto;
    }

    // Calcular total del pedido
    private BigDecimal calcularTotalPedido(Integer idPedido) {
        List<DetallePedido> detalles = detallePedidoRepository.findByPedidoIdPedidos(idPedido);
        return detalles.stream()
                .map(d -> d.getPrecioUnitario().multiply(BigDecimal.valueOf(d.getCantidad())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}