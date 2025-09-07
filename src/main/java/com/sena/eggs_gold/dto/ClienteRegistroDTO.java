package com.sena.eggs_gold.dto;

import com.sena.eggs_gold.model.enums.TipoDocumento;
import lombok.Data;

@Data

public class ClienteRegistroDTO {
    private String nombre;
    private String apellido;
    private String direccionUsuario;
    private String numDocumento;
    private String telefono;
    private String correo;
    private String password;

}
