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
import org.mindrot.jbcrypt.BCrypt;
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
        // paso 1: buscar logistica solo por numero de documento
        return logisticaRepository.findByNumDocumento(numDocumento)
                .map(logistica -> {
                    // paso 2: verificar que el usuario este activo
                    if (logistica.getEstado() != EstadoUsuario.ACTIVO) {
                        return null;
                    }

                    // paso 3: validar la contrasena usando bcrypt
                    // bcrypt.checkpw compara la contrasena en texto plano con la hasheada
                    boolean passwordCorrecta = BCrypt.checkpw(password, logistica.getPassword());

                    if (!passwordCorrecta) {
                        return null;
                    }

                    // paso 4: si todo esta bien, crear y retornar el dto
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
        // crear nueva instancia de logistica
        Logistica logistica = new Logistica();
        logistica.setNombre(dto.getNombre());
        logistica.setApellido(dto.getApellido());
        logistica.setDireccionUsuario(dto.getDireccionUsuario());
        logistica.setNumDocumento(dto.getNumDocumento());
        logistica.setTelefono(dto.getTelefono());
        logistica.setCorreo(dto.getCorreo());

        // hashear la contrasena antes de guardarla
        // bcrypt.gensalt() genera una sal aleatoria para mayor seguridad
        String passwordHasheada = BCrypt.hashpw(dto.getPassword(), BCrypt.gensalt());
        logistica.setPassword(passwordHasheada);

        logistica.setEdad(dto.getEdad());

        // asignar estado como activo
        logistica.setEstado(EstadoUsuario.ACTIVO);

        // asignar tipo de documento por defecto cedula ciudadania
        logistica.setTipoDocumento(TipoDocumento.CC);

        // asignar fecha de registro con la fecha actual
        logistica.setFechaRegistro(LocalDate.now());

        // asignar el rol de logistica id 2
        Rol rol = rolRepository.findById(2)
                .orElseThrow(() -> new RuntimeException("Rol Logistica no encontrado"));
        logistica.setRol(rol);

        // guardar en la base de datos
        logisticaRepository.save(logistica);
    }

    // obtener pedidos pendientes
    @Override
    public List<Map<String, Object>> obtenerPedidosPendientes() {
        // buscar pedidos con estado pendiente ordenados por fecha de creacion
        List<Pedido> pedidos = pedidoRepository.findByEstadoOrderByFechaCreacionDesc(EstadoPedido.PENDIENTE);

        // convertir cada pedido a un map con la informacion necesaria
        return pedidos.stream().map(pedido -> {
            Map<String, Object> pedidoMap = new HashMap<>();
            pedidoMap.put("idPedido", pedido.getIdPedidos());
            pedidoMap.put("cantidadTotal", pedido.getCantidadTotal());
            pedidoMap.put("fechaCreacion", pedido.getFechaCreacion());

            // contar tipos de productos diferentes
            List<DetallePedido> detalles = detallePedidoRepository.findByPedidoIdPedidos(pedido.getIdPedidos());
            pedidoMap.put("tiposProductos", detalles.size());

            return pedidoMap;
        }).collect(Collectors.toList());
    }

    @Override
    public void tomarPedido(Integer idPedido, Integer idLogistica) {
        // buscar el pedido
        Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        // verificar que el pedido este en estado pendiente
        if (pedido.getEstado() != EstadoPedido.PENDIENTE) {
            throw new RuntimeException("El pedido no esta pendiente");
        }

        // buscar el usuario de logistica
        Usuario logistica = usuarioRepository.findById(idLogistica)
                .orElseThrow(() -> new RuntimeException("Usuario de logistica no encontrado"));

        // asignar logistica al pedido y cambiar estado
        pedido.setLogistica(logistica);
        pedido.setEstado(EstadoPedido.EN_ALISTAMIENTO);

        // guardar cambios
        pedidoRepository.save(pedido);
    }

    @Override
    public List<Map<String, Object>> obtenerPedidosEnAlistamiento(Integer idLogistica) {
        // buscar pedidos que esten en alistamiento o listo y asignados a este usuario
        List<Pedido> pedidos = pedidoRepository.findAll().stream()
                .filter(p -> (p.getEstado() == EstadoPedido.EN_ALISTAMIENTO
                        || p.getEstado() == EstadoPedido.LISTO)
                        && p.getLogistica() != null
                        && p.getLogistica().getIdUsuarios().equals(idLogistica))
                .collect(Collectors.toList());

        // convertir a map
        return pedidos.stream().map(pedido -> {
            Map<String, Object> pedidoMap = new HashMap<>();
            pedidoMap.put("idPedido", pedido.getIdPedidos());
            pedidoMap.put("cantidadTotal", pedido.getCantidadTotal());
            pedidoMap.put("fechaCreacion", pedido.getFechaCreacion());
            pedidoMap.put("estado", pedido.getEstado().toString());

            // contar tipos de productos
            List<DetallePedido> detalles = detallePedidoRepository.findByPedidoIdPedidos(pedido.getIdPedidos());
            pedidoMap.put("tiposProductos", detalles.size());

            // agregar nombre del cliente
            if (pedido.getCliente() != null) {
                pedidoMap.put("cliente", pedido.getCliente().getNombre() + " " + pedido.getCliente().getApellido());
            }

            return pedidoMap;
        }).collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> obtenerDetallesPedido(Integer idPedido) {
        // buscar el pedido
        Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        // buscar los detalles del pedido
        List<DetallePedido> detalles = detallePedidoRepository.findByPedidoIdPedidos(idPedido);

        // crear lista de productos con su informacion
        List<Map<String, Object>> productos = detalles.stream().map(detalle -> {
            Map<String, Object> productoMap = new HashMap<>();
            productoMap.put("nombre", detalle.getProducto().getNombre());
            productoMap.put("categoria", detalle.getProducto().getCategoria().toString());
            productoMap.put("cantidad", detalle.getCantidad());
            return productoMap;
        }).collect(Collectors.toList());

        // crear mapa con toda la informacion
        Map<String, Object> resultado = new HashMap<>();
        resultado.put("idPedido", pedido.getIdPedidos());
        resultado.put("productos", productos);
        resultado.put("cantidadTotal", pedido.getCantidadTotal());

        // agregar informacion del cliente
        if (pedido.getCliente() != null) {
            resultado.put("clienteNombre", pedido.getCliente().getNombre() + " " + pedido.getCliente().getApellido());
            resultado.put("clienteTelefono", pedido.getCliente().getTelefono());
        }

        // agregar direccion y comentario
        resultado.put("direccion", pedido.getDireccion());
        resultado.put("detalleCliente", pedido.getDetalleCliente());

        return resultado;
    }

    @Override
    public void marcarPedidoListo(Integer idPedido) {
        // buscar el pedido
        Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        // verificar que este en alistamiento
        if (pedido.getEstado() != EstadoPedido.EN_ALISTAMIENTO) {
            throw new RuntimeException("El pedido no esta en alistamiento");
        }

        // cambiar estado a listo
        pedido.setEstado(EstadoPedido.LISTO);

        // guardar cambios
        pedidoRepository.save(pedido);
    }
}