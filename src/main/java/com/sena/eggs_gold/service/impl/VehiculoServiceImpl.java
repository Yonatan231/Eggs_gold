package com.sena.eggs_gold.service.impl;

import com.sena.eggs_gold.dto.VehiculoDTO;
import com.sena.eggs_gold.dto.VehiculoResponseDTO;
import com.sena.eggs_gold.model.entity.VehiculoMapper;
import com.sena.eggs_gold.model.entity.Conductor;
import com.sena.eggs_gold.model.entity.Vehiculo;
import com.sena.eggs_gold.model.enums.EstadoUsuario;
import com.sena.eggs_gold.repository.ConductorRepository;
import com.sena.eggs_gold.repository.VehiculoRepository;
import com.sena.eggs_gold.service.VehiculoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class VehiculoServiceImpl implements VehiculoService {

    @Autowired
    private VehiculoRepository vehiculoRepository;

    @Autowired
    private ConductorRepository conductorRepository;

    @Autowired
    private VehiculoMapper vehiculoMapper;

    @Override
    @Transactional
    public VehiculoResponseDTO registrarVehiculo(VehiculoDTO dto, Integer idConductor) {
        if (vehiculoRepository.existsByPlaca(dto.getPlaca())) {
            return null;
        }

        Conductor conductor = conductorRepository.findById(idConductor)
                .orElseThrow(() -> new RuntimeException("Conductor no encontrado"));

        int vehiculosActivos = vehiculoRepository.countByUsuarioIdUsuariosAndEstado(
                idConductor, EstadoUsuario.ACTIVO);

        EstadoUsuario estadoNuevo;
        if (vehiculosActivos > 0) {
            estadoNuevo = EstadoUsuario.INACTIVO;
        } else {
            estadoNuevo = EstadoUsuario.ACTIVO;
        }

        Vehiculo vehiculo = new Vehiculo();
        vehiculo.setPlaca(dto.getPlaca());
        vehiculo.setColor(dto.getColor());
        vehiculo.setModelo(dto.getModelo());
        vehiculo.setMarca(dto.getMarca());
        vehiculo.setCapacidadCarga(dto.getCapacidadCarga());
        vehiculo.setKilometraje(dto.getKilometraje());
        vehiculo.setFechaRegistro(LocalDate.now());
        vehiculo.setEstado(estadoNuevo);
        vehiculo.setUsuario(conductor);

        Vehiculo vehiculoGuardado = vehiculoRepository.save(vehiculo);

        return vehiculoMapper.toResponseDTO(vehiculoGuardado);
    }

    @Override
    public List<VehiculoResponseDTO> listarVehiculosPorConductor(Integer idConductor) {
        List<Vehiculo> vehiculos = vehiculoRepository.findByUsuarioIdUsuarios(idConductor);

        return vehiculoMapper.toResponseDTOList(vehiculos);
    }

    @Override
    @Transactional
    public VehiculoResponseDTO actualizarVehiculo(Integer idVehiculo, VehiculoDTO dto, Integer idConductor) {
        Vehiculo vehiculo = vehiculoRepository.findById(idVehiculo)
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado"));

        if (!vehiculo.getUsuario().getIdUsuarios().equals(idConductor)) {
            throw new RuntimeException("No tienes permiso para actualizar este vehículo");
        }

        if (!vehiculo.getPlaca().equals(dto.getPlaca())) {
            if (vehiculoRepository.existsByPlacaAndIdVehiculosNot(dto.getPlaca(), idVehiculo)) {
                return null;
            }
        }

        if (dto.getKilometraje() < vehiculo.getKilometraje()) {
            throw new RuntimeException("El kilometraje no puede ser menor al actual");
        }

        vehiculo.setPlaca(dto.getPlaca());
        vehiculo.setColor(dto.getColor());
        vehiculo.setModelo(dto.getModelo());
        vehiculo.setMarca(dto.getMarca());
        vehiculo.setCapacidadCarga(dto.getCapacidadCarga());
        vehiculo.setKilometraje(dto.getKilometraje());

        Vehiculo vehiculoActualizado = vehiculoRepository.save(vehiculo);

        return vehiculoMapper.toResponseDTO(vehiculoActualizado);
    }

    @Override
    public VehiculoResponseDTO buscarPorId(Integer idVehiculo) {
        Vehiculo vehiculo = vehiculoRepository.findById(idVehiculo)
                .orElse(null);

        return vehiculoMapper.toResponseDTO(vehiculo);
    }

    @Override
    @Transactional
    public VehiculoResponseDTO cambiarEstado(Integer idVehiculo, Integer idConductor) {
        Vehiculo vehiculo = vehiculoRepository.findById(idVehiculo)
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado"));

        if (!vehiculo.getUsuario().getIdUsuarios().equals(idConductor)) {
            throw new RuntimeException("No tienes permiso para cambiar este vehículo");
        }

        if (vehiculo.getEstado() == EstadoUsuario.INACTIVO) {
            vehiculoRepository.desactivarTodosLosVehiculos(idConductor);

            vehiculo.setEstado(EstadoUsuario.ACTIVO);
        } else {
            vehiculo.setEstado(EstadoUsuario.INACTIVO);
        }

        Vehiculo vehiculoActualizado = vehiculoRepository.save(vehiculo);

        return vehiculoMapper.toResponseDTO(vehiculoActualizado);
    }
}