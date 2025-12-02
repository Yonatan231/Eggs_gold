package com.sena.eggs_gold.repository;

import com.sena.eggs_gold.model.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin, Integer> {

    // buscar admin solo por numero de documento
    // ya no buscamos por password porque ahora esta hasheada
    Optional<Admin> findByNumDocumento(String numDocumento);
}