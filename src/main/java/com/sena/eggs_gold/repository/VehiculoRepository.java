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

    // Validar que no exista un vehículo con la misma placa
    boolean existsByPlaca(String placa);

    // Validar que no exista otra placa al actualizar (excluyendo el vehículo actual)
    boolean existsByPlacaAndIdVehiculosNot(String placa, Integer idVehiculo);

    // Buscar todos los vehículos de un conductor específico
    List<Vehiculo> findByUsuarioIdUsuarios(Integer idConductor);

    // Buscar vehículos por estado de un conductor
    List<Vehiculo> findByUsuarioIdUsuariosAndEstado(Integer idConductor, EstadoUsuario estado);

    // Contar cuántos vehículos ACTIVOS tiene un conductor
    int countByUsuarioIdUsuariosAndEstado(Integer idConductor, EstadoUsuario estado);

    // Desactivar todos los vehículos de un conductor (antes de activar uno nuevo)
    @Modifying
    @Transactional
    @Query("UPDATE Vehiculo v SET v.estado = 'INACTIVO' WHERE v.usuario.idUsuarios = :idConductor")
    void desactivarTodosLosVehiculos(@Param("idConductor") Integer idConductor);
}