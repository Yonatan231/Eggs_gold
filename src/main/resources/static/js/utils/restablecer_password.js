// ========== VARIABLES GLOBALES ==========
// Obtenemos los elementos del formulario
const formulario = document.getElementById('passwordForm');
const inputNuevaContrasena = document.getElementById('nuevaContrasena');
const inputRepetirContrasena = document.getElementById('repetirContrasena');
const alertMessage = document.getElementById('alertMessage');
const inputToken = document.getElementById('token');

// Obtenemos los elementos de validacion
const validacionLongitud = document.getElementById('validacion-longitud');
const validacionLetras = document.getElementById('validacion-letras');
const validacionNumeros = document.getElementById('validacion-numeros');
const validacionCoincidencia = document.getElementById('validacion-coincidencia');

// ========== FUNCIONES DE VALIDACION ==========

/**
 * Valida si la contrasena tiene al menos 7 caracteres
 */
function validarLongitud(contrasena) {
    return contrasena.length >= 7;
}

/**
 * Valida si la contrasena contiene letras
 */
function validarLetras(contrasena) {
    const tieneLetras = /[a-zA-Z]/.test(contrasena);
    return tieneLetras;
}

/**
 * Valida si la contrasena contiene numeros
 */
function validarNumeros(contrasena) {
    const tieneNumeros = /[0-9]/.test(contrasena);
    return tieneNumeros;
}

/**
 * Valida si ambas contrasenas coinciden
 */
function validarCoincidencia() {
    const contrasena1 = inputNuevaContrasena.value;
    const contrasena2 = inputRepetirContrasena.value;

    // Solo validar si ambos campos tienen contenido
    if (contrasena1 === '' || contrasena2 === '') {
        return false;
    }

    return contrasena1 === contrasena2;
}

/**
 * Actualiza el estado visual de una validacion
 */
function actualizarValidacion(elemento, esValido) {
    if (esValido) {
        elemento.classList.remove('invalido');
        elemento.classList.add('valido');
    } else {
        elemento.classList.remove('valido');
        elemento.classList.add('invalido');
    }
}

/**
 * Valida todas las reglas de la contrasena
 */
function validarFormulario() {
    const contrasena = inputNuevaContrasena.value;

    // Validar longitud
    const longitudValida = validarLongitud(contrasena);
    actualizarValidacion(validacionLongitud, longitudValida);

    // Validar letras
    const letrasValidas = validarLetras(contrasena);
    actualizarValidacion(validacionLetras, letrasValidas);

    // Validar numeros
    const numerosValidos = validarNumeros(contrasena);
    actualizarValidacion(validacionNumeros, numerosValidos);

    // Validar coincidencia
    const coincidenciaValida = validarCoincidencia();
    actualizarValidacion(validacionCoincidencia, coincidenciaValida);

    // Retornar true solo si todas las validaciones pasan
    return longitudValida && letrasValidas && numerosValidos && coincidenciaValida;
}

/**
 * Muestra un mensaje de alerta al usuario
 */
function mostrarAlerta(mensaje, tipo) {
    // Limpiar clases anteriores
    alertMessage.className = 'alert';

    // Anadir clase segun el tipo
    if (tipo === 'success') {
        alertMessage.classList.add('alert-success');
    } else if (tipo === 'error') {
        alertMessage.classList.add('alert-error');
    }

    // Establecer el mensaje
    alertMessage.textContent = mensaje;

    // Hacer scroll hacia el mensaje
    alertMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Oculta el mensaje de alerta
 */
function ocultarAlerta() {
    alertMessage.className = 'alert';
    alertMessage.textContent = '';
}

// ========== EVENTOS DEL FORMULARIO ==========

/**
 * Evento que se ejecuta cuando el usuario escribe en el campo de nueva contrasena
 */
inputNuevaContrasena.addEventListener('input', function() {
    validarFormulario();
    ocultarAlerta();
});

/**
 * Evento que se ejecuta cuando el usuario escribe en el campo de repetir contrasena
 */
inputRepetirContrasena.addEventListener('input', function() {
    const coincidenciaValida = validarCoincidencia();
    actualizarValidacion(validacionCoincidencia, coincidenciaValida);
    ocultarAlerta();
});

/**
 * Evento que se ejecuta cuando el usuario envia el formulario
 */
formulario.addEventListener('submit', function(evento) {
    // Prevenir el envio automatico del formulario
    evento.preventDefault();

    // Validar el formulario completo
    const formularioValido = validarFormulario();

    if (formularioValido) {
        // Obtener el token y la nueva contrasena
        const token = inputToken.value;
        const nuevaContrasena = inputNuevaContrasena.value;

        // Deshabilitar boton mientras se procesa
        const btnSubmit = formulario.querySelector('button[type="submit"]');
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Procesando...';

        // Enviar solicitud al servidor
        fetch('/actualizar-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'token=' + encodeURIComponent(token) +
                '&nuevaContrasena=' + encodeURIComponent(nuevaContrasena)
        })
            .then(response => response.text())
            .then(data => {
                if (data === 'exito') {
                    mostrarAlerta('Contrasena cambiada exitosamente', 'success');

                    // Limpiar formulario
                    formulario.reset();
                    actualizarValidacion(validacionLongitud, false);
                    actualizarValidacion(validacionLetras, false);
                    actualizarValidacion(validacionNumeros, false);
                    actualizarValidacion(validacionCoincidencia, false);

                    // Redirigir al login despues de 2 segundos
                    setTimeout(function() {
                        window.location.href = '/login';
                    }, 2000);
                } else {
                    mostrarAlerta(data, 'error');
                    btnSubmit.disabled = false;
                    btnSubmit.textContent = 'Cambiar Contrasena';
                }
            })
            .catch(error => {
                mostrarAlerta('Error al actualizar la contrasena. Intenta de nuevo.', 'error');
                btnSubmit.disabled = false;
                btnSubmit.textContent = 'Cambiar Contrasena';
            });

    } else {
        mostrarAlerta('Por favor, corrige los errores antes de continuar', 'error');
    }
});

// ========== INICIALIZACION ==========
// Al cargar la pagina, asegurarse que todas las validaciones esten en rojo
document.addEventListener('DOMContentLoaded', function() {
    actualizarValidacion(validacionLongitud, false);
    actualizarValidacion(validacionLetras, false);
    actualizarValidacion(validacionNumeros, false);
    actualizarValidacion(validacionCoincidencia, false);
});