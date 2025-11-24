package com.sena.eggs_gold.repository;

import com.sena.eggs_gold.model.entity.Novedad;
import com.sena.eggs_gold.model.enums.EstadoNovedad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio para gestionar operaciones CRUD de Novedades
 * Permite consultar novedades por estado, usuario y pedido
 */
@Repository
public interface NovedadRepository extends JpaRepository<Novedad, Integer> {

    // Buscar todas las novedades ordenadas por fecha de creación (más recientes primero)
    List<Novedad> findAllByOrderByFechaCreacionDesc();

    // Buscar novedades por estado
    List<Novedad> findByEstadoOrderByFechaCreacionDesc(EstadoNovedad estado);

    // Buscar novedades por usuario
    List<Novedad> findByUsuarioIdUsuariosOrderByFechaCreacionDesc(Integer idUsuario);

    // Buscar novedades por pedido
    List<Novedad> findByPedidoIdPedidosOrderByFechaCreacionDesc(Integer idPedido);

    // Contar novedades pendientes (para el contador de la campanita)
    long countByEstado(EstadoNovedad estado);
}