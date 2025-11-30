package com.sena.eggs_gold.service.impl;

import com.sena.eggs_gold.dto.LogisticaDTO;
import com.sena.eggs_gold.model.entity.Logistica;
import com.sena.eggs_gold.model.entity.Pedido;
import com.sena.eggs_gold.model.entity.DetallePedido;
import com.sena.eggs_gold.model.entity.Usuario;
import com.sena.eggs_gold.model.entity.Rol;
import com.sena.eggs_gold.model.enums.EstadoUsuario;
import com.sena.eggs_gold.model.enums.TipoDocumento;
import com.sena.eggs_gold.model.enums.EstadoPedido;
import com.sena.eggs_gold.repository.LogisticaRepository;
import com.sena.eggs_gold.repository.RolRepository;
import com.sena.eggs_gold.repository.PedidoRepository;
import com.sena.eggs_gold.repository.DetallePedidoRepository;
import com.sena.eggs_gold.repository.UsuarioRepository;
import com.sena.eggs_gold.service.LogisticaService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class LogisticaServiceImpl implements LogisticaService {

    private final LogisticaRepository logisticaRepository;
    private final RolRepository rolRepository;
    private final PedidoRepository pedidoRepository;
    private final DetallePedidoRepository detallePedidoRepository;
    private final UsuarioRepository usuarioRepository;

    public LogisticaServiceImpl(LogisticaRepository logisticaRepository,
                                RolRepository rolRepository,
                                PedidoRepository pedidoRepository,
                                DetallePedidoRepository detallePedidoRepository,
                                UsuarioRepository usuarioRepository) {
        this.logisticaRepository = logisticaRepository;
        this.rolRepository = rolRepository;
        this.pedidoRepository = pedidoRepository;
        this.detallePedidoRepository = detallePedidoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public LogisticaDTO login(String numDocumento, String password) {
        return logisticaRepository.findByNumDocumentoAndPassword(numDocumento, password)
                .map(logistica -> {
                    // Verificar que el usuario esté ACTIVO
                    if (logistica.getEstado() != EstadoUsuario.ACTIVO) {
                        return null; // No permitir login si está inactivo
                    }

                    return new LogisticaDTO(
                            logistica.getIdUsuarios(),
                            logistica.getNombre(),
                            logistica.getApellido(),
                            logistica.getDireccionUsuario(),
                            logistica.getNumDocumento(),
                            logistica.getTelefono(),
                            logistica.getCorreo(),
                            logistica.getPassword(),
                            "LOGISTICA"
                    );
                })
                .orElse(null);
    }

    @Override
    public void registrarLogistica(LogisticaDTO dto) {
        // ✅ Crear nueva instancia de Logística
        Logistica logistica = new Logistica();
        logistica.setNombre(dto.getNombre());
        logistica.setApellido(dto.getApellido());
        logistica.setDireccionUsuario(dto.getDireccionUsuario());
        logistica.setNumDocumento(dto.getNumDocumento());
        logistica.setTelefono(dto.getTelefono());
        logistica.setCorreo(dto.getCorreo());
        logistica.setPassword(dto.getPassword());
        logistica.setEdad(dto.getEdad()); // ✅ Mapear edad

        // ✅ CAMPO OBLIGATORIO: Asignar ESTADO como ACTIVO
        logistica.setEstado(EstadoUsuario.ACTIVO);

        // ✅ CAMPO OBLIGATORIO: Asignar TIPO_DOCUMENTO (por defecto CEDULA_CIUDADANIA)
        logistica.setTipoDocumento(TipoDocumento.CC);

        // ✅ CAMPO OBLIGATORIO: Asignar FECHA_REGISTRO con la fecha actual
        logistica.setFechaRegistro(LocalDate.now());

        // ✅ Asignar el ROL de Logística (ID = 2)
        Rol rol = rolRepository.findById(2)
                .orElseThrow(() -> new RuntimeException("Rol Logística no encontrado"));
        logistica.setRol(rol);

        // ✅ Guardar en la base de datos
        logisticaRepository.save(logistica);
    }

    // =====================================================
    // NUEVOS MÉTODOS PARA GESTIÓN DE PEDIDOS
    // =====================================================

    @Override
    public List<Map<String, Object>> obtenerPedidosPendientes() {
        // Buscar pedidos con estado PENDIENTE, ordenados por fecha de creación
        List<Pedido> pedidos = pedidoRepository.findByEstadoOrderByFechaCreacionDesc(EstadoPedido.PENDIENTE);

        // Convertir cada pedido a un Map con la información necesaria
        return pedidos.stream().map(pedido -> {
            Map<String, Object> pedidoMap = new HashMap<>();
            pedidoMap.put("idPedido", pedido.getIdPedidos());
            pedidoMap.put("cantidadTotal", pedido.getCantidadTotal());
            pedidoMap.put("fechaCreacion", pedido.getFechaCreacion());

            // Contar tipos de productos diferentes
            List<DetallePedido> detalles = detallePedidoRepository.findByPedidoIdPedidos(pedido.getIdPedidos());
            pedidoMap.put("tiposProductos", detalles.size());

            return pedidoMap;
        }).collect(Collectors.toList());
    }

    @Override
    public void tomarPedido(Integer idPedido, Integer idLogistica) {
        // Buscar el pedido
        Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        // Verificar que el pedido esté en estado PENDIENTE
        if (pedido.getEstado() != EstadoPedido.PENDIENTE) {
            throw new RuntimeException("El pedido no está pendiente");
        }

        // Buscar el usuario de logística
        Usuario logistica = usuarioRepository.findById(idLogistica)
                .orElseThrow(() -> new RuntimeException("Usuario de logística no encontrado"));

        // Asignar logística al pedido y cambiar estado
        pedido.setLogistica(logistica);
        pedido.setEstado(EstadoPedido.EN_ALISTAMIENTO);

        // Guardar cambios
        pedidoRepository.save(pedido);
    }

    @Override
    public List<Map<String, Object>> obtenerPedidosEnAlistamiento(Integer idLogistica) {
        // ✅ Buscar pedidos que estén EN_ALISTAMIENTO O LISTO y asignados a este usuario
        List<Pedido> pedidos = pedidoRepository.findAll().stream()
                .filter(p -> (p.getEstado() == EstadoPedido.EN_ALISTAMIENTO
                        || p.getEstado() == EstadoPedido.LISTO) // ✅ INCLUIR AMBOS ESTADOS
                        && p.getLogistica() != null
                        && p.getLogistica().getIdUsuarios().equals(idLogistica))
                .collect(Collectors.toList());

        // Convertir a Map
        return pedidos.stream().map(pedido -> {
            Map<String, Object> pedidoMap = new HashMap<>();
            pedidoMap.put("idPedido", pedido.getIdPedidos());
            pedidoMap.put("cantidadTotal", pedido.getCantidadTotal());
            pedidoMap.put("fechaCreacion", pedido.getFechaCreacion());
            pedidoMap.put("estado", pedido.getEstado().toString()); // ✅ AGREGAR ESTADO para el JS

            // Contar tipos de productos
            List<DetallePedido> detalles = detallePedidoRepository.findByPedidoIdPedidos(pedido.getIdPedidos());
            pedidoMap.put("tiposProductos", detalles.size());

            // ✅ AGREGAR NOMBRE DEL CLIENTE
            if (pedido.getCliente() != null) {
                pedidoMap.put("cliente", pedido.getCliente().getNombre() + " " + pedido.getCliente().getApellido());
            }

            return pedidoMap;
        }).collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> obtenerDetallesPedido(Integer idPedido) {
        // Buscar el pedido
        Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        // Buscar los detalles del pedido
        List<DetallePedido> detalles = detallePedidoRepository.findByPedidoIdPedidos(idPedido);

        // Crear lista de productos con su información
        List<Map<String, Object>> productos = detalles.stream().map(detalle -> {
            Map<String, Object> productoMap = new HashMap<>();
            productoMap.put("nombre", detalle.getProducto().getNombre());
            productoMap.put("categoria", detalle.getProducto().getCategoria().toString());
            productoMap.put("cantidad", detalle.getCantidad());
            return productoMap;
        }).collect(Collectors.toList());

        // Crear mapa con toda la información
        Map<String, Object> resultado = new HashMap<>();
        resultado.put("idPedido", pedido.getIdPedidos());
        resultado.put("productos", productos);
        resultado.put("cantidadTotal", pedido.getCantidadTotal());

        // ✅ AGREGAR INFORMACIÓN DEL CLIENTE
        if (pedido.getCliente() != null) {
            resultado.put("clienteNombre", pedido.getCliente().getNombre() + " " + pedido.getCliente().getApellido());
            resultado.put("clienteTelefono", pedido.getCliente().getTelefono());
        }

        // ✅ AGREGAR DIRECCIÓN Y COMENTARIO
        resultado.put("direccion", pedido.getDireccion());
        resultado.put("detalleCliente", pedido.getDetalleCliente());

        return resultado;
    }

    @Override
    public void marcarPedidoListo(Integer idPedido) {
        // Buscar el pedido
        Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        // Verificar que esté en alistamiento
        if (pedido.getEstado() != EstadoPedido.EN_ALISTAMIENTO) {
            throw new RuntimeException("El pedido no está en alistamiento");
        }

        // Cambiar estado a LISTO
        pedido.setEstado(EstadoPedido.LISTO);

        // Guardar cambios
        pedidoRepository.save(pedido);
    }
}