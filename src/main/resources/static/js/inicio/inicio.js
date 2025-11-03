// ===== SCRIPT PARA EL MENÚ MÓVIL RESPONSIVE =====
// Este script controla cómo funciona el menú en dispositivos móviles

// Esperamos a que TODO el contenido de la página se cargue antes de ejecutar el código
document.addEventListener('DOMContentLoaded', function() {

    // === PASO 1: OBTENER LOS ELEMENTOS DEL HTML ===
    // Buscamos el botón hamburguesa (las 3 rayitas que se ven en móvil)
    const menuToggle = document.getElementById('menuToggle');

    // Buscamos el menú de navegación (la lista de enlaces: Inicio, Productos, etc.)
    const navMenu = document.getElementById('navMenu');

    // === PASO 2: VERIFICAR QUE LOS ELEMENTOS EXISTAN ===
    // Si no encontramos los elementos, no podemos continuar
    if (menuToggle && navMenu) {

        // === FUNCIÓN 1: ABRIR Y CERRAR EL MENÚ AL HACER CLIC EN EL BOTÓN ===
        menuToggle.addEventListener('click', function(event) {
            // Toggle significa "alternar": si está abierto lo cierra, si está cerrado lo abre
            // Esto se hace agregando o quitando la clase 'active'
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');

            // Evitamos que el clic se propague al documento
            // (esto previene que se active el cerrar menú al hacer clic fuera)
            event.stopPropagation();
        });

        // === FUNCIÓN 2: CERRAR EL MENÚ AL HACER CLIC EN UN ENLACE ===
        // Cuando el usuario hace clic en "Inicio", "Productos", etc., queremos cerrar el menú
        const navLinks = navMenu.querySelectorAll('a');

        // Recorremos cada enlace del menú
        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                // Quitamos la clase 'active' para cerrar el menú
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });

        // === FUNCIÓN 3: CERRAR EL MENÚ AL HACER CLIC FUERA DE ÉL ===
        // Si el usuario hace clic en cualquier parte de la página (fuera del menú), lo cerramos
        document.addEventListener('click', function(event) {
            // Primero verificamos si el menú está abierto
            if (navMenu.classList.contains('active')) {
                // Verificamos si el clic NO fue en el menú ni en el botón
                if (!navMenu.contains(event.target) && !menuToggle.contains(event.target)) {
                    // Cerramos el menú
                    navMenu.classList.remove('active');
                    menuToggle.classList.remove('active');
                }
            }
        });

        // === FUNCIÓN 4: CERRAR EL MENÚ AL CAMBIAR EL TAMAÑO DE LA VENTANA ===
        // Si el usuario hace la ventana más grande (modo escritorio), cerramos el menú automáticamente
        window.addEventListener('resize', function() {
            // Si la ventana es más grande que 768px (tamaño tablet/escritorio)
            if (window.innerWidth > 768) {
                // Cerramos el menú quitando la clase 'active'
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });

    } else {
        // Si no encontramos los elementos, mostramos un mensaje de error
        console.error('ERROR: No se encontraron los elementos del menú. Verifica los IDs en el HTML.');
    }

});

// ===== FUNCIÓN 5: DESPLAZAMIENTO SUAVE A LAS SECCIONES =====
// Cuando haces clic en "Inicio", "Productos", etc., la página se desplaza suavemente
document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
        // Obtenemos el destino del enlace (ejemplo: "#inicio", "#productos")
        const href = this.getAttribute('href');

        // Si el enlace no es solo "#", hacemos el desplazamiento
        if (href !== '#') {
            e.preventDefault(); // Prevenimos el salto brusco por defecto

            // Buscamos la sección a la que queremos ir
            const target = document.querySelector(href);

            // Si encontramos la sección, hacemos scroll suave
            if (target) {
                // Calculamos la altura del header (que está fijo en la parte superior)
                const headerHeight = document.querySelector('header').offsetHeight;

                // Calculamos la posición final restando la altura del header
                const targetPosition = target.offsetTop - headerHeight;

                // Hacemos el scroll suave hacia la posición calculada
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth' // Esto hace que el desplazamiento sea suave
                });
            }
        }
    });
});

// ===== FUNCIÓN 6: MARCAR EL ENLACE ACTIVO SEGÚN LA POSICIÓN DEL SCROLL =====
// Mientras haces scroll, el enlace de la sección visible se resalta automáticamente
document.addEventListener('scroll', function() {
    // Obtenemos todas las secciones que tienen un ID
    const sections = document.querySelectorAll('section[id]');

    // Obtenemos todos los enlaces del menú que apuntan a secciones
    const navLinks = document.querySelectorAll('#navMenu a[href^="#"]');

    // Obtenemos la posición actual del scroll + 100px de margen
    // CORREGIDO: Usamos 150px para que sea más sensible cerca del inicio
    let scrollY = window.scrollY + 150;

    // Recorremos cada sección para ver cuál está visible
    sections.forEach(sec => {
        const top = sec.offsetTop; // Posición superior de la sección
        const height = sec.offsetHeight; // Altura de la sección
        const id = sec.getAttribute('id'); // ID de la sección (ejemplo: "inicio")

        // Buscamos el enlace que corresponde a esta sección
        const link = document.querySelector(`#navMenu a[href="#${id}"]`);

        // Si estamos dentro de esta sección, la marcamos como activa
        if (scrollY >= top && scrollY < top + height) {
            // Primero quitamos la clase activa de todos los enlaces
            navLinks.forEach(l => l.classList.remove('activo-scroll'));

            // Luego agregamos la clase activa solo al enlace de la sección visible
            if (link) {
                link.classList.add('activo-scroll');
            }
        }
    });

    // CORREGIDO: Si estamos en la parte superior de la página (casi en el inicio)
    // marcamos "Inicio" como activo
    if (window.scrollY < 100) {
        navLinks.forEach(l => l.classList.remove('activo-scroll'));
        const inicioLink = document.querySelector('#navMenu a[href="#inicio"]');
        if (inicioLink) {
            inicioLink.classList.add('activo-scroll');
        }
    }
});

// ===== FUNCIÓN 7: MARCAR EL ENLACE ACTIVO AL HACER CLIC =====
// Cuando haces clic en un enlace, se marca como activo inmediatamente
