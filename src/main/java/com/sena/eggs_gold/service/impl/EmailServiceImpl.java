package com.sena.eggs_gold.service.impl;

import com.sena.eggs_gold.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.util.List;

@Service
public class EmailServiceImpl implements EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Override
    public void enviarCorreo(String destinatario, String asunto, String contenidoHtml)
            throws MessagingException, UnsupportedEncodingException {

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(destinatario);
        helper.setSubject(asunto);
        helper.setText(contenidoHtml, true); // permite HTML
        helper.setFrom("correos.eggs.gold@gmail.com", "Eggs Gold");

        mailSender.send(message);
        System.out.println("✅ Correo enviado a: " + destinatario);
    }

    @Override
    public void enviarCorreosMasivos(List<String> destinatarios, String asunto, String contenidoHtml)
            throws MessagingException, UnsupportedEncodingException {
        for (String email : destinatarios) {
            enviarCorreo(email, asunto, contenidoHtml);
            try {
                Thread.sleep(800); // pequeña pausa
            } catch (InterruptedException ignored) {}
        }
    }

    @Override
    public void enviarCorreoBienvenida(String para, String nombreUsuario) {
        String asunto = "¡Bienvenido a Eggs Gold!";
        String cuerpo = """
                <h2>¡Bienvenido, %s!</h2>
                <p>Gracias por unirte a <b>Eggs Gold</b>.</p>
                <p>Tu cuenta ha sido creada exitosamente. Ya puedes empezar a usar la plataforma.</p>
                <p>Atentamente,<br><b>Equipo Eggs Gold</b></p>
                """.formatted(nombreUsuario);
        try {
            enviarCorreo(para, asunto, cuerpo);
        } catch (Exception e) {
            System.err.println("Error al enviar correo de bienvenida: " + e.getMessage());
        }
    }

    @Override
    public void enviarCorreoCambioEstado(String para, String nombreUsuario, String nuevoEstado) {
        String asunto = "Actualización del estado de tu cuenta";
        String cuerpo = """
                <p>Hola <b>%s</b>,</p>
                <p>Tu cuenta ha cambiado de estado a: <b>%s</b></p>
                <p>Si tienes dudas, contacta con soporte.</p>
                <br>
                <p>Atentamente,<br><b>Equipo Eggs Gold</b></p>
                """.formatted(nombreUsuario, nuevoEstado);
        try {
            enviarCorreo(para, asunto, cuerpo);
        } catch (Exception e) {
            System.err.println("Error al enviar correo de cambio de estado: " + e.getMessage());
        }
    }
}
