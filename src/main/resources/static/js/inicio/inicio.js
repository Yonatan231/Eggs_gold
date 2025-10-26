// ===== SCRIPT PARA EL MENÚ MÓVIL RESPONSIVE =====

// Esperamos a que todo el contenido de la página se cargue
document.addEventListener('DOMContentLoaded', function() {

    // Obtenemos los elementos del DOM que necesitamos
    // El botón hamburguesa que abre/cierra el menú
    const menuToggle = document.getElementById('menuToggle');

    // El menú de navegación que se mostrará/ocultará
    const navMenu = document.getElementById('navMenu');

    // Verificamos que ambos elementos existan antes de continuar
    if (menuToggle && navMenu) {

        // Agregamos un evento de clic al botón hamburguesa
        menuToggle.addEventListener('click', function() {

            // Toggle: si el menú tiene la clase 'active', la quita; si no la tiene, la agrega
            navMenu.classList.toggle('active');

            // También podemos agregar la clase al botón para animarlo (opcional)
            menuToggle.classList.toggle('active');

            // Prevenir que el clic se propague al documento
            event.stopPropagation();
        });

        // ===== CERRAR EL MENÚ AL HACER CLIC EN UN ENLACE =====
        // Obtenemos todos los enlaces del menú de navegación
        const navLinks = navMenu.querySelectorAll('a');

        // Para cada enlace, agregamos un evento de clic
        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                // Cuando se hace clic en un enlace, cerramos el menú
                // removiendo la clase 'active'
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });

        // ===== CERRAR EL MENÚ AL HACER CLIC FUERA DE ÉL =====
        // Esto mejora la experiencia de usuario
        document.addEventListener('click', function(event) {
            // Verificamos si el menú está abierto
            if (navMenu.classList.contains('active')) {
                // Verificamos si el clic fue fuera del menú y del botón
                if (!navMenu.contains(event.target) && !menuToggle.contains(event.target)) {
                    // Cerramos el menú
                    navMenu.classList.remove('active');
                    menuToggle.classList.remove('active');
                }
            }
        });

        // ===== CERRAR EL MENÚ AL CAMBIAR EL TAMAÑO DE LA VENTANA =====
        // Si el usuario redimensiona la ventana a un tamaño de escritorio,
        // cerramos el menú automáticamente
        window.addEventListener('resize', function() {
            // Si la ventana es más grande que 768px (tamaño de tablet)
            if (window.innerWidth > 768) {
                // Quitamos la clase 'active' para cerrar el menú
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });

    } else {
        // Si no encontramos los elementos, mostramos un error en la consola
        console.error('No se encontraron los elementos del menú. Verifica los IDs en el HTML.');
    }

});

// ===== FUNCIÓN ADICIONAL: SMOOTH SCROLL PARA ENLACES INTERNOS =====
// Esto hace que el desplazamiento a las secciones sea suave
document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
        // Obtenemos el href del enlace (por ejemplo: "#productos")
        const href = this.getAttribute('href');

        // Si el href no es solo "#", hacemos scroll suave
        if (href !== '#') {
            e.preventDefault(); // Prevenimos el comportamiento por defecto

            // Buscamos el elemento objetivo
            const target = document.querySelector(href);

            // Si existe el elemento, hacemos scroll suave hacia él
            if (target) {
                // Calculamos la posición considerando la altura del header fijo
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;

                // Hacemos el scroll suave
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// ===== NOTA PARA PRINCIPIANTES =====
// Este archivo JavaScript hace 3 cosas principales:
// 1. Abre y cierra el menú móvil cuando se hace clic en el botón hamburguesa
// 2. Cierra el menú automáticamente cuando se hace clic en un enlace
// 3. Añade scroll suave cuando se hace clic en enlaces internos (como "#productos")
//
// Para usar este archivo:
// - Asegúrate de que esté vinculado correctamente en tu HTML
// - Los IDs 'menuToggle' y 'navMenu' deben existir en tu HTML
// - El archivo debe cargarse al final del body o usar DOMContentLoaded