
function validarRolPagina(rolesPermitidos) {

    if (typeof rolesPermitidos === 'string') {
        rolesPermitidos = [rolesPermitidos];
    }

    window.addEventListener('sesionCargada', (e) => {
        const rolActual = e.detail.rol;

        if (!rolActual || !rolesPermitidos.includes(rolActual)) {
            console.error('❌ ACCESO DENEGADO - Rol no autorizado');
            alert('❌ No tienes permisos para acceder a esta página.');
            window.location.href = '/login';
            return;
        }

    });

    setTimeout(() => {
        if (!window.rolSesion) {
            console.error(' Timeout - No se pudo verificar la sesión');
            window.location.href = '/login';
        }
    }, 3000);
}

function tieneRol(rol) {
    return window.rolSesion === rol;
}

function tieneAlgunRol(roles) {
    return roles.includes(window.rolSesion);
}

function mostrarSegunRol(selector, rolesPermitidos) {
    window.addEventListener('sesionCargada', (e) => {
        const elemento = document.querySelector(selector);
        if (!elemento) return;

        if (!rolesPermitidos.includes(e.detail.rol)) {
            elemento.style.display = 'none';
        }
    });
}

window.validarRolPagina = validarRolPagina;
window.tieneRol = tieneRol;
window.tieneAlgunRol = tieneAlgunRol;
window.mostrarSegunRol = mostrarSegunRol;