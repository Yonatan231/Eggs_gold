package com.sena.eggs_gold.repository;

import com.sena.eggs_gold.model.entity.Vehiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VehiculoRepository extends JpaRepository<Vehiculo, Integer> {

    // Validar que no exista un vehículo con la misma placa
    boolean existsByPlaca(String placa);
}

