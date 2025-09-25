package com.sena.eggs_gold.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.sena.eggs_gold.model.entity.Producto;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Integer> {
}