package com.sena.eggs_gold.repository;

import com.sena.eggs_gold.model.entity.Logistica;
import com.sena.eggs_gold.dto.LogisticaDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface LogisticaRepository extends JpaRepository<Logistica, Integer> {

    Optional<Logistica> findByNumDocumento(String numDocumento);

    @Query("SELECT l FROM Logistica l WHERE l.estado = 'ACTIVO'")
    List<Logistica> findAllActivos();
}