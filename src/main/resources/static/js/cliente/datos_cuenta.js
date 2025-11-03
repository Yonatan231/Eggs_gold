// Datos de ejemplo del usuario (simulando datos de base de datos)
const userData = {
    nombre: 'María',
    apellido: 'González',
    direccion: 'Calle Falsa 123, Ciudad, País',
    tipoDocumento: 'DNI',
    numeroDocumento: '12345678A',
    telefono: '+34 612 345 678',
    correo: 'maria.gonzalez@ejemplo.com',
    contrasena: 'miContraseñaSegura123',
    fechaCreacion: '15/03/2023'
};

// Elementos del DOM - obtenemos referencias a los elementos HTML
const form = document.getElementById('userDataForm');           // Formulario completo
const btnEdit = document.getElementById('btnEdit');             // Botón Editar Datos
const btnSave = document.getElementById('btnSave');             // Botón Guardar Cambios
const btnCancel = document.getElementById('btnCancel');         // Botón Cancelar
const alertMessage = document.getElementById('alertMessage');   // Contenedor de alertas
const togglePasswordBtn = document.querySelector('.toggle-password'); // Botón mostrar/ocultar contraseña
const passwordInput = document.getElementById('contrasena');    // Campo de contraseña

// Obtener todos los campos editables (excluyendo los deshabilitados)
const editableInputs = Array.from(form.querySelectorAll('input:not([disabled]), select'));

/**
 * Carga los datos del usuario en el formulario
 * Esta función llena todos los campos del formulario con los datos del usuario
 */
function loadUserData() {
    // Asignamos los valores del objeto userData a cada campo del formulario
    document.getElementById('nombre').value = userData.nombre;
    document.getElementById('apellido').value = userData.apellido;
    document.getElementById('direccion').value = userData.direccion;
    document.getElementById('tipoDocumento').value = userData.tipoDocumento;
    document.getElementById('numeroDocumento').value = userData.numeroDocumento;
    document.getElementById('telefono').value = userData.telefono;
    document.getElementById('correo').value = userData.correo;
    document.getElementById('contrasena').value = userData.contrasena;
    document.getElementById('fechaCreacion').value = userData.fechaCreacion;
}

/**
 * Habilita o deshabilita el modo de edición del formulario
 * @param {boolean} enable - true para habilitar edición, false para deshabilitar
 */
function toggleEditMode(enable) {
    // Recorremos todos los campos editables y cambiamos su estado disabled
    editableInputs.forEach(input => {
        input.disabled = !enable;
    });

    // Mostramos u ocultamos botones según el modo de edición
    btnEdit.style.display = enable ? 'none' : 'block';      // Ocultar Editar en modo edición
    btnSave.style.display = enable ? 'block' : 'none';      // Mostrar Guardar en modo edición
    btnCancel.style.display = enable ? 'block' : 'none';    // Mostrar Cancelar en modo edición
}

/**
 * Muestra un mensaje de alerta al usuario
 * @param {string} message - El mensaje a mostrar
 * @param {string} type - El tipo de alerta ('success' o 'error')
 */
function showAlert(message, type) {
    // Configuramos el contenido y clases del elemento de alerta
    alertMessage.textContent = message;
    alertMessage.className = `alert alert-${type}`;
    alertMessage.style.display = 'block';

    // Ocultamos la alerta después de 5 segundos automáticamente
    setTimeout(() => {
        alertMessage.style.display = 'none';
    }, 5000);
}

/**
 * Valida el formulario antes de enviarlo
 * @returns {boolean} - true si el formulario es válido, false si no
 */
function validateForm() {
    // Obtenemos y limpiamos los valores de los campos obligatorios
    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const contrasena = document.getElementById('contrasena').value;

    // Validar campos obligatorios - verificamos que no estén vacíos
    if (!nombre || !apellido || !correo || !contrasena) {
        showAlert('Por favor, complete todos los campos obligatorios.', 'error');
        return false;
    }

    // Validar formato de email usando expresión regular
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
        showAlert('Por favor, ingrese un correo electrónico válido.', 'error');
        return false;
    }

    // Validar longitud mínima de contraseña
    if (contrasena.length < 8) {
        showAlert('La contraseña debe tener al menos 8 caracteres.', 'error');
        return false;
    }

    // Si todas las validaciones pasan, retornamos true
    return true;
}

/**
 * Alterna la visibilidad de la contraseña entre texto plano y asteriscos
 */
function togglePasswordVisibility() {
    // Cambiamos el tipo de input entre password y text
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        togglePasswordBtn.textContent = 'Ocultar';
    } else {
        passwordInput.type = 'password';
        togglePasswordBtn.textContent = 'Mostrar';
    }
}

// ========== EVENT LISTENERS ==========

// Evento para el botón Editar Datos - habilita el modo edición
btnEdit.addEventListener('click', () => {
    toggleEditMode(true);
    showAlert('Ahora puede editar sus datos. Recuerde que el número de documento y fecha de creación no se pueden modificar.', 'success');
});

// Evento para el botón Cancelar - deshace cambios y deshabilita edición
btnCancel.addEventListener('click', () => {
    loadUserData();                     // Recarga los datos originales
    toggleEditMode(false);              // Desactiva modo edición
    showAlert('Cambios cancelados. No se guardaron las modificaciones.', 'success');
});

// Evento para el envío del formulario - valida y guarda datos
form.addEventListener('submit', (e) => {
    e.preventDefault();  // Prevenimos el envío tradicional del formulario

    // Validamos el formulario antes de proceder
    if (validateForm()) {
        // En una aplicación real, aquí enviaríamos los datos al servidor
        // Por ahora, actualizamos el objeto userData localmente

        // Actualizamos cada propiedad del objeto userData con los valores del formulario
        userData.nombre = document.getElementById('nombre').value;
        userData.apellido = document.getElementById('apellido').value;
        userData.direccion = document.getElementById('direccion').value;
        userData.tipoDocumento = document.getElementById('tipoDocumento').value;
        userData.telefono = document.getElementById('telefono').value;
        userData.correo = document.getElementById('correo').value;
        userData.contrasena = document.getElementById('contrasena').value;

        // Desactivamos el modo edición y mostramos confirmación
        toggleEditMode(false);
        showAlert('Datos actualizados correctamente.', 'success');
    }
});

// Evento para el botón de mostrar/ocultar contraseña
togglePasswordBtn.addEventListener('click', togglePasswordVisibility);

// ========== INICIALIZACIÓN ==========

// Cuando el DOM está completamente cargado, inicializamos la página
document.addEventListener('DOMContentLoaded', () => {
    loadUserData();     // Cargamos los datos del usuario en el formulario
    toggleEditMode(false); // Iniciamos con el formulario en modo lectura
});