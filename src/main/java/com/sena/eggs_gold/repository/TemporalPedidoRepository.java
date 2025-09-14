package com.sena.eggs_gold.repository;

import com.sena.eggs_gold.dto.CarritoTemporalDTO;
import com.sena.eggs_gold.model.entity.Producto;
import com.sena.eggs_gold.model.entity.TemporalPedido;
import com.sena.eggs_gold.model.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Optional;


public interface TemporalPedidoRepository extends JpaRepository<TemporalPedido, Integer> {
    List<TemporalPedido> findByUsuarioAndConfirmado(Usuario usuario,  Boolean confirmado);
    Optional<TemporalPedido> findByUsuarioAndProductoAndConfirmado(Usuario usuario, Producto producto,Boolean confirmado);



        @Query("""
        SELECT new com.sena.eggs_gold.dto.CarritoTemporalDTO(
            tp.id, p.idProducto, tp.cantidad, p.nombre, p.precio
        )
        FROM TemporalPedido tp
        JOIN tp.producto p
        WHERE tp.usuario.id = :usuarioId AND tp.confirmado = false
    """)
        List<CarritoTemporalDTO> obtenerCarritoPorUsuario(@Param("usuarioId") Integer usuarioId);
    }


