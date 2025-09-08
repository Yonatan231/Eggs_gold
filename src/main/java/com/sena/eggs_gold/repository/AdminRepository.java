package com.sena.eggs_gold.repository;


import com.sena.eggs_gold.model.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminRepository extends JpaRepository<Admin, Integer> {
}
