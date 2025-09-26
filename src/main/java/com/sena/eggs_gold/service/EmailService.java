package com.sena.eggs_gold.service;

public interface EmailService {

    void enviarCorreo(String para, String asunto, String mensaje);

    void enviarCorreoBienvenida(String para, String nombreUsuario);

    void enviarCorreoCambioEstado(String para, String nombreUsuario, String nuevoEstado);
}


