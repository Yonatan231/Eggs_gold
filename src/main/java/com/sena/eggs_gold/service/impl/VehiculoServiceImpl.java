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
        // 1. Validar que la placa no exista
        if (vehiculoRepository.existsByPlaca(dto.getPlaca())) {
            return null; // Placa duplicada
        }

        // 2. Buscar el conductor
        Conductor conductor = conductorRepository.findById(idConductor)
                .orElseThrow(() -> new RuntimeException("Conductor no encontrado"));

        // 3. Contar cuántos vehículos ACTIVOS tiene el conductor
        int vehiculosActivos = vehiculoRepository.countByUsuarioIdUsuariosAndEstado(
                idConductor, EstadoUsuario.ACTIVO);

        // 4. Si ya tiene un vehículo activo, el nuevo será INACTIVO
        EstadoUsuario estadoNuevo;
        if (vehiculosActivos > 0) {
            estadoNuevo = EstadoUsuario.INACTIVO;
        } else {
            // Si no tiene ninguno activo, este será el primero ACTIVO
            estadoNuevo = EstadoUsuario.ACTIVO;
        }

        // 5. Crear el vehículo
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

        // 6. Guardar en BD
        Vehiculo vehiculoGuardado = vehiculoRepository.save(vehiculo);

        // 7. Convertir a DTO y retornar (SIN referencias circulares)
        return vehiculoMapper.toResponseDTO(vehiculoGuardado);
    }

    @Override
    public List<VehiculoResponseDTO> listarVehiculosPorConductor(Integer idConductor) {
        // Buscar todos los vehículos del conductor
        List<Vehiculo> vehiculos = vehiculoRepository.findByUsuarioIdUsuarios(idConductor);

        // Convertir a DTOs (SIN referencias circulares)
        return vehiculoMapper.toResponseDTOList(vehiculos);
    }

    @Override
    @Transactional
    public VehiculoResponseDTO actualizarVehiculo(Integer idVehiculo, VehiculoDTO dto, Integer idConductor) {
        // 1. Buscar el vehículo existente
        Vehiculo vehiculo = vehiculoRepository.findById(idVehiculo)
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado"));

        // 2. Verificar que el vehículo pertenece al conductor
        if (!vehiculo.getUsuario().getIdUsuarios().equals(idConductor)) {
            throw new RuntimeException("No tienes permiso para actualizar este vehículo");
        }

        // 3. Validar placa (si cambió, verificar que no exista otra igual)
        if (!vehiculo.getPlaca().equals(dto.getPlaca())) {
            if (vehiculoRepository.existsByPlacaAndIdVehiculosNot(dto.getPlaca(), idVehiculo)) {
                return null; // Placa duplicada
            }
        }

        // 4. Validar que el kilometraje no disminuya
        if (dto.getKilometraje() < vehiculo.getKilometraje()) {
            throw new RuntimeException("El kilometraje no puede ser menor al actual");
        }

        // 5. Actualizar los campos
        vehiculo.setPlaca(dto.getPlaca());
        vehiculo.setColor(dto.getColor());
        vehiculo.setModelo(dto.getModelo());
        vehiculo.setMarca(dto.getMarca());
        vehiculo.setCapacidadCarga(dto.getCapacidadCarga());
        vehiculo.setKilometraje(dto.getKilometraje());

        // 6. Guardar cambios
        Vehiculo vehiculoActualizado = vehiculoRepository.save(vehiculo);

        // 7. Convertir a DTO y retornar (SIN referencias circulares)
        return vehiculoMapper.toResponseDTO(vehiculoActualizado);
    }

    @Override
    public VehiculoResponseDTO buscarPorId(Integer idVehiculo) {
        Vehiculo vehiculo = vehiculoRepository.findById(idVehiculo)
                .orElse(null);

        // Convertir a DTO (SIN referencias circulares)
        return vehiculoMapper.toResponseDTO(vehiculo);
    }

    @Override
    @Transactional
    public VehiculoResponseDTO cambiarEstado(Integer idVehiculo, Integer idConductor) {
        // 1. Buscar el vehículo
        Vehiculo vehiculo = vehiculoRepository.findById(idVehiculo)
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado"));

        // 2. Verificar que pertenece al conductor
        if (!vehiculo.getUsuario().getIdUsuarios().equals(idConductor)) {
            throw new RuntimeException("No tienes permiso para cambiar este vehículo");
        }

        // 3. Si se está ACTIVANDO este vehículo
        if (vehiculo.getEstado() == EstadoUsuario.INACTIVO) {
            // Primero desactivar todos los vehículos del conductor
            vehiculoRepository.desactivarTodosLosVehiculos(idConductor);

            // Ahora activar este
            vehiculo.setEstado(EstadoUsuario.ACTIVO);
        } else {
            // Si se está desactivando, simplemente cambiar a INACTIVO
            vehiculo.setEstado(EstadoUsuario.INACTIVO);
        }

        // 4. Guardar cambios
        Vehiculo vehiculoActualizado = vehiculoRepository.save(vehiculo);

        // 5. Convertir a DTO y retornar (SIN referencias circulares)
        return vehiculoMapper.toResponseDTO(vehiculoActualizado);
    }
}