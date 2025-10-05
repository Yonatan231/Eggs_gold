package com.sena.eggs_gold.service.impl;

import com.sena.eggs_gold.dto.CarritoTemporalDTO;
import com.sena.eggs_gold.dto.ConfirmarPedidoRequestDTO;
import com.sena.eggs_gold.dto.ItemCarritoRequestDTO;
import com.sena.eggs_gold.model.entity.*;
import com.sena.eggs_gold.model.enums.EstadoPedido;
import com.sena.eggs_gold.model.enums.EstadoVenta;
import com.sena.eggs_gold.model.enums.MetodoPago;
import com.sena.eggs_gold.repository.*;
import com.sena.eggs_gold.service.CarritoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CarritoServiceImpl implements CarritoService {

    @Autowired
    TemporalPedidoRepository temporalRepo;
    @Autowired
    UsuarioRepository usuarioRepo;
    @Autowired
    ProductoRepository productoRepo;
    @Autowired
    InventarioRepository inventarioRepo;
    @Autowired
    VehiculoRepository vehiculoRepo;
    @Autowired
    VentaRepository ventaRepo;
    @Autowired
    PedidoRepository pedidoRepo;

    @Override
    public String AgregarOactualizarItem(ItemCarritoRequestDTO request) {
        if (request.getUsuario() == null || request.getProducto() == null || request.getCantidad() == null
                || request.getUsuario() <= 0 || request.getProducto() <= 0 || request.getCantidad() <= 0) {
            throw new IllegalArgumentException("❌ Datos inválidos.");
        }
        Usuario usuario = usuarioRepo.findById(request.getUsuario())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        Producto producto = productoRepo.findById(request.getProducto())
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));

        Optional<TemporalPedido> existente = temporalRepo.findByUsuarioAndProductoAndConfirmado(
                usuario, producto, false
        );

        if (existente.isPresent()) {
            TemporalPedido item = existente.get();
            item.setCantidad(item.getCantidad() + request.getCantidad());
            temporalRepo.save(item);
            return "✅ Cantidad actualizada en el carrito.";
        } else {
            TemporalPedido nuevo = new TemporalPedido();
            nuevo.setUsuario(usuario);
            nuevo.setProducto(producto);
            nuevo.setCantidad(request.getCantidad());
            nuevo.setConfirmado(false);
            temporalRepo.save(nuevo);
            return "✅ Producto agregado al carrito.";
        }
    }

    @Override
    public List<CarritoTemporalDTO> obtenerCarritoPorUsuario(Integer usuarioId) {
        if (usuarioId == null || usuarioId <= 0) {
            throw new IllegalArgumentException("❌ ID de usuario no válido.");
        }
        return temporalRepo.obtenerCarritoPorUsuario(usuarioId);
    }

    @Override
    public void eliminarItemPorId(Integer id) {
        if (!temporalRepo.existsById(id)) {
            throw new IllegalArgumentException("Producto no encontrado en el carrito.");
        }
        temporalRepo.deleteById(id);
    }


    @Override
    public String confirmarPedido(ConfirmarPedidoRequestDTO dto) {
        Integer usuarioId = dto.getUsuarioId();
        String direccion = dto.getDireccion();

        // 1. Validaciones básicas
        if (usuarioId == null || usuarioId <= 0 || direccion == null || direccion.trim().isEmpty()) {
            throw new IllegalArgumentException("Datos inválidos para confirmar el pedido.");
        }

        Usuario usuario = usuarioRepo.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        // 2. Obtener productos del carrito temporal
        List<TemporalPedido> items = temporalRepo.findByUsuarioAndConfirmado(usuario, false);
        if (items.isEmpty()) {
            throw new IllegalArgumentException("No hay productos en el carrito.");
        }

        double total = 0.0;
        List<Venta> ventas = new ArrayList<>();

        for (TemporalPedido item : items) {
            Producto producto = item.getProducto();
            int cantidad = item.getCantidad();

            // Validar stock
            List<Inventario> inventarios = inventarioRepo.listarInventarioActivo();
            if (inventarios.isEmpty()) {
                throw new IllegalArgumentException("No hay inventario disponible para el producto: " + producto.getNombre());
            }

// Seleccionar el inventario con más stock, o el más reciente, o el que no esté vencido
            Inventario inventario = inventarios.stream()
                    .filter(i -> i.getCantidadDisponible() > 0)
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Todos los inventarios están agotados para el producto: " + producto.getNombre()));


            // Crear venta
            Venta venta = new Venta();
            venta.setCliente(usuario);
            venta.setProducto(producto);
            venta.setCantidad(cantidad);
            venta.setFecha(LocalDateTime.now());
            System.out.println("Fecha asignada a venta: " + venta.getFecha());
            venta.setMetodoPago(MetodoPago.EFECTIVO);
            venta.setEstado(EstadoVenta.PENDIENTE);
            venta.setVehiculo(vehiculoRepo.findById(1).orElseThrow()); // o el que corresponda



            ventas.add(venta);

            // Calcular total
            total += producto.getPrecio() * cantidad;

            // Actualizar inventario
            inventario.setCantidadDisponible(inventario.getCantidadDisponible() - cantidad);
            inventario.setFechaCaducidad(LocalDate.now().plusYears(1));
            inventario.setFechaActualizacion(LocalDateTime.now());
            inventarioRepo.save(inventario);
        }

        // 3. Crear pedido
        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);
        pedido.setDireccion(direccion);
        pedido.setEstado(EstadoPedido.PENDIENTE);
        pedido.setFechaCreacion(LocalDateTime.now());
        pedido.setTotal(BigDecimal.valueOf(total));

        // 1. Guardar el pedido primero
        pedidoRepo.save(pedido); // ← ahora tiene ID

// 2. Asignar el pedido a cada venta
        for (Venta venta : ventas) {
            venta.setPedido(pedido);
        }

// 3. Guardar todas las ventas
        ventaRepo.saveAll(ventas);

// 4. (Opcional) Asociar ventas al pedido si necesitas bidireccionalidad
        pedido.setVentas(ventas);
        pedidoRepo.save(pedido); // ← opcional si ya está guardado





        // 5. Vaciar carrito temporal
        temporalRepo.deleteAll(items);

        return "✅ Pedido confirmado con éxito.";
    }

}
