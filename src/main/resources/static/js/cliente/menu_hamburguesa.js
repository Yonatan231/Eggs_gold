/**
 * menu_hamburguesa.js
 * Script para manejo del menú hamburguesa en historial de pedidos
 * Básico y funcional sin animaciones complejas
 */

document.addEventListener('DOMContentLoaded', function() {
    // Seleccionar elementos del menú hamburguesa
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    // Verificar que existen los elementos
    if (!menuToggle || !navMenu) {
        console.warn('Elementos del menú hamburguesa no encontrados');
        return;
    }

    // Toggle del menú al hacer clic en hamburguesa
    menuToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        navMenu.classList.toggle('active');
    });

    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', function(event) {
        if (!menuToggle.contains(event.target) && !navMenu.contains(event.target)) {
            navMenu.classList.remove('active');
        }
    });

    // Cerrar menú al hacer clic en un enlace del menú
    const navLinks = navMenu.querySelectorAll('.nav-item');
    navLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            // Solo cerrar si es un enlace (no el botón de novedad)
            if (link.tagName === 'A') {
                navMenu.classList.remove('active');
            }
        });
    });

    // Cerrar menú al redimensionar ventana a desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            navMenu.classList.remove('active');
        }
    });
});