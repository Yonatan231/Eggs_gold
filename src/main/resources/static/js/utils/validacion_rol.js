/**
 * Función principal que valida el rol del usuario
 * @param {string|string[]} rolesPermitidos - Rol o array de roles permitidos
 */
function validarRolPagina(rolesPermitidos) {
    // Convertir a array si es un solo rol
    if (typeof rolesPermitidos === 'string') {
        rolesPermitidos = [rolesPermitidos];
    }

    // Esperar a que se cargue la sesión
    window.addEventListener('sesionCargada', (e) => {
        const rolActual = e.detail.rol;

        console.log('🔍 Validando acceso...');
        console.log('   Rol actual:', rolActual);
        console.log('   Roles permitidos:', rolesPermitidos);

        // Verificar si el usuario tiene permiso
        if (!rolActual || !rolesPermitidos.includes(rolActual)) {
            console.error('❌ ACCESO DENEGADO - Rol no autorizado');
            alert('❌ No tienes permisos para acceder a esta página.');
            window.location.href = '/login';
            return;
        }

        console.log('✅ Acceso autorizado');
    });

    // Timeout de seguridad: si no se carga la sesión en 3 segundos, redirigir
    setTimeout(() => {
        if (!window.rolSesion) {
            console.error('⏱️ Timeout - No se pudo verificar la sesión');
            window.location.href = '/login';
        }
    }, 3000);
}

/**
 * Función para validar si el usuario tiene un rol específico
 * Útil para mostrar/ocultar elementos en la página
 * @param {string} rol - Rol a validar
 * @returns {boolean} - true si el usuario tiene ese rol
 */
function tieneRol(rol) {
    return window.rolSesion === rol;
}

/**
 * Función para validar si el usuario tiene alguno de varios roles
 * @param {string[]} roles - Array de roles a validar
 * @returns {boolean} - true si el usuario tiene alguno de los roles
 */
function tieneAlgunRol(roles) {
    return roles.includes(window.rolSesion);
}

/**
 * Función para ocultar elementos según el rol
 * @param {string} selector - Selector CSS del elemento
 * @param {string[]} rolesPermitidos - Roles que pueden ver el elemento
 */
function mostrarSegunRol(selector, rolesPermitidos) {
    window.addEventListener('sesionCargada', (e) => {
        const elemento = document.querySelector(selector);
        if (!elemento) return;

        if (!rolesPermitidos.includes(e.detail.rol)) {
            elemento.style.display = 'none';
        }
    });
}

// Exportar funciones para uso global
window.validarRolPagina = validarRolPagina;
window.tieneRol = tieneRol;
window.tieneAlgunRol = tieneAlgunRol;
window.mostrarSegunRol = mostrarSegunRol;