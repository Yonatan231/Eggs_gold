package com.sena.eggs_gold.service.impl;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
/*
    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void enviarCorreoConfirmacion(String destinatario, String nombreUsuario) {
        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setTo(destinatario);
        mensaje.setSubject("Confirmación de registro");
        mensaje.setText("Hola " + nombreUsuario + ", tu registro fue exitoso. Bienvenido al sistema de pedidos de huevos.");
        mailSender.send(mensaje);
    }*/
}
