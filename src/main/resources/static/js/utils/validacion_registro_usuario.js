function validarFormularioRegistro(config) {
    const nombre = document.getElementById(config.nombreId).value.trim();
    const apellido = document.getElementById(config.apellidoId).value.trim();
    const numDocumento = document.getElementById(config.numDocumentoId).value.trim();
    const direccion = document.getElementById(config.direccionId).value.trim();
    const edad = document.getElementById(config.edadId).value.trim();
    const telefono = document.getElementById(config.telefonoId).value.trim();
    const correo = document.getElementById(config.correoId).value.trim();
    const password = document.getElementById(config.passwordId).value.trim();

    if (!nombre) {
        alert("el nombre es obligatorio");
        return false;
    }
    if (!validarSoloLetrasYEspacios(nombre)) {
        alert("el nombre solo puede contener letras y espacios");
        return false;
    }
    if (nombre.length < 2) {
        alert("el nombre debe tener al menos 2 caracteres");
        return false;
    }

    if (!apellido) {
        alert("el apellido es obligatorio");
        return false;
    }
    if (!validarSoloLetrasYEspacios(apellido)) {
        alert("el apellido solo puede contener letras y espacios");
        return false;
    }
    if (apellido.length < 2) {
        alert("el apellido debe tener al menos 2 caracteres");
        return false;
    }

    if (!numDocumento) {
        alert("el numero de documento es obligatorio");
        return false;
    }
    if (!validarSoloNumeros(numDocumento)) {
        alert("el numero de documento solo puede contener numeros");
        return false;
    }
    if (numDocumento.length < 6 || numDocumento.length > 12) {
        alert("el numero de documento debe tener entre 6 y 12 digitos");
        return false;
    }

    if (!direccion) {
        alert("la direccion es obligatoria");
        return false;
    }
    if (direccion.length < 5) {
        alert("la direccion debe tener al menos 5 caracteres");
        return false;
    }

    if (!edad) {
        alert("la edad es obligatoria");
        return false;
    }
    const edadNum = parseInt(edad);
    if (isNaN(edadNum)) {
        alert("la edad debe ser un numero valido");
        return false;
    }
    if (edadNum < 18 || edadNum > 100) {
        alert("la edad debe estar entre 18 y 100 anos");
        return false;
    }

    if (!telefono) {
        alert("el telefono es obligatorio");
        return false;
    }
    if (!validarSoloNumeros(telefono)) {
        alert("el telefono solo puede contener numeros");
        return false;
    }
    if (telefono.length !== 10) {
        alert("el telefono debe tener exactamente 10 digitos");
        return false;
    }

    if (!correo) {
        alert("el correo electronico es obligatorio");
        return false;
    }
    if (!validarFormatoCorreo(correo)) {
        alert("el formato del correo electronico no es valido");
        return false;
    }

    if (!password) {
        alert("la contrasena es obligatoria");
        return false;
    }
    if (password.length < 7) {
        alert("la contrasena debe tener al menos 8 caracteres");
        return false;
    }
    if (!validarPasswordConNumerosYLetras(password)) {
        alert("la contrasena debe contener numeros y letras");
        return false;
    }

    return true;
}

function validarSoloLetrasYEspacios(texto) {
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    return regex.test(texto);
}

function validarSoloNumeros(texto) {
    const regex = /^[0-9]+$/;
    return regex.test(texto);
}

function validarFormatoCorreo(correo) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(correo);
}

function validarPasswordConNumerosYLetras(password) {
    const tieneNumeros = /\d/.test(password);
    const tieneLetras = /[a-zA-Z]/.test(password);
    return tieneNumeros && tieneLetras;
}

function inicializarValidacion(formId, config) {
    const formulario = document.querySelector(formId);

    if (formulario) {
        formulario.addEventListener('submit', function(event) {
            // validar el formulario
            const esValido = validarFormularioRegistro(config);

            if (!esValido) {
                event.preventDefault();
                return false;
            }

            return true;
        });
    }
}