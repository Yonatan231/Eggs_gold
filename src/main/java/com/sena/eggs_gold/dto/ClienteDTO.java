package com.sena.eggs_gold.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;


@Data
public class ClienteDTO {

    private Integer idUsuarios;
    private String nombre;
    private String apellido;
    private String direccionUsuario;

    @NotBlank(message = "El número de documento es obligatorio")
    @Size(min = 7, message = "El número de documento debe tener al menos 7 dígitos")
    @Pattern(regexp = "\\d+", message = "El número de documento solo debe contener números")
    private String numDocumento;
    private String telefono;
    private String correo;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]+$", message = "La contraseña debe contener letras y números")
    private String password;

}

