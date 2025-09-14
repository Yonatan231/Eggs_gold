package com.sena.eggs_gold.service;

import com.sena.eggs_gold.dto.ClienteDTO;

public interface ClienteService {
    void registrarCliente(ClienteDTO clienteDTO);
    ClienteDTO login(String documento, String password);


}
