package com.sena.eggs_gold.repository;


import com.sena.eggs_gold.model.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin, Integer> {
    Optional<Admin> findByNumDocumentoAndPassword(String numDocumento, String password);
}
