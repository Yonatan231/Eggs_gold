package com.sena.eggs_gold.service.impl;

import com.sena.eggs_gold.dto.DashboardStatsDTO;
import com.sena.eggs_gold.repository.PedidoRepository;
import com.sena.eggs_gold.repository.ProductoRepository;
import com.sena.eggs_gold.repository.UsuarioRepository;
import com.sena.eggs_gold.service.DashboardService;
import org.springframework.stereotype.Service;

@Service
public class DashboardServiceImpl implements DashboardService {

    private final UsuarioRepository usuarioRepository;
    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;

    public DashboardServiceImpl(UsuarioRepository usuarioRepository,
                                PedidoRepository pedidoRepository,
                                ProductoRepository productoRepository) {
        this.usuarioRepository = usuarioRepository;
        this.pedidoRepository = pedidoRepository;
        this.productoRepository = productoRepository;
    }

    @Override
    public DashboardStatsDTO obtenerEstadisticas() {
        long totalUsuarios = usuarioRepository.countByRolId(4); // Clientes
        double totalVentas = pedidoRepository.sumTotalByFechaActual(); // Método custom en PedidoRepository
        long totalProductos = productoRepository.count();

        return new DashboardStatsDTO(totalUsuarios, totalVentas, totalProductos);
    }
}
