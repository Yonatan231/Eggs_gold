package com.sena.eggs_gold.repository;

import com.sena.eggs_gold.model.entity.Vehiculo;
import com.sena.eggs_gold.model.enums.EstadoUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface VehiculoRepository extends JpaRepository<Vehiculo, Integer> {

    boolean existsByPlaca(String placa);

    boolean existsByPlacaAndIdVehiculosNot(String placa, Integer idVehiculo);

    List<Vehiculo> findByUsuarioIdUsuarios(Integer idConductor);

    List<Vehiculo> findByUsuarioIdUsuariosAndEstado(Integer idConductor, EstadoUsuario estado);

    int countByUsuarioIdUsuariosAndEstado(Integer idConductor, EstadoUsuario estado);

    @Modifying
    @Transactional
    @Query("UPDATE Vehiculo v SET v.estado = 'INACTIVO' WHERE v.usuario.idUsuarios = :idConductor")
    void desactivarTodosLosVehiculos(@Param("idConductor") Integer idConductor);
}