package com.sena.eggs_gold.repository;

import com.sena.eggs_gold.model.entity.Conductor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ConductorRepository extends JpaRepository<Conductor, Integer> {

    Optional<Conductor> findByNumDocumentoAndPassword(String numDocumento, String password);
}
