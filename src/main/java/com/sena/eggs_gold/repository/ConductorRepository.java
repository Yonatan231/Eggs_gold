package com.sena.eggs_gold.repository;

import com.sena.eggs_gold.model.entity.Conductor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ConductorRepository extends JpaRepository<Conductor, Integer> {

    Optional<Conductor> findByNumDocumentoAndPassword(String numDocumento, String password);


}
