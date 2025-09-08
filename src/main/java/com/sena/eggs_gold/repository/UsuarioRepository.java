package com.sena.eggs_gold.repository;

import com.sena.eggs_gold.model.entity.Usuario;
import com.sena.eggs_gold.model.enums.TipoDocumento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario,Integer> {
    Optional<Usuario> findByNombre(String nombre);

    boolean existsByNumDocumento(String numDocumento);

}
