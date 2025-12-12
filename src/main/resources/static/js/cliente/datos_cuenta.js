const form = document.getElementById('userDataForm');
const btnEdit = document.getElementById('btnEdit');
const btnSave = document.getElementById('btnSave');
const btnCancel = document.getElementById('btnCancel');
const alertMessage = document.getElementById('alertMessage');

const editableInputs = Array.from(form.querySelectorAll('input:not([disabled]), select:not([disabled])'));

let datosOriginales = {};

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

            datosOriginales = { ...datos };

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

function formatearFecha(fechaISO) {
    if (!fechaISO) return '';
    const fecha = new Date(fechaISO);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
}

function toggleEditMode(enable) {
    editableInputs.forEach(input => {
        input.disabled = !enable;
    });

    btnEdit.style.display = enable ? 'none' : 'block';
    btnSave.style.display = enable ? 'block' : 'none';
    btnCancel.style.display = enable ? 'block' : 'none';
}

function showAlert(message, type) {
    alertMessage.textContent = message;
    alertMessage.className = `alert alert-${type}`;
    alertMessage.style.display = 'block';

    setTimeout(() => {
        alertMessage.style.display = 'none';
    }, 5000);
}

function validateForm() {
    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const edad = document.getElementById('edad').value;
    const direccion = document.getElementById('direccion').value.trim();

    if (!nombre || !apellido || !correo || !edad || !direccion) {
        showAlert('Por favor, complete todos los campos obligatorios.', 'error');
        return false;
    }

    const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nombreRegex.test(nombre)) {
        showAlert('El nombre solo puede contener letras y espacios.', 'error');
        return false;
    }

    if (!nombreRegex.test(apellido)) {
        showAlert('El apellido solo puede contener letras y espacios.', 'error');
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
        showAlert('Por favor, ingrese un correo electrónico válido.', 'error');
        return false;
    }

    if (!telefono) {
        showAlert('El teléfono es obligatorio.', 'error');
        return false;
    }
    const telefonoRegex = /^[0-9]{10}$/;
    if (!telefonoRegex.test(telefono)) {
        showAlert('El teléfono debe tener exactamente 10 dígitos.', 'error');
        return false;
    }

    const edadNum = parseInt(edad);
    if (isNaN(edadNum) || edadNum < 18 || edadNum > 100) {
        showAlert('La edad debe estar entre 18 y 100 años.', 'error');
        return false;
    }

    return true;
}

btnEdit.addEventListener('click', () => {
    toggleEditMode(true);
    showAlert('Ahora puede editar sus datos. El tipo y número de documento y fecha de creación no se pueden modificar.', 'success');
});

btnCancel.addEventListener('click', () => {
    document.getElementById('nombre').value = datosOriginales.nombre || '';
    document.getElementById('apellido').value = datosOriginales.apellido || '';
    document.getElementById('direccion').value = datosOriginales.direccion || '';
    document.getElementById('telefono').value = datosOriginales.telefono || '';
    document.getElementById('edad').value = datosOriginales.edad || '';
    document.getElementById('correo').value = datosOriginales.correo || '';

    toggleEditMode(false);
    showAlert('Cambios cancelados. No se guardaron las modificaciones.', 'success');
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (validateForm()) {
        const datosActualizados = {
            nombre: document.getElementById('nombre').value.trim(),
            apellido: document.getElementById('apellido').value.trim(),
            direccion: document.getElementById('direccion').value.trim(),
            telefono: document.getElementById('telefono').value.trim(),
            edad: parseInt(document.getElementById('edad').value),
            correo: document.getElementById('correo').value.trim()
        };

        try {
            const response = await fetch('/api/cliente/actualizar', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosActualizados)
            });

            const result = await response.json();

            if (result.success) {
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

document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    toggleEditMode(false);
});