package com.sena.eggs_gold.repository;

import com.sena.eggs_gold.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends  JpaRepository<Usuario,Integer>{
}
