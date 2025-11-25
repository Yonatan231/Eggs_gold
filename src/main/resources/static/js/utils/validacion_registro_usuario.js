// ============================================
// VALIDACIÓN GENÉRICA DE FORMULARIOS DE REGISTRO
// Este archivo contiene validaciones para Cliente, Conductor y Logística
// ============================================

/**
 * Función principal de validación
 * @param {Object} config - Configuración con los IDs de los campos del formulario
 * @returns {boolean} - true si el formulario es válido, false en caso contrario
 */
function validarFormularioRegistro(config) {
    // Obtener valores de los campos
    const nombre = document.getElementById(config.nombreId).value.trim();
    const apellido = document.getElementById(config.apellidoId).value.trim();
    const numDocumento = document.getElementById(config.numDocumentoId).value.trim();
    const direccion = document.getElementById(config.direccionId).value.trim();
    const edad = document.getElementById(config.edadId).value.trim();
    const telefono = document.getElementById(config.telefonoId).value.trim();
    const correo = document.getElementById(config.correoId).value.trim();
    const password = document.getElementById(config.passwordId).value.trim();

    // ============================================
    // 1. VALIDAR NOMBRE
    // ============================================
    if (!nombre) {
        alert("El nombre es obligatorio");
        return false;
    }
    if (!validarSoloLetrasYEspacios(nombre)) {
        alert("El nombre solo puede contener letras y espacios");
        return false;
    }
    if (nombre.length < 2) {
        alert("El nombre debe tener al menos 2 caracteres");
        return false;
    }

    // ============================================
    // 2. VALIDAR APELLIDO
    // ============================================
    if (!apellido) {
        alert("El apellido es obligatorio");
        return false;
    }
    if (!validarSoloLetrasYEspacios(apellido)) {
        alert("El apellido solo puede contener letras y espacios");
        return false;
    }
    if (apellido.length < 2) {
        alert("El apellido debe tener al menos 2 caracteres");
        return false;
    }

    // ============================================
    // 3. VALIDAR NÚMERO DE DOCUMENTO
    // ============================================
    if (!numDocumento) {
        alert("El número de documento es obligatorio");
        return false;
    }
    if (!validarSoloNumeros(numDocumento)) {
        alert("El número de documento solo puede contener números");
        return false;
    }
    if (numDocumento.length < 6 || numDocumento.length > 12) {
        alert("El número de documento debe tener entre 6 y 12 dígitos");
        return false;
    }

    // ============================================
    // 4. VALIDAR DIRECCIÓN
    // ============================================
    if (!direccion) {
        alert("La dirección es obligatoria");
        return false;
    }
    if (direccion.length < 5) {
        alert("La dirección debe tener al menos 5 caracteres");
        return false;
    }

    // ============================================
    // 5. VALIDAR EDAD
    // ============================================
    if (!edad) {
        alert("La edad es obligatoria");
        return false;
    }
    const edadNum = parseInt(edad);
    if (isNaN(edadNum)) {
        alert("La edad debe ser un número válido");
        return false;
    }
    if (edadNum < 18 || edadNum > 100) {
        alert("La edad debe estar entre 18 y 100 años");
        return false;
    }

    // ============================================
    // 6. VALIDAR TELÉFONO
    // ============================================
    if (!telefono) {
        alert("El teléfono es obligatorio");
        return false;
    }
    if (!validarSoloNumeros(telefono)) {
        alert("El teléfono solo puede contener números");
        return false;
    }
    if (telefono.length < 7 || telefono.length > 10) {
        alert("El teléfono debe tener entre 7 y 10 dígitos");
        return false;
    }

    // ============================================
    // 7. VALIDAR CORREO ELECTRÓNICO
    // ============================================
    if (!correo) {
        alert("El correo electrónico es obligatorio");
        return false;
    }
    if (!validarFormatoCorreo(correo)) {
        alert("El formato del correo electrónico no es válido");
        return false;
    }

    // ============================================
    // 8. VALIDAR CONTRASEÑA
    // ============================================
    if (!password) {
        alert("La contraseña es obligatoria");
        return false;
    }
    if (password.length < 7) {
        alert("La contraseña debe tener al menos 7 caracteres");
        return false;
    }
    if (!validarPasswordConNumerosYLetras(password)) {
        alert("La contraseña debe contener números y letras");
        return false;
    }

    // Si todas las validaciones pasaron
    return true;
}

// ============================================
// FUNCIONES AUXILIARES DE VALIDACIÓN
// ============================================

/**
 * Valida que un texto contenga solo letras y espacios
 */
function validarSoloLetrasYEspacios(texto) {
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    return regex.test(texto);
}

/**
 * Valida que un texto contenga solo números
 */
function validarSoloNumeros(texto) {
    const regex = /^[0-9]+$/;
    return regex.test(texto);
}

/**
 * Valida el formato de un correo electrónico
 */
function validarFormatoCorreo(correo) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(correo);
}

/**
 * Valida que la contraseña contenga números y letras
 */
function validarPasswordConNumerosYLetras(password) {
    const tieneNumeros = /\d/.test(password);
    const tieneLetras = /[a-zA-Z]/.test(password);
    return tieneNumeros && tieneLetras;
}

// ============================================
// FUNCIÓN PARA INICIALIZAR VALIDACIÓN EN UN FORMULARIO
// ============================================

/**
 * Inicializa la validación en un formulario específico
 * @param {string} formId - ID del formulario
 * @param {Object} config - Configuración de IDs de campos
 */
function inicializarValidacion(formId, config) {
    const formulario = document.querySelector(formId);

    if (formulario) {
        formulario.addEventListener('submit', function(event) {
            // Validar el formulario
            const esValido = validarFormularioRegistro(config);

            // Si no es válido, prevenir el envío
            if (!esValido) {
                event.preventDefault();
                return false;
            }

            // Si es válido, permitir el envío
            return true;
        });
    }
}