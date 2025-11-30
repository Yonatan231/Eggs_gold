// ===== ConductorServiceImpl.java =====
package com.sena.eggs_gold.service.impl;

import com.sena.eggs_gold.dto.ConductorDTO;
import com.sena.eggs_gold.model.entity.Conductor;
import com.sena.eggs_gold.model.entity.Pedido;
import com.sena.eggs_gold.model.entity.DetallePedido;
import com.sena.eggs_gold.model.entity.Rol;
import com.sena.eggs_gold.model.enums.EstadoPedido;
import com.sena.eggs_gold.model.enums.EstadoUsuario;
import com.sena.eggs_gold.model.enums.TipoDocumento;
import com.sena.eggs_gold.repository.ConductorRepository;
import com.sena.eggs_gold.repository.PedidoRepository;
import com.sena.eggs_gold.repository.DetallePedidoRepository;
import com.sena.eggs_gold.repository.RolRepository;
import com.sena.eggs_gold.repository.UsuarioRepository;
import com.sena.eggs_gold.service.ConductorService;
import com.sena.eggs_gold.service.EmailService; // ✅ IMPORTAR
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
public class ConductorServiceImpl implements ConductorService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    // ✅ INYECTAR EmailService
    @Autowired
    private EmailService emailService;

    private final ConductorRepository conductorRepository;
    private final RolRepository rolRepository;
    private final PedidoRepository pedidoRepository;
    private final DetallePedidoRepository detallePedidoRepository;

    public ConductorServiceImpl(ConductorRepository conductorRepository,
                                RolRepository rolRepository,
                                PedidoRepository pedidoRepository,
                                DetallePedidoRepository detallePedidoRepository) {
        this.conductorRepository = conductorRepository;
        this.rolRepository = rolRepository;
        this.pedidoRepository = pedidoRepository;
        this.detallePedidoRepository = detallePedidoRepository;
    }

    @Override
    public void registrarConductor(ConductorDTO dto) {
        Conductor conductor = new Conductor();
        conductor.setNombre(dto.getNombre());
        conductor.setApellido(dto.getApellido());
        conductor.setDireccionUsuario(dto.getDireccionUsuario());
        conductor.setNumDocumento(dto.getNumDocumento());
        conductor.setTelefono(dto.getTelefono());
        conductor.setCorreo(dto.getCorreo());
        conductor.setPassword(dto.getPassword());
        conductor.setEdad(dto.getEdad()); // ✅ Mapear edad
        conductor.setFechaRegistro(LocalDate.now());
        conductor.setEstado(EstadoUsuario.ACTIVO);

        if (dto.getTipoDocumento() != null) {
            conductor.setTipoDocumento(dto.getTipoDocumento());
        } else {
            conductor.setTipoDocumento(TipoDocumento.CC);
        }

        Rol rol = rolRepository.findById(3)
                .orElseThrow(() -> new RuntimeException("Rol Conductor no encontrado"));
        conductor.setRol(rol);

        conductorRepository.save(conductor);
    }

    @Override
    public ConductorDTO login(String numDocumento, String password) {
        return conductorRepository.findByNumDocumentoAndPassword(numDocumento, password)
                .map(conductor -> {
                    // Verificar que el usuario esté ACTIVO
                    if (conductor.getEstado() != EstadoUsuario.ACTIVO) {
                        return null; // No permitir login si está inactivo
                    }

                    ConductorDTO dto = new ConductorDTO();
                    dto.setIdUsuarios(conductor.getIdUsuarios());
                    dto.setNombre(conductor.getNombre());
                    dto.setApellido(conductor.getApellido());
                    dto.setDireccionUsuario(conductor.getDireccionUsuario());
                    dto.setNumDocumento(conductor.getNumDocumento());
                    dto.setTelefono(conductor.getTelefono());
                    dto.setCorreo(conductor.getCorreo());
                    dto.setPassword(conductor.getPassword());
                    dto.setFechaRegistro(conductor.getFechaRegistro());
                    return dto;
                })
                .orElse(null);
    }

    @Override
    public List<ConductorDTO> obtenerConductoresConPedidosEntregados() {
        return usuarioRepository.findConductoresConPedidosEntregados();
    }

    @Override
    public List<Map<String, Object>> obtenerPedidosAsignados(Integer idConductor) {
        List<Pedido> pedidos = pedidoRepository
                .findByConductorIdUsuariosAndEstadoOrderByFechaCreacionDesc(idConductor, EstadoPedido.ASIGNADO);

        return pedidos.stream().map(this::convertirPedidoAMap).collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> obtenerPedidosEnCamino(Integer idConductor) {
        List<Pedido> pedidos = pedidoRepository
                .findByConductorIdUsuariosAndEstado(idConductor, EstadoPedido.EN_CAMINO);

        return pedidos.stream().map(this::convertirPedidoAMap).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void aceptarPedido(Integer idPedido, Integer idConductor) {
        Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        // Validar que el pedido esté asignado a este conductor
        if (pedido.getConductor() == null ||
                !pedido.getConductor().getIdUsuarios().equals(idConductor)) {
            throw new RuntimeException("Este pedido no está asignado a ti");
        }

        // Validar estado
        if (pedido.getEstado() != EstadoPedido.ASIGNADO) {
            throw new RuntimeException("El pedido debe estar en estado ASIGNADO");
        }

        // Cambiar estado a EN_CAMINO
        pedido.setEstado(EstadoPedido.EN_CAMINO);
        pedidoRepository.save(pedido);
    }

    // ===== ConductorServiceImpl.java =====
// Solo modifico el método marcarPedidoEntregado()

    @Override
    @Transactional
    public void marcarPedidoEntregado(Integer idPedido, Integer idConductor, String observacion) {
        Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        // Validar que el pedido esté asignado a este conductor
        if (pedido.getConductor() == null ||
                !pedido.getConductor().getIdUsuarios().equals(idConductor)) {
            throw new RuntimeException("Este pedido no está asignado a ti");
        }

        // Validar estado
        if (pedido.getEstado() != EstadoPedido.EN_CAMINO) {
            throw new RuntimeException("El pedido debe estar EN_CAMINO");
        }

        // Cambiar estado a ENTREGADO y registrar fecha
        pedido.setEstado(EstadoPedido.ENTREGADO);
        pedido.setFechaEntrega(LocalDateTime.now());

        if (observacion != null && !observacion.trim().isEmpty()) {
            pedido.setObservacionConductor(observacion);
        }

        pedidoRepository.save(pedido);

        // ✅ FORZAR CARGA DE RELACIONES (antes del método asíncrono)
        // Esto carga los datos mientras la sesión de Hibernate está abierta
        pedido.getCliente().getCorreo();
        pedido.getCliente().getNombre();
        pedido.getCliente().getApellido();
        pedido.getConductor().getNombre();
        pedido.getConductor().getApellido();

        // ✅ AHORA SÍ: Enviar correo de confirmación de entrega (asíncrono)
        // El objeto pedido ya tiene todos los datos cargados
        emailService.enviarCorreoEntregaPedido(pedido);
    }

    @Override
    public List<Map<String, Object>> obtenerHistorialPedidos(Integer idConductor) {
        List<Pedido> pedidos = pedidoRepository
                .findByConductorIdUsuariosAndEstadoOrderByFechaEntregaDesc(idConductor, EstadoPedido.ENTREGADO);

        return pedidos.stream().map(pedido -> {
            Map<String, Object> map = convertirPedidoAMap(pedido);
            map.put("fechaEntrega", pedido.getFechaEntrega());
            return map;
        }).collect(Collectors.toList());
    }

    // Método auxiliar: Convertir pedido a Map
    private Map<String, Object> convertirPedidoAMap(Pedido pedido) {
        Map<String, Object> map = new HashMap<>();
        map.put("idPedido", pedido.getIdPedidos());
        map.put("fechaCreacion", pedido.getFechaCreacion());
        map.put("direccion", pedido.getDireccion());
        map.put("detalleCliente", pedido.getDetalleCliente());
        map.put("cantidadTotal", pedido.getCantidadTotal());
        map.put("estado", pedido.getEstado().toString());
        map.put("observacionConductor", pedido.getObservacionConductor());

        // Datos del cliente
        if (pedido.getCliente() != null) {
            map.put("clienteNombre", pedido.getCliente().getNombre() + " " + pedido.getCliente().getApellido());
            map.put("clienteTelefono", pedido.getCliente().getTelefono());
        }

        // Contar tipos de productos
        List<DetallePedido> detalles = detallePedidoRepository.findByPedidoIdPedidos(pedido.getIdPedidos());
        map.put("tiposProductos", detalles.size());

        return map;
    }
}