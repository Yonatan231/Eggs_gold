package com.sena.eggs_gold.repository;

import com.sena.eggs_gold.model.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Integer>{

    // buscar cliente solo por numero de documento
    // ya no buscamos por password porque ahora esta hasheada
    Optional<Cliente> findByNumDocumento(String numDocumento);

    boolean existsByNumDocumento(String numDocumento);
}