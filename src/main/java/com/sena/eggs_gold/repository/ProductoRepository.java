package com.sena.eggs_gold.repository;

import com.sena.eggs_gold.model.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepository extends JpaRepository<Producto, Integer> {
}
