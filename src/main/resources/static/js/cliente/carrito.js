// ===== carrito.js =====
// Archivo completo con validaciones

/* ============================================
   INICIALIZACIÓN
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    cargarCarrito();
    configurarEventos();
});

/* ============================================
   CARGAR CARRITO
   ============================================ */

function cargarCarrito() {
    fetch('/carrito/api/obtener')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarProductosCarrito(data.productos);
                actualizarTotal(data.total);
            } else {
                console.error("Error:", data.message);
            }
        })
        .catch(error => {
            console.error("Error al cargar carrito:", error);
        });
}

// Reemplazar solo la función mostrarProductosCarrito() en carrito.js

function mostrarProductosCarrito(productos) {
    const lista = document.getElementById("lista-productos");

    if (!productos || productos.length === 0) {
        lista.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <p style="font-size: 1.2rem; color: #666;">Tu carrito está vacío</p>
                <a href="/inicio_cliente" style="color: #F7DC6F; text-decoration: none; font-weight: bold;">
                    ← Continuar comprando
                </a>
            </div>
        `;
        return;
    }

    lista.innerHTML = "";

    productos.forEach(producto => {
        const item = document.createElement("div");
        item.className = "producto-carrito";
        item.innerHTML = `
            <div class="info-producto">
                <h4>${producto.nombreProducto}</h4>
                <p>Precio: $${parseInt(producto.precioUnitario).toLocaleString("es-CO")}</p>
            </div>
            <div class="cantidad-producto">
                <span>Cantidad: ${producto.cantidad}</span>
            </div>
            <div class="subtotal-producto">
                $${parseInt(producto.subtotal).toLocaleString("es-CO")}
            </div>
            <button class="btn-eliminar" onclick="eliminarProducto(${producto.id})">Eliminar</button>
        `;
        lista.appendChild(item);
    });
}

function actualizarTotal(total) {
    const totalElement = document.getElementById("total-general");
    if (totalElement) {
        totalElement.textContent = `Total: $${parseInt(total).toLocaleString("es-CO")}`;
    }
}

/* ============================================
   MODIFICAR CARRITO
   ============================================ */

function cambiarCantidad(idCarrito, nuevaCantidad) {
    if (nuevaCantidad <= 0) {
        eliminarProducto(idCarrito);
        return;
    }

    fetch(`/carrito/api/actualizar/${idCarrito}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cantidad: nuevaCantidad })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                cargarCarrito();
            } else {
                alert(data.message);
            }
        })
        .catch(error => console.error("Error:", error));
}

function eliminarProducto(idCarrito) {
    if (!confirm("¿Eliminar este producto del carrito?")) return;

    fetch(`/carrito/api/eliminar/${idCarrito}`, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                cargarCarrito();
            } else {
                alert(data.message);
            }
        })
        .catch(error => console.error("Error:", error));
}

/* ============================================
   FUNCIONES DE VALIDACIÓN
   ============================================ */

// Validación de dirección
function validarDireccion(direccion) {
    if (!direccion || direccion.trim().length < 6) {
        return {
            valido: false,
            mensaje: "La dirección debe tener al menos 6 caracteres"
        };
    }
    return { valido: true };
}

// Validación de teléfono de contacto
function validarTelefonoContacto(telefono) {
    const soloNumeros = telefono.replace(/\D/g, '');

    if (soloNumeros.length < 6 || soloNumeros.length > 12) {
        return {
            valido: false,
            mensaje: "El teléfono debe tener entre 6 y 12 dígitos"
        };
    }

    return { valido: true };
}

// Validación de número Nequi
function validarNumeroNequi(numero) {
    const soloNumeros = numero.replace(/\D/g, '');

    if (soloNumeros.length !== 10) {
        return {
            valido: false,
            mensaje: "El número Nequi debe tener exactamente 10 dígitos"
        };
    }

    return { valido: true };
}

// Validación de código de verificación Nequi
function validarCodigoNequi(codigo) {
    const soloNumeros = codigo.replace(/\D/g, '');

    if (soloNumeros.length !== 4) {
        return {
            valido: false,
            mensaje: "El código debe tener exactamente 4 dígitos"
        };
    }

    return { valido: true };
}

// Validación de número de tarjeta Visa
function validarNumeroTarjeta(numero) {
    const soloNumeros = numero.replace(/\D/g, '');

    if (soloNumeros.length !== 16) {
        return {
            valido: false,
            mensaje: "El número de tarjeta debe tener exactamente 16 dígitos"
        };
    }

    return { valido: true };
}

// Validación de nombre en tarjeta
function validarNombreTarjeta(nombre) {
    if (!nombre || nombre.trim().length === 0) {
        return {
            valido: false,
            mensaje: "El nombre no puede estar vacío"
        };
    }

    if (nombre.trim().length < 3) {
        return {
            valido: false,
            mensaje: "El nombre debe tener al menos 3 caracteres"
        };
    }

    return { valido: true };
}

// Validación de fecha de expiración
function validarFechaExpiracion(fecha) {
    const soloNumeros = fecha.replace(/\D/g, '');

    if (soloNumeros.length !== 4) {
        return {
            valido: false,
            mensaje: "La fecha debe tener exactamente 4 dígitos (MMYY)"
        };
    }

    const mes = parseInt(soloNumeros.substring(0, 2));
    const anio = parseInt(soloNumeros.substring(2, 4));

    if (mes < 1 || mes > 12) {
        return {
            valido: false,
            mensaje: "El mes debe estar entre 01 y 12"
        };
    }

    // Validar que no esté vencida
    const fechaActual = new Date();
    const anioActual = fechaActual.getFullYear() % 100; // Últimos 2 dígitos del año
    const mesActual = fechaActual.getMonth() + 1;

    if (anio < anioActual || (anio === anioActual && mes < mesActual)) {
        return {
            valido: false,
            mensaje: "La tarjeta está vencida"
        };
    }

    return { valido: true };
}

// Validación de CVV
function validarCVV(cvv) {
    const soloNumeros = cvv.replace(/\D/g, '');

    if (soloNumeros.length !== 3) {
        return {
            valido: false,
            mensaje: "El CVV debe tener exactamente 3 dígitos"
        };
    }

    return { valido: true };
}

/* ============================================
   FORMATEO AUTOMÁTICO DE CAMPOS
   ============================================ */

function configurarFormateoInputs() {
    // Teléfono de contacto - solo números
    const telefonoInput = document.getElementById("telefono");
    if (telefonoInput) {
        telefonoInput.addEventListener("input", function(e) {
            let valor = e.target.value.replace(/\D/g, '');
            if (valor.length > 12) valor = valor.substring(0, 12);
            e.target.value = valor;
        });
    }

    // Número Nequi - solo números, máximo 10
    const telefonoNequiInput = document.getElementById("telefono-nequi");
    if (telefonoNequiInput) {
        telefonoNequiInput.addEventListener("input", function(e) {
            let valor = e.target.value.replace(/\D/g, '');
            if (valor.length > 10) valor = valor.substring(0, 10);
            e.target.value = valor;
        });
    }

    // Código Nequi - solo números, máximo 4
    const codigoNequiInput = document.getElementById("codigo-nequi");
    if (codigoNequiInput) {
        codigoNequiInput.addEventListener("input", function(e) {
            let valor = e.target.value.replace(/\D/g, '');
            if (valor.length > 4) valor = valor.substring(0, 4);
            e.target.value = valor;
        });
    }

    // Número de tarjeta - formateo con espacios
    const numeroTarjetaInput = document.getElementById("numero-tarjeta");
    if (numeroTarjetaInput) {
        numeroTarjetaInput.addEventListener("input", function(e) {
            let valor = e.target.value.replace(/\D/g, '');
            if (valor.length > 16) valor = valor.substring(0, 16);

            // Formatear con espacios cada 4 dígitos
            let formateado = valor.match(/.{1,4}/g)?.join(' ') || valor;
            e.target.value = formateado;
        });
    }

    // Fecha de expiración - formato MM/YY
    const fechaExpInput = document.getElementById("fecha-exp");
    if (fechaExpInput) {
        fechaExpInput.addEventListener("input", function(e) {
            let valor = e.target.value.replace(/\D/g, '');
            if (valor.length > 4) valor = valor.substring(0, 4);

            // Agregar slash automáticamente
            if (valor.length >= 2) {
                valor = valor.substring(0, 2) + '/' + valor.substring(2);
            }

            e.target.value = valor;
        });
    }

    // CVV - solo números, máximo 3
    const cvvInput = document.getElementById("cvv");
    if (cvvInput) {
        cvvInput.addEventListener("input", function(e) {
            let valor = e.target.value.replace(/\D/g, '');
            if (valor.length > 3) valor = valor.substring(0, 3);
            e.target.value = valor;
        });
    }

    // Nombre en tarjeta - solo letras y espacios
    const nombreTarjetaInput = document.getElementById("nombre-tarjeta");
    if (nombreTarjetaInput) {
        nombreTarjetaInput.addEventListener("input", function(e) {
            // Permitir solo letras, espacios y convertir a mayúsculas
            e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').toUpperCase();
        });
    }
}

/* ============================================
   CONFIGURAR EVENTOS
   ============================================ */

function configurarEventos() {
    // Botones de navegación
    document.getElementById("continuar-pedido")?.addEventListener("click", continuarConPedido);
    document.getElementById("confirmar-pedido")?.addEventListener("click", confirmarPedido);
    document.getElementById("volver-carrito")?.addEventListener("click", volverAlCarrito);

    // Métodos de pago - usar event delegation
    document.querySelectorAll(".metodo-pago").forEach(elemento => {
        elemento.addEventListener("click", function() {
            const radio = this.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
            }
        });
    });

    // Cerrar modal al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            const modalId = e.target.id;
            if (modalId === 'modal-nequi') cerrarModal('nequi');
            if (modalId === 'modal-visa') cerrarModal('visa');
        }
    });

    // Configurar formateo automático de inputs
    configurarFormateoInputs();
}

/* ============================================
   NAVEGACIÓN ENTRE PASOS
   ============================================ */

function continuarConPedido() {
    fetch('/pedido/api/validar-stock')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarFormularioPedido();
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Error al validar stock");
        });
}

function mostrarFormularioPedido() {
    document.getElementById("vista-carrito").classList.add("oculto");
    document.getElementById("formulario-pedido").classList.remove("oculto");
    document.getElementById("paso1").classList.remove("activo");
    document.getElementById("paso2").classList.add("activo");
}

function volverAlCarrito() {
    document.getElementById("vista-carrito").classList.remove("oculto");
    document.getElementById("formulario-pedido").classList.add("oculto");
    document.getElementById("paso1").classList.add("activo");
    document.getElementById("paso2").classList.remove("activo");
}

/* ============================================
   CONFIRMAR PEDIDO CON VALIDACIONES
   ============================================ */

function confirmarPedido() {
    const telefono = document.getElementById("telefono").value.trim();
    const direccion = document.getElementById("direccion").value.trim();
    const metodoPago = document.querySelector('input[name="metodo-pago"]:checked');

    // Validar dirección
    const validacionDireccion = validarDireccion(direccion);
    if (!validacionDireccion.valido) {
        alert(validacionDireccion.mensaje);
        document.getElementById("direccion").focus();
        return;
    }

    // Validar teléfono
    const validacionTelefono = validarTelefonoContacto(telefono);
    if (!validacionTelefono.valido) {
        alert(validacionTelefono.mensaje);
        document.getElementById("telefono").focus();
        return;
    }

    // Validar método de pago
    if (!metodoPago) {
        alert("Debes seleccionar un método de pago");
        return;
    }

    // Abrir modal según el método
    const metodo = metodoPago.value.toLowerCase();
    if (metodo === 'nequi' || metodo === 'visa') {
        abrirModal(metodo);
    } else {
        alert("Método de pago no válido");
    }
}

/* ============================================
   GESTIÓN DE MODALES
   ============================================ */

function abrirModal(tipo) {
    const modal = document.getElementById(`modal-${tipo}`);
    if (!modal) return;

    // Mostrar modal
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('activo'), 10);

    // Mostrar total
    const totalElement = document.getElementById("total-general");
    if (totalElement) {
        const total = totalElement.textContent.replace('Total: ', '');
        const montoElement = document.getElementById(`monto-${tipo}`);
        if (montoElement) {
            montoElement.textContent = total;
        }
    }
}

function cerrarModal(tipo) {
    const modal = document.getElementById(`modal-${tipo}`);
    if (!modal) return;

    modal.classList.remove('activo');
    setTimeout(() => modal.style.display = 'none', 300);
}

/* ============================================
   PROCESAR PAGOS CON VALIDACIONES
   ============================================ */

function procesarPagoNequi() {
    const telefono = document.getElementById("telefono-nequi").value.trim();
    const codigo = document.getElementById("codigo-nequi").value.trim();

    // Validar número Nequi
    const validacionTelefono = validarNumeroNequi(telefono);
    if (!validacionTelefono.valido) {
        alert(validacionTelefono.mensaje);
        document.getElementById("telefono-nequi").focus();
        return;
    }

    // Validar código
    const validacionCodigo = validarCodigoNequi(codigo);
    if (!validacionCodigo.valido) {
        alert(validacionCodigo.mensaje);
        document.getElementById("codigo-nequi").focus();
        return;
    }

    cerrarModal('nequi');
    enviarPedidoAlServidor();
}

function procesarPagoVisa() {
    const numeroTarjeta = document.getElementById("numero-tarjeta").value.trim();
    const nombreTarjeta = document.getElementById("nombre-tarjeta").value.trim();
    const fechaExp = document.getElementById("fecha-exp").value.trim();
    const cvv = document.getElementById("cvv").value.trim();

    // Validar número de tarjeta
    const validacionNumero = validarNumeroTarjeta(numeroTarjeta);
    if (!validacionNumero.valido) {
        alert(validacionNumero.mensaje);
        document.getElementById("numero-tarjeta").focus();
        return;
    }

    // Validar nombre
    const validacionNombre = validarNombreTarjeta(nombreTarjeta);
    if (!validacionNombre.valido) {
        alert(validacionNombre.mensaje);
        document.getElementById("nombre-tarjeta").focus();
        return;
    }

    // Validar fecha de expiración
    const validacionFecha = validarFechaExpiracion(fechaExp);
    if (!validacionFecha.valido) {
        alert(validacionFecha.mensaje);
        document.getElementById("fecha-exp").focus();
        return;
    }

    // Validar CVV
    const validacionCVV = validarCVV(cvv);
    if (!validacionCVV.valido) {
        alert(validacionCVV.mensaje);
        document.getElementById("cvv").focus();
        return;
    }

    cerrarModal('visa');
    enviarPedidoAlServidor();
}

/* ============================================
   ENVIAR PEDIDO AL SERVIDOR CON OVERLAY
   ============================================ */

function enviarPedidoAlServidor() {
    const telefono = document.getElementById("telefono").value.trim();
    const direccion = document.getElementById("direccion").value.trim();
    const detalleCliente = document.getElementById("comentarios").value.trim();
    const metodoPagoElement = document.querySelector('input[name="metodo-pago"]:checked');

    if (!metodoPagoElement) {
        alert("Error: No se pudo obtener el método de pago");
        return;
    }

    const pedidoDTO = {
        telefono: telefono,
        direccion: direccion,
        detalleCliente: detalleCliente,
        metodoPago: metodoPagoElement.value
    };

    // Mostrar overlay de carga
    mostrarOverlayCarga();

    // Deshabilitar botón de confirmar
    const btnConfirmar = document.getElementById("confirmar-pedido");
    if (btnConfirmar) {
        btnConfirmar.disabled = true;
        btnConfirmar.textContent = "Procesando...";
    }

    fetch('/pedido/api/confirmar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedidoDTO)
    })
        .then(response => response.json())
        .then(data => {
            // Delay mínimo de 2 segundos
            setTimeout(() => {
                ocultarOverlayCarga();

                if (data.success) {
                    mostrarConfirmacion();
                } else {
                    alert(data.message);
                    if (btnConfirmar) {
                        btnConfirmar.disabled = false;
                        btnConfirmar.textContent = "Confirmar pedido";
                    }
                }
            }, 2000);
        })
        .catch(error => {
            ocultarOverlayCarga();

            console.error("Error:", error);
            alert("Error al confirmar el pedido");

            // Restaurar botón en caso de error
            if (btnConfirmar) {
                btnConfirmar.disabled = false;
                btnConfirmar.textContent = "Confirmar pedido";
            }
        });
}

function mostrarConfirmacion() {
    document.getElementById("formulario-pedido").classList.add("oculto");
    document.getElementById("resumen-pedido").classList.remove("oculto");
    document.getElementById("paso2").classList.remove("activo");
    document.getElementById("paso3").classList.add("activo");
}

/* ============================================
   OVERLAY DE CARGA
   ============================================ */

function mostrarOverlayCarga() {
    // Crear overlay si no existe
    let overlay = document.getElementById('overlay-carga');

    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'overlay-carga';
        overlay.className = 'overlay-carga';
        overlay.innerHTML = `
            <div class="spinner-contenedor">
                <div class="spinner"></div>
                <p>Procesando pago...</p>
                <p style="font-size: 0.9em; color: #ccc; margin-top: 10px;">
                    Por favor espera, no cierres esta ventana
                </p>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    // Mostrar con animación
    setTimeout(() => overlay.classList.add('activo'), 10);
}

function ocultarOverlayCarga() {
    const overlay = document.getElementById('overlay-carga');
    if (overlay) {
        overlay.classList.remove('activo');
        setTimeout(() => overlay.remove(), 300);
    }
}