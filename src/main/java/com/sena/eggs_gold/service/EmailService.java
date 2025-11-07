package com.sena.eggs_gold.service;

import jakarta.mail.MessagingException;
import java.io.UnsupportedEncodingException;
import java.util.List;

public interface EmailService {
    void enviarCorreo(String destinatario, String asunto, String contenidoHtml)
            throws MessagingException, UnsupportedEncodingException;

    void enviarCorreosMasivos(List<String> destinatarios, String asunto, String contenidoHtml)
            throws MessagingException, UnsupportedEncodingException;

    void enviarCorreoBienvenida(String para, String nombreUsuario);

    void enviarCorreoCambioEstado(String para, String nombreUsuario, String nuevoEstado);
}
