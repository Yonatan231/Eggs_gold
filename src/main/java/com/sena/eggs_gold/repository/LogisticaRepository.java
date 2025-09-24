package com.sena.eggs_gold.repository;

import com.sena.eggs_gold.model.entity.Logistica;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LogisticaRepository extends JpaRepository<Logistica, Integer> {

    Optional<Logistica> findByNumDocumentoAndPassword(String numDocumento, String password);
}


