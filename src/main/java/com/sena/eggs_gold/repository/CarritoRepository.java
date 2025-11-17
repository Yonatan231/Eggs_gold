package com.sena.eggs_gold.repository;

import com.sena.eggs_gold.model.entity.Carrito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CarritoRepository extends JpaRepository<Carrito, Integer> {

    // Buscar todos los productos del carrito de un usuario (no confirmados)
    List<Carrito> findByUsuarioIdUsuariosAndConfirmado(Integer idUsuario, Boolean confirmado);

    // Buscar un producto específico en el carrito de un usuario
    Carrito findByUsuarioIdUsuariosAndProductoIdProductoAndConfirmado(
            Integer idUsuario,
            Integer idProducto,
            Boolean confirmado
    );

    // Contar productos en el carrito
    Integer countByUsuarioIdUsuariosAndConfirmado(Integer idUsuario, Boolean confirmado);
}