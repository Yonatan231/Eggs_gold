const formulario = document.getElementById('passwordForm');
const inputNuevaContrasena = document.getElementById('nuevaContrasena');
const inputRepetirContrasena = document.getElementById('repetirContrasena');
const alertMessage = document.getElementById('alertMessage');
const inputToken = document.getElementById('token');

const validacionLongitud = document.getElementById('validacion-longitud');
const validacionLetras = document.getElementById('validacion-letras');
const validacionNumeros = document.getElementById('validacion-numeros');
const validacionCoincidencia = document.getElementById('validacion-coincidencia');

function validarLongitud(contrasena) {
    return contrasena.length >= 7;
}

function validarLetras(contrasena) {
    const tieneLetras = /[a-zA-Z]/.test(contrasena);
    return tieneLetras;
}

function validarNumeros(contrasena) {
    const tieneNumeros = /[0-9]/.test(contrasena);
    return tieneNumeros;
}

function validarCoincidencia() {
    const contrasena1 = inputNuevaContrasena.value;
    const contrasena2 = inputRepetirContrasena.value;

    if (contrasena1 === '' || contrasena2 === '') {
        return false;
    }

    return contrasena1 === contrasena2;
}

function actualizarValidacion(elemento, esValido) {
    if (esValido) {
        elemento.classList.remove('invalido');
        elemento.classList.add('valido');
    } else {
        elemento.classList.remove('valido');
        elemento.classList.add('invalido');
    }
}

function validarFormulario() {
    const contrasena = inputNuevaContrasena.value;

    const longitudValida = validarLongitud(contrasena);
    actualizarValidacion(validacionLongitud, longitudValida);

    const letrasValidas = validarLetras(contrasena);
    actualizarValidacion(validacionLetras, letrasValidas);

    const numerosValidos = validarNumeros(contrasena);
    actualizarValidacion(validacionNumeros, numerosValidos);

    const coincidenciaValida = validarCoincidencia();
    actualizarValidacion(validacionCoincidencia, coincidenciaValida);

    return longitudValida && letrasValidas && numerosValidos && coincidenciaValida;
}

function mostrarAlerta(mensaje, tipo) {
    alertMessage.className = 'alert';

    if (tipo === 'success') {
        alertMessage.classList.add('alert-success');
    } else if (tipo === 'error') {
        alertMessage.classList.add('alert-error');
    }

    alertMessage.textContent = mensaje;

    alertMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function ocultarAlerta() {
    alertMessage.className = 'alert';
    alertMessage.textContent = '';
}

inputNuevaContrasena.addEventListener('input', function() {
    validarFormulario();
    ocultarAlerta();
});

inputRepetirContrasena.addEventListener('input', function() {
    const coincidenciaValida = validarCoincidencia();
    actualizarValidacion(validacionCoincidencia, coincidenciaValida);
    ocultarAlerta();
});

formulario.addEventListener('submit', function(evento) {
    evento.preventDefault();

    const formularioValido = validarFormulario();

    if (formularioValido) {
        const token = inputToken.value;
        const nuevaContrasena = inputNuevaContrasena.value;

        const btnSubmit = formulario.querySelector('button[type="submit"]');
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Procesando...';

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

                    formulario.reset();
                    actualizarValidacion(validacionLongitud, false);
                    actualizarValidacion(validacionLetras, false);
                    actualizarValidacion(validacionNumeros, false);
                    actualizarValidacion(validacionCoincidencia, false);

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

document.addEventListener('DOMContentLoaded', function() {
    actualizarValidacion(validacionLongitud, false);
    actualizarValidacion(validacionLetras, false);
    actualizarValidacion(validacionNumeros, false);
    actualizarValidacion(validacionCoincidencia, false);
});