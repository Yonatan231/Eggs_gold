package com.sena.eggs_gold.repository;

import com.sena.eggs_gold.model.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Integer>{

    Optional<Cliente> findByNumDocumentoAndPassword(String numDocumento, String password);
    Optional<Cliente> findByNumDocumento(String numDocumento);
    boolean existsByNumDocumento(String numDocumento);

}
