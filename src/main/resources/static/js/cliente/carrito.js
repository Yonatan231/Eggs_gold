document.addEventListener('DOMContentLoaded', () => {
    cargarCarrito();
    configurarEventos();
});

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


function validarDireccion(direccion) {
    if (!direccion || direccion.trim().length < 6) {
        return {
            valido: false,
            mensaje: "la direccion debe tener al menos 6 caracteres"
        };
    }
    return { valido: true };
}

function validarTelefonoContacto(telefono) {
    const soloNumeros = telefono.replace(/\D/g, '');

    if (soloNumeros.length !== 10) {
        return {
            valido: false,
            mensaje: "el telefono debe tener exactamente 10 digitos"
        };
    }

    return { valido: true };
}

function validarNumeroNequi(numero) {
    const soloNumeros = numero.replace(/\D/g, '');

    if (soloNumeros.length !== 10) {
        return {
            valido: false,
            mensaje: "el numero nequi debe tener exactamente 10 digitos"
        };
    }

    return { valido: true };
}

function validarCodigoNequi(codigo) {
    const soloNumeros = codigo.replace(/\D/g, '');

    if (soloNumeros.length !== 4) {
        return {
            valido: false,
            mensaje: "el codigo debe tener exactamente 4 digitos"
        };
    }

    return { valido: true };
}

function validarNumeroTarjeta(numero) {
    const soloNumeros = numero.replace(/\D/g, '');

    if (soloNumeros.length !== 16) {
        return {
            valido: false,
            mensaje: "el numero de tarjeta debe tener exactamente 16 digitos"
        };
    }

    return { valido: true };
}

function validarNombreTarjeta(nombre) {
    if (!nombre || nombre.trim().length === 0) {
        return {
            valido: false,
            mensaje: "el nombre no puede estar vacio"
        };
    }

    if (nombre.trim().length < 3) {
        return {
            valido: false,
            mensaje: "el nombre debe tener al menos 3 caracteres"
        };
    }

    return { valido: true };
}

function validarFechaExpiracion(fecha) {
    const soloNumeros = fecha.replace(/\D/g, '');

    if (soloNumeros.length !== 4) {
        return {
            valido: false,
            mensaje: "la fecha debe tener exactamente 4 digitos (MMYY)"
        };
    }

    const mes = parseInt(soloNumeros.substring(0, 2));
    const anio = parseInt(soloNumeros.substring(2, 4));

    if (mes < 1 || mes > 12) {
        return {
            valido: false,
            mensaje: "el mes debe estar entre 01 y 12"
        };
    }

    const fechaActual = new Date();
    const anioActual = fechaActual.getFullYear() % 100;
    const mesActual = fechaActual.getMonth() + 1;

    if (anio < anioActual || (anio === anioActual && mes < mesActual)) {
        return {
            valido: false,
            mensaje: "la tarjeta esta vencida"
        };
    }

    return { valido: true };
}

function validarCVV(cvv) {
    const soloNumeros = cvv.replace(/\D/g, '');

    if (soloNumeros.length !== 3) {
        return {
            valido: false,
            mensaje: "el cvv debe tener exactamente 3 digitos"
        };
    }

    return { valido: true };
}


function formatearNumeroTarjeta(input) {
    let valor = input.value.replace(/\D/g, '');
    valor = valor.substring(0, 16);
    const partes = valor.match(/.{1,4}/g);
    input.value = partes ? partes.join(' ') : '';
}

function formatearFechaExpiracion(input) {
    let valor = input.value.replace(/\D/g, '');
    if (valor.length >= 2) {
        valor = valor.substring(0, 2) + '/' + valor.substring(2, 4);
    }
    input.value = valor;
}

function soloNumeros(input) {
    input.value = input.value.replace(/\D/g, '');
}


function configurarEventos() {
    const btnContinuar = document.getElementById("continuar-pedido");
    if (btnContinuar) {
        btnContinuar.addEventListener("click", continuarConPedido);
    }

    const btnVolver = document.getElementById("volver-carrito");
    if (btnVolver) {
        btnVolver.addEventListener("click", volverAlCarrito);
    }

    const btnConfirmar = document.getElementById("confirmar-pedido");
    if (btnConfirmar) {
        btnConfirmar.addEventListener("click", confirmarPedido);
    }

    const btnPagoNequi = document.getElementById("procesar-pago-nequi");
    if (btnPagoNequi) {
        btnPagoNequi.addEventListener("click", procesarPagoNequi);
    }

    const btnPagoVisa = document.getElementById("procesar-pago-visa");
    if (btnPagoVisa) {
        btnPagoVisa.addEventListener("click", procesarPagoVisa);
    }

    const numeroTarjeta = document.getElementById("numero-tarjeta");
    if (numeroTarjeta) {
        numeroTarjeta.addEventListener("input", function() {
            formatearNumeroTarjeta(this);
        });
    }

    const fechaExp = document.getElementById("fecha-exp");
    if (fechaExp) {
        fechaExp.addEventListener("input", function() {
            formatearFechaExpiracion(this);
        });
    }

    const cvv = document.getElementById("cvv");
    if (cvv) {
        cvv.addEventListener("input", function() {
            soloNumeros(this);
        });
    }

    const telefonoNequi = document.getElementById("telefono-nequi");
    if (telefonoNequi) {
        telefonoNequi.addEventListener("input", function() {
            soloNumeros(this);
        });
    }

    const codigoNequi = document.getElementById("codigo-nequi");
    if (codigoNequi) {
        codigoNequi.addEventListener("input", function() {
            soloNumeros(this);
        });
    }
}


function continuarConPedido() {
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

function confirmarPedido() {
    const telefono = document.getElementById("telefono").value.trim();
    const direccion = document.getElementById("direccion").value.trim();
    const metodoPago = document.querySelector('input[name="metodo-pago"]:checked');

    const validacionDireccion = validarDireccion(direccion);
    if (!validacionDireccion.valido) {
        alert(validacionDireccion.mensaje);
        document.getElementById("direccion").focus();
        return;
    }

    const validacionTelefono = validarTelefonoContacto(telefono);
    if (!validacionTelefono.valido) {
        alert(validacionTelefono.mensaje);
        document.getElementById("telefono").focus();
        return;
    }

    if (!metodoPago) {
        alert("debes seleccionar un metodo de pago");
        return;
    }

    const metodo = metodoPago.value.toLowerCase();
    if (metodo === 'nequi' || metodo === 'visa') {
        abrirModal(metodo);
    } else {
        alert("metodo de pago no valido");
    }
}

function abrirModal(tipo) {
    const modal = document.getElementById(`modal-${tipo}`);
    if (!modal) return;

    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('activo'), 10);

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


function procesarPagoNequi() {
    const telefono = document.getElementById("telefono-nequi").value.trim();
    const codigo = document.getElementById("codigo-nequi").value.trim();

    const validacionTelefono = validarNumeroNequi(telefono);
    if (!validacionTelefono.valido) {
        alert(validacionTelefono.mensaje);
        document.getElementById("telefono-nequi").focus();
        return;
    }

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

    const validacionNumero = validarNumeroTarjeta(numeroTarjeta);
    if (!validacionNumero.valido) {
        alert(validacionNumero.mensaje);
        document.getElementById("numero-tarjeta").focus();
        return;
    }

    const validacionNombre = validarNombreTarjeta(nombreTarjeta);
    if (!validacionNombre.valido) {
        alert(validacionNombre.mensaje);
        document.getElementById("nombre-tarjeta").focus();
        return;
    }

    const validacionFecha = validarFechaExpiracion(fechaExp);
    if (!validacionFecha.valido) {
        alert(validacionFecha.mensaje);
        document.getElementById("fecha-exp").focus();
        return;
    }

    const validacionCVV = validarCVV(cvv);
    if (!validacionCVV.valido) {
        alert(validacionCVV.mensaje);
        document.getElementById("cvv").focus();
        return;
    }

    cerrarModal('visa');
    enviarPedidoAlServidor();
}


function enviarPedidoAlServidor() {
    const telefono = document.getElementById("telefono").value.trim();
    const direccion = document.getElementById("direccion").value.trim();
    const detalleCliente = document.getElementById("comentarios").value.trim();
    const metodoPagoElement = document.querySelector('input[name="metodo-pago"]:checked');

    if (!metodoPagoElement) {
        alert("error: no se pudo obtener el metodo de pago");
        return;
    }

    const pedidoDTO = {
        telefono: telefono,
        direccion: direccion,
        detalleCliente: detalleCliente,
        metodoPago: metodoPagoElement.value
    };

    mostrarOverlayCarga();

    const btnConfirmar = document.getElementById("confirmar-pedido");
    if (btnConfirmar) {
        btnConfirmar.disabled = true;
        btnConfirmar.textContent = "procesando...";
    }

    fetch('/pedido/api/confirmar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedidoDTO)
    })
        .then(response => response.json())
        .then(data => {
            ocultarOverlayCarga();

            if (data.success) {
                mostrarConfirmacion();
            } else {
                alert(data.message);
                if (btnConfirmar) {
                    btnConfirmar.disabled = false;
                    btnConfirmar.textContent = "confirmar pedido";
                }
            }
        })
        .catch(error => {
            ocultarOverlayCarga();

            console.error("error:", error);
            alert("error al confirmar el pedido");

            if (btnConfirmar) {
                btnConfirmar.disabled = false;
                btnConfirmar.textContent = "confirmar pedido";
            }
        });
}

function mostrarConfirmacion() {
    document.getElementById("formulario-pedido").classList.add("oculto");
    document.getElementById("resumen-pedido").classList.remove("oculto");
    document.getElementById("paso2").classList.remove("activo");
    document.getElementById("paso3").classList.add("activo");
}


function mostrarOverlayCarga() {
    let overlay = document.getElementById('overlay-carga');

    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'overlay-carga';
        overlay.className = 'overlay-carga';
        overlay.innerHTML = `
            <div class="spinner-contenedor">
                <div class="spinner"></div>
                <p>procesando pago...</p>
                <p style="font-size: 0.9em; color: #ccc; margin-top: 10px;">
                    por favor espera no cierres esta ventana
                </p>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    setTimeout(() => overlay.classList.add('activo'), 10);
}

function ocultarOverlayCarga() {
    const overlay = document.getElementById('overlay-carga');
    if (overlay) {
        overlay.classList.remove('activo');
        setTimeout(() => overlay.remove(), 300);
    }
}