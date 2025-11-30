/**
 * menu-hamburguesa.js
 * Script reutilizable para manejo básico de menú hamburguesa responsive
 * Sin animaciones - Solo funcionalidad básica
 */

document.addEventListener('DOMContentLoaded', function() {
    // Seleccionar elementos
    const menuToggle = document.getElementById('menuToggleCarrito');
    const navMenu = document.getElementById('navMenuCarrito');

    // Verificar que existen los elementos
    if (!menuToggle || !navMenu) {
        console.warn('Elementos del menú hamburguesa no encontrados');
        return;
    }

    // Toggle del menú al hacer clic en hamburguesa
    menuToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
    });

    // Cerrar menú al hacer clic fuera (opcional pero útil)
    document.addEventListener('click', function(event) {
        // Si el clic NO fue en el botón ni en el menú
        if (!menuToggle.contains(event.target) && !navMenu.contains(event.target)) {
            navMenu.classList.remove('active');
        }
    });

    // Cerrar menú al hacer clic en un enlace del menú
    const navLinks = navMenu.querySelectorAll('.nav-item');
    navLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
        });
    });

    // Cerrar menú al cambiar tamaño de ventana a desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            navMenu.classList.remove('active');
        }
    });
});