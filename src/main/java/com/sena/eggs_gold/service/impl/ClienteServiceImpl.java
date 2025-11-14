package com.sena.eggs_gold.service.impl;

import com.sena.eggs_gold.dto.ClienteDTO;
import com.sena.eggs_gold.model.entity.Cliente;
import com.sena.eggs_gold.model.entity.Rol;
import com.sena.eggs_gold.model.enums.EstadoUsuario;
import com.sena.eggs_gold.model.enums.TipoDocumento;
import com.sena.eggs_gold.repository.ClienteRepository;
import com.sena.eggs_gold.repository.RolRepository;
import com.sena.eggs_gold.service.ClienteService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class ClienteServiceImpl implements ClienteService {

    private final ClienteRepository clienteRepository;
    private final RolRepository rolRepository;

    public ClienteServiceImpl(ClienteRepository clienteRepository, RolRepository rolRepository) {
        this.clienteRepository = clienteRepository;
        this.rolRepository = rolRepository;
    }


    @Override
    public void registrarCliente(ClienteDTO dto){
        Cliente cliente = new Cliente();

        cliente.setNombre(dto.getNombre());
        cliente.setApellido(dto.getApellido());
        cliente.setDireccionUsuario(dto.getDireccionUsuario());
        cliente.setNumDocumento(dto.getNumDocumento());
        cliente.setTelefono(dto.getTelefono());
        cliente.setCorreo(dto.getCorreo());
        cliente.setPassword(dto.getPassword());

        // ✅ CAMPO OBLIGATORIO: Asignar ESTADO como ACTIVO
        cliente.setEstado(EstadoUsuario.ACTIVO);

        // ✅ CAMPO OBLIGATORIO: Asignar TIPO_DOCUMENTO (por defecto CEDULA_CIUDADANIA)
        cliente.setTipoDocumento(TipoDocumento.CC);

        // ✅ CAMPO OBLIGATORIO: Asignar FECHA_REGISTRO con la fecha actual
        cliente.setFechaRegistro(LocalDate.now());

        // ✅ Asignar el ROL de Cliente (ID = 4)
        Rol rol = rolRepository.findById(4)
                .orElseThrow(() -> new RuntimeException("Rol por defecto (ID 4) no encontrado"));
        cliente.setRol(rol);

        // ✅ Guardar en la base de datos
        Cliente guardado = clienteRepository.save(cliente);
    }

    public ClienteDTO login(String numDocumento, String password){
        return clienteRepository.findByNumDocumentoAndPassword(numDocumento, password)
                .map(cliente->{
                    ClienteDTO dto = new ClienteDTO();
                    dto.setIdUsuarios(cliente.getIdUsuarios());
                    dto.setNombre(cliente.getNombre());
                    dto.setApellido(cliente.getApellido());
                    dto.setDireccionUsuario(cliente.getDireccionUsuario());
                    dto.setNumDocumento(cliente.getNumDocumento());
                    dto.setTelefono(cliente.getTelefono());
                    dto.setCorreo(cliente.getCorreo());
                    dto.setPassword(cliente.getPassword());

                    return dto;
                })
                .orElse(null);
    }
}