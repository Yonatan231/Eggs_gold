package com.sena.eggs_gold.service.impl;

import com.sena.eggs_gold.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Override
    public void enviarCorreo(String para, String asunto, String mensaje) {
        try {
            SimpleMailMessage email = new SimpleMailMessage();
            email.setTo(para);
            email.setSubject(asunto);
            email.setText(mensaje);
            email.setFrom("noreply@eggsgold.com"); // puedes usar tu cuenta oficial
            mailSender.send(email);
        } catch (Exception e) {
            System.err.println("Error al enviar correo genérico: " + e.getMessage());
        }
    }

    @Override
    public void enviarCorreoBienvenida(String para, String nombreUsuario) {
        String asunto = "¡Bienvenido a Eggs Gold!";
        String cuerpo = "Hola " + nombreUsuario + ",\n\n" +
                "¡Bienvenido a nuestro sistema de gestión de pedidos de huevos!\n\n" +
                "Tu cuenta ha sido creada exitosamente. Ya puedes empezar a usar la plataforma.\n\n" +
                "Gracias por confiar en nosotros.\n\n" +
                "Atentamente,\nEquipo Eggs Gold";

        enviarCorreo(para, asunto, cuerpo);
    }

    @Override
    public void enviarCorreoCambioEstado(String para, String nombreUsuario, String nuevoEstado) {
        String asunto = "Actualización del estado de tu cuenta";
        String cuerpo = "Hola " + nombreUsuario + ",\n\n" +
                "El estado de tu cuenta ha sido actualizado.\n" +
                "Nuevo estado: " + nuevoEstado + "\n\n" +
                "Si tienes dudas, contacta con soporte.\n\n" +
                "Atentamente,\nEquipo Eggs Gold";

        enviarCorreo(para, asunto, cuerpo);
    }
}

