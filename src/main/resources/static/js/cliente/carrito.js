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
                <button onclick="cambiarCantidad(${producto.id}, ${producto.cantidad - 1})">-</button>
                <span>${producto.cantidad}</span>
                <button onclick="cambiarCantidad(${producto.id}, ${producto.cantidad + 1})">+</button>
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
   CONFIRMAR PEDIDO
   ============================================ */

function confirmarPedido() {
    const telefono = document.getElementById("telefono").value.trim();
    const direccion = document.getElementById("direccion").value.trim();
    const metodoPago = document.querySelector('input[name="metodo-pago"]:checked');

    // Validaciones
    if (!direccion) {
        alert("La dirección es obligatoria");
        return;
    }

    if (!telefono) {
        alert("El teléfono es obligatorio");
        return;
    }

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
   PROCESAR PAGOS
   ============================================ */

function procesarPagoNequi() {
    const telefono = document.getElementById("telefono-nequi").value.trim();
    const codigo = document.getElementById("codigo-nequi").value.trim();

    if (!telefono || !codigo) {
        alert("Debes completar todos los campos");
        return;
    }

    if (codigo.length !== 4) {
        alert("El código debe tener 4 dígitos");
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

    if (!numeroTarjeta || !nombreTarjeta || !fechaExp || !cvv) {
        alert("Debes completar todos los campos");
        return;
    }

    if (cvv.length !== 3) {
        alert("El CVV debe tener 3 dígitos");
        return;
    }

    cerrarModal('visa');
    enviarPedidoAlServidor();
}

/* ============================================
   ENVIAR PEDIDO AL SERVIDOR
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

    fetch('/pedido/api/confirmar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedidoDTO)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarConfirmacion();
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Error al confirmar el pedido");
        });
}

function mostrarConfirmacion() {
    document.getElementById("formulario-pedido").classList.add("oculto");
    document.getElementById("resumen-pedido").classList.remove("oculto");
    document.getElementById("paso2").classList.remove("activo");
    document.getElementById("paso3").classList.add("activo");
}