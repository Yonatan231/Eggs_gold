package com.sena.eggs_gold.repository;

import com.sena.eggs_gold.model.entity.Carrito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CarritoRepository extends JpaRepository<Carrito, Integer> {

    List<Carrito> findByUsuarioIdUsuariosAndConfirmado(Integer idUsuario, Boolean confirmado);

    Carrito findByUsuarioIdUsuariosAndProductoIdProductoAndConfirmado(
            Integer idUsuario,
            Integer idProducto,
            Boolean confirmado
    );

    Integer countByUsuarioIdUsuariosAndConfirmado(Integer idUsuario, Boolean confirmado);
}