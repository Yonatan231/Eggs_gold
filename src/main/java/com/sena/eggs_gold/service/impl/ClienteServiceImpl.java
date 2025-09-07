package com.sena.eggs_gold.service.impl;

import com.sena.eggs_gold.dto.ClienteDTO;
import com.sena.eggs_gold.model.entity.Cliente;
import com.sena.eggs_gold.model.entity.Rol;
import com.sena.eggs_gold.repository.ClienteRepository;
import com.sena.eggs_gold.repository.RolRepository;
import com.sena.eggs_gold.service.ClienteService;
import org.springframework.stereotype.Service;

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
        cliente.setTelefono(dto.getTelefono());
        cliente.setPassword(dto.getPassword());

        Rol rol = rolRepository.findById(4)
                .orElseThrow(() -> new RuntimeException("Rol por defecto (ID 4) no encontrado"));
        cliente.setRol(rol);


        Cliente guardado = clienteRepository.save(cliente);

    }

    public ClienteDTO login(String numDocumento, String password){
        return clienteRepository.findByNumDocumentoAndPassword(numDocumento, password)
                .map(cliente->{
                    ClienteDTO dto = new ClienteDTO();
                    dto.setIdUsuarios(cliente.getIdUsuarios().toString());
                    dto.setNumDocumento(cliente.getNumDocumento());
                    dto.setPassword(cliente.getPassword());
                    return dto;
                })
                .orElse(null);

    }
}
