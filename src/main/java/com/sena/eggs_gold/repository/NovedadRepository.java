package com.sena.eggs_gold.repository;

import com.sena.eggs_gold.model.entity.Novedad;
import com.sena.eggs_gold.model.enums.EstadoNovedad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NovedadRepository extends JpaRepository<Novedad, Integer> {

    List<Novedad> findAllByOrderByFechaCreacionDesc();

    List<Novedad> findByEstadoOrderByFechaCreacionDesc(EstadoNovedad estado);

    List<Novedad> findByUsuarioIdUsuariosOrderByFechaCreacionDesc(Integer idUsuario);

    List<Novedad> findByPedidoIdPedidosOrderByFechaCreacionDesc(Integer idPedido);

    long countByEstado(EstadoNovedad estado);
}