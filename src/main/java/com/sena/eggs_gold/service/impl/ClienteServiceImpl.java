package com.sena.eggs_gold.service.impl;

import com.sena.eggs_gold.dto.ClienteDTO;
import com.sena.eggs_gold.model.entity.*;
import com.sena.eggs_gold.model.enums.EstadoUsuario;
import com.sena.eggs_gold.model.enums.TipoDocumento;
import com.sena.eggs_gold.repository.*;
import com.sena.eggs_gold.service.ClienteService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ClienteServiceImpl implements ClienteService {

    private final ClienteRepository clienteRepository;
    private final RolRepository rolRepository;
    private final PedidoRepository pedidoRepository;
    private final DetallePedidoRepository detallePedidoRepository;
    private final FacturaRepository facturaRepository;

    public ClienteServiceImpl(ClienteRepository clienteRepository,
                              RolRepository rolRepository,
                              PedidoRepository pedidoRepository,
                              DetallePedidoRepository detallePedidoRepository,
                              FacturaRepository facturaRepository) {
        this.clienteRepository = clienteRepository;
        this.rolRepository = rolRepository;
        this.pedidoRepository = pedidoRepository;
        this.detallePedidoRepository = detallePedidoRepository;
        this.facturaRepository = facturaRepository;
    }

    @Override
    public void registrarCliente(ClienteDTO dto){
        Cliente cliente = new Cliente();

        cliente.setNombre(dto.getNombre());
        cliente.setApellido(dto.getApellido());
        cliente.setDireccionUsuario(dto.getDireccionUsuario());
        cliente.setNumDocumento(dto.getNumDocumento());
        cliente.setTelefono(dto.getTelefono());
        cliente.setCorreo(dto.getCorreo());
        cliente.setPassword(dto.getPassword());
        cliente.setEdad(dto.getEdad()); // ✅ Mapear edad
        cliente.setEstado(EstadoUsuario.ACTIVO);
        cliente.setTipoDocumento(TipoDocumento.CC);
        cliente.setFechaRegistro(LocalDate.now());

        Rol rol = rolRepository.findById(4)
                .orElseThrow(() -> new RuntimeException("Rol por defecto (ID 4) no encontrado"));
        cliente.setRol(rol);

        clienteRepository.save(cliente);
    }

    @Override
    public ClienteDTO login(String numDocumento, String password){
        return clienteRepository.findByNumDocumentoAndPassword(numDocumento, password)
                .map(cliente->{
                    // Verificar que el usuario esté ACTIVO
                    if (cliente.getEstado() != EstadoUsuario.ACTIVO) {
                        return null; // No permitir login si está inactivo
                    }

                    ClienteDTO dto = new ClienteDTO();
                    dto.setIdUsuarios(cliente.getIdUsuarios());
                    dto.setNombre(cliente.getNombre());
                    dto.setApellido(cliente.getApellido());
                    dto.setDireccionUsuario(cliente.getDireccionUsuario());
                    dto.setNumDocumento(cliente.getNumDocumento());
                    dto.setTelefono(cliente.getTelefono());
                    dto.setCorreo(cliente.getCorreo());
                    dto.setPassword(cliente.getPassword());
                    return dto;
                })
                .orElse(null);
    }

    // ✅ NUEVO: Obtener pedidos del cliente
    @Override
    public List<Map<String, Object>> obtenerMisPedidos(Integer idCliente) {
        List<Pedido> pedidos = pedidoRepository.findByClienteIdUsuarios(idCliente);

        return pedidos.stream().map(pedido -> {
            Map<String, Object> map = new HashMap<>();
            map.put("idPedido", pedido.getIdPedidos());
            map.put("fechaCreacion", pedido.getFechaCreacion());
            map.put("estado", pedido.getEstado().toString());
            map.put("direccion", pedido.getDireccion());
            map.put("detalleCliente", pedido.getDetalleCliente());
            map.put("cantidadTotal", pedido.getCantidadTotal());
            map.put("metodoPago", pedido.getMetodoPago() != null ? pedido.getMetodoPago().toString() : "N/A");

            if (pedido.getFechaEntrega() != null) {
                map.put("fechaEntrega", pedido.getFechaEntrega());
            }

            // Obtener productos
            List<DetallePedido> detalles = detallePedidoRepository.findByPedidoIdPedidos(pedido.getIdPedidos());

            List<Map<String, Object>> productos = detalles.stream().map(detalle -> {
                Map<String, Object> productoMap = new HashMap<>();
                productoMap.put("nombre", detalle.getProducto().getNombre());
                productoMap.put("categoria", detalle.getProducto().getCategoria().toString());
                productoMap.put("cantidad", detalle.getCantidad());
                productoMap.put("precioUnitario", detalle.getPrecioUnitario());
                productoMap.put("subtotal", detalle.getPrecioUnitario().multiply(java.math.BigDecimal.valueOf(detalle.getCantidad())));
                return productoMap;
            }).collect(Collectors.toList());

            map.put("productos", productos);
            map.put("tiposProductos", detalles.size());

            // Calcular total
            java.math.BigDecimal total = detalles.stream()
                    .map(d -> d.getPrecioUnitario().multiply(java.math.BigDecimal.valueOf(d.getCantidad())))
                    .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
            map.put("total", total);

            return map;
        }).collect(Collectors.toList());
    }

    // ✅ NUEVO: Obtener factura
    @Override
    public Map<String, Object> obtenerFacturaPorPedido(Integer idPedido, Integer idCliente) {
        Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        // Verificar que el pedido pertenezca al cliente
        if (!pedido.getCliente().getIdUsuarios().equals(idCliente)) {
            throw new RuntimeException("No tienes permiso para ver esta factura");
        }

        Factura factura = facturaRepository.findByPedidoIdPedidos(idPedido)
                .orElseThrow(() -> new RuntimeException("Factura no encontrada"));

        Map<String, Object> facturaMap = new HashMap<>();
        facturaMap.put("numeroFactura", factura.getNumeroFactura());
        facturaMap.put("fechaPago", factura.getFechaPago());
        facturaMap.put("metodoPago", factura.getMetodoPago().toString());
        facturaMap.put("totalPagado", factura.getTotalPagado());

        // Datos del cliente
        facturaMap.put("clienteNombre", pedido.getCliente().getNombre() + " " + pedido.getCliente().getApellido());
        facturaMap.put("clienteDocumento", pedido.getCliente().getNumDocumento());
        facturaMap.put("clienteDireccion", pedido.getDireccion());
        facturaMap.put("clienteTelefono", pedido.getCliente().getTelefono());

        // Productos
        List<DetallePedido> detalles = detallePedidoRepository.findByPedidoIdPedidos(idPedido);

        List<Map<String, Object>> productos = detalles.stream().map(detalle -> {
            Map<String, Object> productoMap = new HashMap<>();
            productoMap.put("nombre", detalle.getProducto().getNombre());
            productoMap.put("cantidad", detalle.getCantidad());
            productoMap.put("precioUnitario", detalle.getPrecioUnitario());
            productoMap.put("subtotal", detalle.getPrecioUnitario().multiply(java.math.BigDecimal.valueOf(detalle.getCantidad())));
            return productoMap;
        }).collect(Collectors.toList());

        facturaMap.put("productos", productos);

        return facturaMap;
    }
}