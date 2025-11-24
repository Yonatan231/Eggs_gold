package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.dto.PedidoAdminDTO;
import com.sena.eggs_gold.dto.UsuarioAdminDTO;
import com.sena.eggs_gold.model.entity.DetallePedido;
import com.sena.eggs_gold.model.entity.Pedido;
import com.sena.eggs_gold.model.entity.Usuario;
import com.sena.eggs_gold.model.enums.EstadoNovedad;
import com.sena.eggs_gold.model.enums.EstadoPedido;
import com.sena.eggs_gold.model.enums.EstadoUsuario;
import com.sena.eggs_gold.model.enums.Rol;
import com.sena.eggs_gold.repository.DetallePedidoRepository;
import com.sena.eggs_gold.repository.NovedadRepository;
import com.sena.eggs_gold.repository.PedidoRepository;
import com.sena.eggs_gold.repository.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdministradorRestController {

    private final PedidoRepository pedidoRepository;
    private final DetallePedidoRepository detallePedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final NovedadRepository novedadRepository;

    public AdministradorRestController(PedidoRepository pedidoRepository,
                                       DetallePedidoRepository detallePedidoRepository,
                                       UsuarioRepository usuarioRepository,
                                       NovedadRepository novedadRepository) {
        this.pedidoRepository = pedidoRepository;
        this.detallePedidoRepository = detallePedidoRepository;
        this.usuarioRepository = usuarioRepository;
        this.novedadRepository = novedadRepository;
    }

    // ============================================
    // ENDPOINTS DE PEDIDOS
    // ============================================

    @GetMapping("/pedidos")
    public ResponseEntity<List<PedidoAdminDTO>> obtenerTodosPedidos() {
        List<Pedido> pedidos = pedidoRepository.findAll();
        List<PedidoAdminDTO> pedidosDTO = pedidos.stream()
                .map(this::convertirAPedidoAdminDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(pedidosDTO);
    }

    @GetMapping("/pedidos/estado/{estado}")
    public ResponseEntity<List<PedidoAdminDTO>> obtenerPedidosPorEstado(@PathVariable String estado) {
        EstadoPedido estadoPedido = EstadoPedido.valueOf(estado);
        List<Pedido> pedidos = pedidoRepository.findByEstado(estadoPedido);
        List<PedidoAdminDTO> pedidosDTO = pedidos.stream()
                .map(this::convertirAPedidoAdminDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(pedidosDTO);
    }

    @GetMapping("/pedidos/{id}")
    public ResponseEntity<PedidoAdminDTO> obtenerDetallePedido(@PathVariable Integer id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        PedidoAdminDTO dto = convertirAPedidoAdminDTOCompleto(pedido);
        return ResponseEntity.ok(dto);
    }

    // ============================================
    // ENDPOINTS DE USUARIOS
    // ============================================

    @GetMapping("/usuarios")
    public ResponseEntity<List<UsuarioAdminDTO>> obtenerTodosUsuarios() {
        List<Usuario> usuarios = usuarioRepository.findAll();
        List<UsuarioAdminDTO> usuariosDTO = usuarios.stream()
                .map(this::convertirAUsuarioAdminDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(usuariosDTO);
    }

    @GetMapping("/usuarios/rol/{codigoRol}")
    public ResponseEntity<List<UsuarioAdminDTO>> obtenerUsuariosPorRol(@PathVariable Integer codigoRol) {
        List<Usuario> usuarios = usuarioRepository.findAll().stream()
                .filter(u -> u.getRol().getIdRoles().equals(codigoRol))
                .collect(Collectors.toList());
        List<UsuarioAdminDTO> usuariosDTO = usuarios.stream()
                .map(this::convertirAUsuarioAdminDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(usuariosDTO);
    }

    @GetMapping("/usuarios/estado/{estado}")
    public ResponseEntity<List<UsuarioAdminDTO>> obtenerUsuariosPorEstado(@PathVariable String estado) {
        EstadoUsuario estadoUsuario = EstadoUsuario.valueOf(estado);
        List<Usuario> usuarios = usuarioRepository.findByEstado(estadoUsuario);
        List<UsuarioAdminDTO> usuariosDTO = usuarios.stream()
                .map(this::convertirAUsuarioAdminDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(usuariosDTO);
    }

    @GetMapping("/usuarios/{id}")
    public ResponseEntity<UsuarioAdminDTO> obtenerDetalleUsuario(@PathVariable Integer id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        UsuarioAdminDTO dto = convertirAUsuarioAdminDTO(usuario);
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/usuarios/{id}")
    public ResponseEntity<UsuarioAdminDTO> actualizarUsuario(
            @PathVariable Integer id,
            @RequestBody UsuarioAdminDTO usuarioDTO) {

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Actualizar solo los campos permitidos (no ID, fecha registro, ni documento)
        usuario.setNombre(usuarioDTO.getNombre());
        usuario.setApellido(usuarioDTO.getApellido());
        usuario.setDireccionUsuario(usuarioDTO.getDireccion());
        usuario.setTelefono(usuarioDTO.getTelefono());
        usuario.setCorreo(usuarioDTO.getCorreo());
        usuario.setEstado(usuarioDTO.getEstado());
        usuario.setTipoDocumento(usuarioDTO.getTipoDocumento());

        // Actualizar rol si cambió (el rol está en la entidad Usuario, no es el enum)
        if (!usuario.getRol().getIdRoles().equals(usuarioDTO.getIdRol())) {
            com.sena.eggs_gold.model.entity.Rol nuevoRol = new com.sena.eggs_gold.model.entity.Rol();
            nuevoRol.setIdRoles(usuarioDTO.getIdRol());
            usuario.setRol(nuevoRol);
        }

        Usuario usuarioActualizado = usuarioRepository.save(usuario);
        return ResponseEntity.ok(convertirAUsuarioAdminDTO(usuarioActualizado));
    }

    @GetMapping("/roles")
    public ResponseEntity<List<Map<String, Object>>> obtenerTodosRoles() {
        List<Map<String, Object>> roles = new ArrayList<>();

        // Crear lista de roles desde el enum
        for (Rol rol : Rol.values()) {
            Map<String, Object> rolMap = new HashMap<>();
            rolMap.put("idRoles", rol.getCodigo());
            rolMap.put("nombreRol", rol.name());
            roles.add(rolMap);
        }

        return ResponseEntity.ok(roles);
    }

    // ============================================
    // MÉTODOS AUXILIARES - PEDIDOS
    // ============================================

    private PedidoAdminDTO convertirAPedidoAdminDTO(Pedido pedido) {
        PedidoAdminDTO dto = new PedidoAdminDTO();
        dto.setIdPedido(pedido.getIdPedidos());
        dto.setNombreCliente(pedido.getCliente().getNombre());
        dto.setApellidoCliente(pedido.getCliente().getApellido());
        dto.setEstado(pedido.getEstado());
        dto.setFechaCreacion(pedido.getFechaCreacion());
        dto.setCantidadTotal(pedido.getCantidadTotal());

        BigDecimal total = calcularTotalPedido(pedido.getIdPedidos());
        dto.setTotalPedido(total);

        return dto;
    }

    private PedidoAdminDTO convertirAPedidoAdminDTOCompleto(Pedido pedido) {
        PedidoAdminDTO dto = new PedidoAdminDTO();

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

        if (pedido.getLogistica() != null) {
            dto.setNombreLogistica(pedido.getLogistica().getNombre());
            dto.setApellidoLogistica(pedido.getLogistica().getApellido());
        }

        if (pedido.getConductor() != null) {
            dto.setNombreConductor(pedido.getConductor().getNombre());
            dto.setApellidoConductor(pedido.getConductor().getApellido());
        }

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

        BigDecimal total = productos.stream()
                .map(PedidoAdminDTO.ProductoPedidoDTO::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTotalPedido(total);

        return dto;
    }

    private BigDecimal calcularTotalPedido(Integer idPedido) {
        List<DetallePedido> detalles = detallePedidoRepository.findByPedidoIdPedidos(idPedido);
        return detalles.stream()
                .map(d -> d.getPrecioUnitario().multiply(BigDecimal.valueOf(d.getCantidad())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // ============================================
    // MÉTODOS AUXILIARES - USUARIOS
    // ============================================

    private UsuarioAdminDTO convertirAUsuarioAdminDTO(Usuario usuario) {
        UsuarioAdminDTO dto = new UsuarioAdminDTO();
        dto.setIdUsuario(usuario.getIdUsuarios());
        dto.setNombre(usuario.getNombre());
        dto.setApellido(usuario.getApellido());
        dto.setDireccion(usuario.getDireccionUsuario());
        dto.setTipoDocumento(usuario.getTipoDocumento());
        dto.setNumDocumento(usuario.getNumDocumento());
        dto.setTelefono(usuario.getTelefono());
        dto.setEstado(usuario.getEstado());
        dto.setCorreo(usuario.getCorreo());
        dto.setFechaRegistro(usuario.getFechaRegistro());
        dto.setFotoPanel(usuario.getFotoPanel());
        dto.setIdRol(usuario.getRol().getIdRoles());
        dto.setNombreRol(usuario.getRol().getNombreRol());
        return dto;
    }

    // ============================================
    // ENDPOINTS PARA DASHBOARD (TARJETAS DE RESUMEN)
    // ============================================

    /**
     * Obtiene datos para las tarjetas de resumen del dashboard
     * - Total de usuarios registrados
     * - Ventas del día (suma de todos los pedidos de hoy)
     * - Contador de novedades pendientes
     */
    @GetMapping("/dashboard/resumen")
    public ResponseEntity<Map<String, Object>> obtenerResumenDashboard() {
        Map<String, Object> resumen = new HashMap<>();

        // 1. Total de usuarios registrados
        long totalUsuarios = usuarioRepository.count();
        resumen.put("totalUsuarios", totalUsuarios);

        // 2. Ventas del día (todos los pedidos creados hoy)
        LocalDateTime inicioHoy = LocalDate.now().atStartOfDay();
        LocalDateTime finHoy = LocalDate.now().atTime(LocalTime.MAX);

        List<Pedido> pedidosHoy = pedidoRepository.findAll().stream()
                .filter(p -> p.getFechaCreacion() != null &&
                        p.getFechaCreacion().isAfter(inicioHoy) &&
                        p.getFechaCreacion().isBefore(finHoy))
                .collect(Collectors.toList());

        BigDecimal ventasHoy = pedidosHoy.stream()
                .map(pedido -> calcularTotalPedido(pedido.getIdPedidos()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        resumen.put("ventasHoy", ventasHoy);
        resumen.put("cantidadPedidosHoy", pedidosHoy.size());

        // 3. Contador de novedades pendientes
        long novedadesPendientes = novedadRepository.countByEstado(EstadoNovedad.PENDIENTE);
        resumen.put("novedadesPendientes", novedadesPendientes);

        return ResponseEntity.ok(resumen);
    }
}