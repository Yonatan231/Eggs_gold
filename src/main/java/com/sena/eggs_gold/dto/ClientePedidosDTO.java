package com.sena.eggs_gold.dto;

import lombok.Data;

@Data
public class ClientePedidosDTO {
    private Integer idUsuarios;
    private String nombre;
    private String apellido;
    private String numDocumento;
    private String direccionUsuario;
    private String telefono;
    private Long pedidosRealizados;
    public ClientePedidosDTO(Integer idUsuarios, String nombre, String apellido,
                             String numDocumento, String direccionUsuario,
                             String telefono, Long pedidosRealizados) {
        this.idUsuarios = idUsuarios;
        this.nombre = nombre;
        this.apellido = apellido;
        this.numDocumento = numDocumento;
        this.direccionUsuario = direccionUsuario;
        this.telefono = telefono;
        this.pedidosRealizados = pedidosRealizados;
    }
}
