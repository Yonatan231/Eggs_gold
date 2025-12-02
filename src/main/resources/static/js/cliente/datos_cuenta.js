// Elementos del DOM - obtenemos referencias a los elementos HTML
const form = document.getElementById('userDataForm');
const btnEdit = document.getElementById('btnEdit');
const btnSave = document.getElementById('btnSave');
const btnCancel = document.getElementById('btnCancel');
const alertMessage = document.getElementById('alertMessage');

// Obtener todos los campos editables (excluyendo los deshabilitados)
// Ahora excluye: numeroDocumento, tipoDocumento, fechaCreacion
const editableInputs = Array.from(form.querySelectorAll('input:not([disabled]), select:not([disabled])'));

// Variable para guardar los datos originales
let datosOriginales = {};

/**
 * Carga los datos del usuario desde el backend
 */
async function loadUserData() {
    try {
        const response = await fetch('/api/cliente/datos', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (result.success) {
            const datos = result.datos;

            // Guardar datos originales para poder cancelar cambios
            datosOriginales = { ...datos };

            // Llenar el formulario con los datos del usuario
            document.getElementById('nombre').value = datos.nombre || '';
            document.getElementById('apellido').value = datos.apellido || '';
            document.getElementById('direccion').value = datos.direccion || '';
            document.getElementById('tipoDocumento').value = datos.tipoDocumento || '';
            document.getElementById('numeroDocumento').value = datos.numeroDocumento || '';
            document.getElementById('telefono').value = datos.telefono || '';
            document.getElementById('edad').value = datos.edad || '';
            document.getElementById('correo').value = datos.correo || '';
            document.getElementById('fechaCreacion').value = formatearFecha(datos.fechaCreacion);
        } else {
            showAlert('Error al cargar los datos: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al cargar los datos del usuario', 'error');
    }
}

/**
 * Formatea una fecha de formato ISO a formato legible
 */
function formatearFecha(fechaISO) {
    if (!fechaISO) return '';
    const fecha = new Date(fechaISO);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
}

/**
 * Habilita o deshabilita el modo de edición del formulario
 */
function toggleEditMode(enable) {
    editableInputs.forEach(input => {
        input.disabled = !enable;
    });

    btnEdit.style.display = enable ? 'none' : 'block';
    btnSave.style.display = enable ? 'block' : 'none';
    btnCancel.style.display = enable ? 'block' : 'none';
}

/**
 * Muestra un mensaje de alerta al usuario
 */
function showAlert(message, type) {
    alertMessage.textContent = message;
    alertMessage.className = `alert alert-${type}`;
    alertMessage.style.display = 'block';

    setTimeout(() => {
        alertMessage.style.display = 'none';
    }, 5000);
}

/**
 * Valida el formulario antes de enviarlo
 */
function validateForm() {
    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const edad = document.getElementById('edad').value;

    // Validar campos obligatorios
    if (!nombre || !apellido || !correo || !edad) {
        showAlert('Por favor, complete todos los campos obligatorios.', 'error');
        return false;
    }

    // Validar nombre (solo letras y espacios)
    const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nombreRegex.test(nombre)) {
        showAlert('El nombre solo puede contener letras y espacios.', 'error');
        return false;
    }

    if (!nombreRegex.test(apellido)) {
        showAlert('El apellido solo puede contener letras y espacios.', 'error');
        return false;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
        showAlert('Por favor, ingrese un correo electrónico válido.', 'error');
        return false;
    }

    // Validar teléfono (solo números, 7-10 dígitos)
    const telefonoRegex = /^[0-9]{7,10}$/;
    if (telefono && !telefonoRegex.test(telefono)) {
        showAlert('El teléfono debe tener entre 7 y 10 dígitos.', 'error');
        return false;
    }

    // Validar edad
    const edadNum = parseInt(edad);
    if (isNaN(edadNum) || edadNum < 18 || edadNum > 100) {
        showAlert('La edad debe estar entre 18 y 100 años.', 'error');
        return false;
    }

    return true;
}

// ========== EVENT LISTENERS ==========

// Evento para el botón Editar Datos
btnEdit.addEventListener('click', () => {
    toggleEditMode(true);
    showAlert('Ahora puede editar sus datos. El tipo y número de documento y fecha de creación no se pueden modificar.', 'success');
});

// Evento para el botón Cancelar
btnCancel.addEventListener('click', () => {
    // Restaurar datos originales (sin incluir tipoDocumento que está disabled)
    document.getElementById('nombre').value = datosOriginales.nombre || '';
    document.getElementById('apellido').value = datosOriginales.apellido || '';
    document.getElementById('direccion').value = datosOriginales.direccion || '';
    document.getElementById('telefono').value = datosOriginales.telefono || '';
    document.getElementById('edad').value = datosOriginales.edad || '';
    document.getElementById('correo').value = datosOriginales.correo || '';

    toggleEditMode(false);
    showAlert('Cambios cancelados. No se guardaron las modificaciones.', 'success');
});

// Evento para el envío del formulario
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (validateForm()) {
        // Preparar datos para enviar (sin incluir tipoDocumento)
        const datosActualizados = {
            nombre: document.getElementById('nombre').value.trim(),
            apellido: document.getElementById('apellido').value.trim(),
            direccion: document.getElementById('direccion').value.trim(),
            telefono: document.getElementById('telefono').value.trim(),
            edad: parseInt(document.getElementById('edad').value),
            correo: document.getElementById('correo').value.trim()
        };

        try {
            // Enviar datos al backend
            const response = await fetch('/api/cliente/actualizar', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosActualizados)
            });

            const result = await response.json();

            if (result.success) {
                // Actualizar datos originales con los nuevos valores
                datosOriginales = { ...datosActualizados };

                toggleEditMode(false);
                showAlert('Datos actualizados correctamente.', 'success');
            } else {
                showAlert(result.message || 'Error al actualizar los datos', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('Error al conectar con el servidor', 'error');
        }
    }
});

// ========== INICIALIZACIÓN ==========

// Cuando el DOM está completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    loadUserData();        // Cargar datos del backend
    toggleEditMode(false); // Iniciar en modo lectura
});