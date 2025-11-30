// ===== MENU_RESPONSIVE.JS =====
// Script reutilizable para implementar menú hamburguesa responsive en cualquier vista
// Autor: Sistema Eggs Gold
// Versión: 1.0

/**
 * Inicializa el menú responsive hamburguesa
 * @param {string} menuId - ID del elemento <nav> o contenedor del menú
 * @param {string} toggleId - ID del botón hamburguesa
 */
function inicializarMenuResponsive(menuId, toggleId) {

    // Esperar a que el DOM esté completamente cargado
    document.addEventListener('DOMContentLoaded', function() {

        // === PASO 1: OBTENER LOS ELEMENTOS DEL HTML ===
        const menuToggle = document.getElementById(toggleId);
        const navMenu = document.getElementById(menuId);

        // === PASO 2: VERIFICAR QUE LOS ELEMENTOS EXISTAN ===
        if (!menuToggle || !navMenu) {
            console.error(`ERROR: No se encontraron los elementos del menú responsive.`);
            console.error(`- Menu ID buscado: "${menuId}" - ${navMenu ? 'Encontrado ✓' : 'NO encontrado ✗'}`);
            console.error(`- Toggle ID buscado: "${toggleId}" - ${menuToggle ? 'Encontrado ✓' : 'NO encontrado ✗'}`);
            return;
        }

        console.log('✓ Menú responsive inicializado correctamente');

        // === FUNCIÓN 1: ABRIR Y CERRAR EL MENÚ AL HACER CLIC EN EL BOTÓN ===
        menuToggle.addEventListener('click', function(event) {
            // Toggle: si está abierto lo cierra, si está cerrado lo abre
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');

            // Evitar que el clic se propague al documento
            event.stopPropagation();

            console.log('Menu toggled:', navMenu.classList.contains('active') ? 'Abierto' : 'Cerrado');
        });

        // === FUNCIÓN 2: CERRAR EL MENÚ AL HACER CLIC EN UN ENLACE ===
        const navLinks = navMenu.querySelectorAll('a, button');

        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
                console.log('Menu cerrado por clic en enlace');
            });
        });

        // === FUNCIÓN 3: CERRAR EL MENÚ AL HACER CLIC FUERA DE ÉL ===
        document.addEventListener('click', function(event) {
            if (navMenu.classList.contains('active')) {
                // Verificar si el clic NO fue en el menú ni en el botón
                if (!navMenu.contains(event.target) && !menuToggle.contains(event.target)) {
                    navMenu.classList.remove('active');
                    menuToggle.classList.remove('active');
                    console.log('Menu cerrado por clic fuera');
                }
            }
        });

        // === FUNCIÓN 4: CERRAR EL MENÚ AL CAMBIAR EL TAMAÑO DE LA VENTANA ===
        window.addEventListener('resize', function() {
            // Si la ventana es más grande que 768px (modo desktop)
            if (window.innerWidth > 768) {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
                console.log('Menu cerrado por resize a desktop');
            }
        });

        // === FUNCIÓN 5: CERRAR MENÚ CON LA TECLA ESC ===
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
                console.log('Menu cerrado con tecla ESC');
            }
        });
    });
}

// ===== FUNCIONES AUXILIARES =====

/**
 * Crear el HTML del botón hamburguesa dinámicamente
 * @param {string} toggleId - ID que tendrá el botón
 * @returns {string} HTML del botón hamburguesa
 */
function crearBotonHamburguesa(toggleId) {
    return `
        <button class="menu-toggle" id="${toggleId}" aria-label="Abrir menú">
            <span></span>
            <span></span>
            <span></span>
        </button>
    `;
}

/**
 * Inyectar el botón hamburguesa en un contenedor específico
 * @param {string} contenedorId - ID del contenedor donde se insertará el botón
 * @param {string} toggleId - ID que tendrá el botón hamburguesa
 */
function inyectarBotonHamburguesa(contenedorId, toggleId) {
    const contenedor = document.getElementById(contenedorId);
    if (contenedor) {
        contenedor.insertAdjacentHTML('beforeend', crearBotonHamburguesa(toggleId));
        console.log('✓ Botón hamburguesa inyectado en:', contenedorId);
    } else {
        console.error('✗ No se encontró el contenedor:', contenedorId);
    }
}