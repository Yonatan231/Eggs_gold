package com.sena.eggs_gold.service.impl;

import com.sena.eggs_gold.dto.PedidoDTO;
import com.sena.eggs_gold.model.entity.Pedido;
import com.sena.eggs_gold.model.entity.Usuario;
import com.sena.eggs_gold.model.enums.EstadoPedido;
import com.sena.eggs_gold.repository.PedidoRepository;
import com.sena.eggs_gold.repository.UsuarioRepository;
import com.sena.eggs_gold.service.PedidoService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PedidoServiceImpl implements PedidoService {

    @Autowired
    UsuarioRepository usuarioRepository;
    private final PedidoRepository pedidoRepository;

    public PedidoServiceImpl(PedidoRepository pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }

    @Override
    @Transactional
    public List<PedidoDTO> obtenerPedidosPorRol(String rol, EstadoPedido estado) {
        List<Pedido> pedidos;

        if ("ADMIN".equalsIgnoreCase(rol)) {
            // Administrador ve todos los pedidos
            pedidos = pedidoRepository.findAllByOrderByFechaCreacionDesc();
        } else if ("LOGISTICA".equalsIgnoreCase(rol)) {
            // Logística solo ve pedidos aprobados
            pedidos = pedidoRepository.findByEstado(EstadoPedido.APROBADO);
        } else {
            // Otros roles no ven pedidos
            pedidos = List.of();
        }

        // Filtrado opcional por estado
        if (estado != null && estado != EstadoPedido.PENDIENTE) {
            pedidos = pedidos.stream()
                    .filter(p -> p.getEstado() == estado)
                    .toList();
        }

        // Convertir a DTO
        return pedidos.stream().map(p -> {
            List<String> productos = p.getVentas().stream()
                    .map(v -> v.getProducto().getNombre() + " (x" + v.getCantidad() + ")")
                    .toList();

            return new PedidoDTO(
                    p.getIdPedidos(),
                    p.getUsuario().getNombre(),
                    productos,
                    p.getDireccion(),
                    p.getEstado().getDescripcion(),
                    p.getFechaCreacion(),
                    p.getTotal()
            );
        }).toList();
    }
    @Override
    public boolean aprobarPedido(Integer idPedidos) {
        Pedido pedido = pedidoRepository.findById(idPedidos)
                .orElseThrow(() -> new EntityNotFoundException("Pedido no encontrado"));

        pedido.setEstado(EstadoPedido.APROBADO);
        pedidoRepository.save(pedido);

        return true;
    }

    @Override
    public boolean actualizarEstado(Integer idPedido, EstadoPedido nuevoEstado) {
        Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new EntityNotFoundException("Pedido no encontrado"));

        pedido.setEstado(nuevoEstado);

        if (nuevoEstado == EstadoPedido.ENTREGADO) {
            pedido.setFechaEntrega(LocalDateTime.now());
        }

        pedidoRepository.save(pedido);
        return true;
    }

    @Transactional
    @Override
    public boolean asignarPedido(Integer pedidoId, Integer conductorId) {
        Usuario conductor = usuarioRepository.findById(conductorId)
                .filter(u -> u.getRol().getIdRoles() == 3)
                .orElse(null);

        if (conductor == null) return false;

        pedidoRepository.asignarConductor(pedidoId, conductorId);
        return true;
    }
}



