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
        return logisticaRepository.findByNumDocumento(numDocumento)
                .map(logistica -> {
                    if (logistica.getEstado() != EstadoUsuario.ACTIVO) {
                        return null;
                    }

                    boolean passwordCorrecta = BCrypt.checkpw(password, logistica.getPassword());

                    if (!passwordCorrecta) {
                        return null;
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
        Logistica logistica = new Logistica();
        logistica.setNombre(dto.getNombre());
        logistica.setApellido(dto.getApellido());
        logistica.setDireccionUsuario(dto.getDireccionUsuario());
        logistica.setNumDocumento(dto.getNumDocumento());
        logistica.setTelefono(dto.getTelefono());
        logistica.setCorreo(dto.getCorreo());

        String passwordHasheada = BCrypt.hashpw(dto.getPassword(), BCrypt.gensalt());
        logistica.setPassword(passwordHasheada);

        logistica.setEdad(dto.getEdad());

        logistica.setEstado(EstadoUsuario.ACTIVO);

        logistica.setTipoDocumento(TipoDocumento.CC);

        logistica.setFechaRegistro(LocalDate.now());

        Rol rol = rolRepository.findById(2)
                .orElseThrow(() -> new RuntimeException("Rol Logistica no encontrado"));
        logistica.setRol(rol);

        logisticaRepository.save(logistica);
    }

    @Override
    public List<Map<String, Object>> obtenerPedidosPendientes() {
        List<Pedido> pedidos = pedidoRepository.findByEstadoOrderByFechaCreacionDesc(EstadoPedido.PENDIENTE);

        return pedidos.stream().map(pedido -> {
            Map<String, Object> pedidoMap = new HashMap<>();
            pedidoMap.put("idPedido", pedido.getIdPedidos());
            pedidoMap.put("cantidadTotal", pedido.getCantidadTotal());
            pedidoMap.put("fechaCreacion", pedido.getFechaCreacion());

            if (pedido.getCliente() != null) {
                pedidoMap.put("cliente", pedido.getCliente().getNombre() + " " + pedido.getCliente().getApellido());
            }

            List<DetallePedido> detalles = detallePedidoRepository.findByPedidoIdPedidos(pedido.getIdPedidos());
            pedidoMap.put("tiposProductos", detalles.size());

            return pedidoMap;
        }).collect(Collectors.toList());
    }

    @Override
    public void tomarPedido(Integer idPedido, Integer idLogistica) {
        Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        if (pedido.getEstado() != EstadoPedido.PENDIENTE) {
            throw new RuntimeException("El pedido no esta pendiente");
        }

        Usuario logistica = usuarioRepository.findById(idLogistica)
                .orElseThrow(() -> new RuntimeException("Usuario de logistica no encontrado"));

        pedido.setLogistica(logistica);
        pedido.setEstado(EstadoPedido.EN_ALISTAMIENTO);

        pedidoRepository.save(pedido);
    }

    @Override
    public List<Map<String, Object>> obtenerPedidosEnAlistamiento(Integer idLogistica) {
        List<Pedido> pedidos = pedidoRepository.findAll().stream()
                .filter(p -> (p.getEstado() == EstadoPedido.EN_ALISTAMIENTO
                        || p.getEstado() == EstadoPedido.LISTO)
                        && p.getLogistica() != null
                        && p.getLogistica().getIdUsuarios().equals(idLogistica))
                .collect(Collectors.toList());

        return pedidos.stream().map(pedido -> {
            Map<String, Object> pedidoMap = new HashMap<>();
            pedidoMap.put("idPedido", pedido.getIdPedidos());
            pedidoMap.put("cantidadTotal", pedido.getCantidadTotal());
            pedidoMap.put("fechaCreacion", pedido.getFechaCreacion());
            pedidoMap.put("estado", pedido.getEstado().toString());

            List<DetallePedido> detalles = detallePedidoRepository.findByPedidoIdPedidos(pedido.getIdPedidos());
            pedidoMap.put("tiposProductos", detalles.size());

            if (pedido.getCliente() != null) {
                pedidoMap.put("cliente", pedido.getCliente().getNombre() + " " + pedido.getCliente().getApellido());
            }

            return pedidoMap;
        }).collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> obtenerDetallesPedido(Integer idPedido) {
        Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        List<DetallePedido> detalles = detallePedidoRepository.findByPedidoIdPedidos(idPedido);

        List<Map<String, Object>> productos = detalles.stream().map(detalle -> {
            Map<String, Object> productoMap = new HashMap<>();
            productoMap.put("nombre", detalle.getProducto().getNombre());
            productoMap.put("categoria", detalle.getProducto().getCategoria().toString());
            productoMap.put("cantidad", detalle.getCantidad());
            return productoMap;
        }).collect(Collectors.toList());

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("idPedido", pedido.getIdPedidos());
        resultado.put("productos", productos);
        resultado.put("cantidadTotal", pedido.getCantidadTotal());

        if (pedido.getCliente() != null) {
            resultado.put("clienteNombre", pedido.getCliente().getNombre() + " " + pedido.getCliente().getApellido());
            resultado.put("clienteTelefono", pedido.getCliente().getTelefono());
        }

        resultado.put("direccion", pedido.getDireccion());
        resultado.put("detalleCliente", pedido.getDetalleCliente());

        if (pedido.getFechaEntrega() != null) {
            resultado.put("fechaEntrega", pedido.getFechaEntrega());
        }

        resultado.put("observacionConductor", pedido.getObservacionConductor());

        return resultado;
    }

    @Override
    public void marcarPedidoListo(Integer idPedido) {
        Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        if (pedido.getEstado() != EstadoPedido.EN_ALISTAMIENTO) {
            throw new RuntimeException("El pedido no esta en alistamiento");
        }

        pedido.setEstado(EstadoPedido.LISTO);

        pedidoRepository.save(pedido);
    }
}