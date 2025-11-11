// ========================================
// VARIABLES GLOBALES
// ========================================

let carrito = []; // Array para almacenar productos del carrito
let metodoPagoSeleccionado = null; // Método de pago seleccionado por el usuario

// ========================================
// CARGA INICIAL DEL CARRITO
// ========================================

document.addEventListener("DOMContentLoaded", () => {
    console.log("🔄 Iniciando carga del carrito...");

    // ✅ El backend obtiene el usuario_id desde la sesión automáticamente
    // NO necesitamos pasar el usuario en la URL
    fetch('/api/carrito/temporal', {
        method: 'GET',
        credentials: 'include'  // 🔒 Importante: mantiene la sesión
    })
        .then(response => {
            console.log("📥 Respuesta del servidor:", response.status);

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("No estás autenticado. Por favor inicia sesión.");
                }
                throw new Error("Error al obtener el carrito");
            }
            return response.json();
        })
        .then(data => {
            console.log("📦 Carrito recibido del servidor:", data);

            if (Array.isArray(data) && data.length > 0) {
                carrito = data.map(p => ({
                    id: p.id || p.productoId,
                    nombre: p.nombre || p.productoNombre,
                    precio: p.precio || 0,
                    cantidad: p.cantidad || 1
                }));
                console.log("✅ Carrito procesado:", carrito);
                actualizarCarrito();
            } else {
                console.log("📭 Carrito vacío");
                document.getElementById("lista-productos").innerHTML =
                    '<div class="carrito-vacio">Tu carrito está vacío</div>';
            }
        })
        .catch(error => {
            console.error("❌ Error al cargar productos del carrito:", error);
            document.getElementById("lista-productos").innerHTML =
                '<div class="carrito-vacio">❌ ' + error.message + '</div>';
        });
});

// ========================================
// FUNCIONES DE CÁLCULO
// ========================================

function calcularTotal() {
    return carrito.reduce((total, producto) => {
        return total + (producto.precio * producto.cantidad);
    }, 0);
}

// ========================================
// FUNCIONES DE ACTUALIZACIÓN DEL CARRITO
// ========================================

function actualizarCarrito() {
    const listaProductos = document.getElementById('lista-productos');
    const totalGeneral = document.getElementById('total-general');

    listaProductos.innerHTML = '';

    if (carrito.length === 0) {
        listaProductos.innerHTML = '<div class="carrito-vacio">Tu carrito está vacío</div>';
        totalGeneral.textContent = 'Total: $0.00';
        return;
    }

    carrito.forEach(producto => {
        const productoElemento = document.createElement('div');
        productoElemento.className = 'producto';

        productoElemento.innerHTML = `
                    <div class="producto-info">
                        <div class="producto-nombre">${producto.nombre}</div>
                        <div class="producto-precio">$${producto.precio.toFixed(2)}</div>
                    </div>
                    <div class="cantidad">
                        <button class="disminuir" data-id="${producto.id}">-</button>
                        <input type="number" value="${producto.cantidad}" min="1" data-id="${producto.id}">
                        <button class="aumentar" data-id="${producto.id}">+</button>
                    </div>
                    <button class="eliminar" data-id="${producto.id}">Eliminar</button>
                `;

        listaProductos.appendChild(productoElemento);
    });

    totalGeneral.textContent = `Total: $${calcularTotal().toFixed(2)}`;
    agregarEventListeners();
}

function agregarEventListeners() {
    // Botón aumentar cantidad
    document.querySelectorAll('.aumentar').forEach(boton => {
        boton.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            const producto = carrito.find(p => p.id === id);
            if (producto) {
                producto.cantidad++;
                actualizarCarrito();
            }
        });
    });

    // Botón disminuir cantidad
    document.querySelectorAll('.disminuir').forEach(boton => {
        boton.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            const producto = carrito.find(p => p.id === id);
            if (producto && producto.cantidad > 1) {
                producto.cantidad--;
                actualizarCarrito();
            }
        });
    });

    // Input de cantidad
    document.querySelectorAll('.cantidad input').forEach(input => {
        input.addEventListener('change', function() {
            const id = parseInt(this.getAttribute('data-id'));
            const producto = carrito.find(p => p.id === id);
            if (producto) {
                const nuevaCantidad = parseInt(this.value);
                if (nuevaCantidad > 0) {
                    producto.cantidad = nuevaCantidad;
                    actualizarCarrito();
                } else {
                    this.value = producto.cantidad;
                }
            }
        });
    });

    agregarEventosEliminar();
}

function agregarEventosEliminar() {
    document.querySelectorAll(".eliminar").forEach(boton => {
        boton.addEventListener("click", () => {
            const id = boton.getAttribute("data-id");

            if (confirm("¿Estás seguro de eliminar este producto del carrito?")) {
                fetch(`/api/carrito/eliminar?id=${id}`, {
                    method: "DELETE",
                    credentials: 'include'
                })
                    .then(response => response.text())
                    .then(msg => {
                        alert(msg);
                        // Refresca el carrito desde backend (sin usuario en URL)
                        fetch('/api/carrito/temporal', {
                            credentials: 'include'
                        })
                            .then(resp => resp.json())
                            .then(data => {
                                if (Array.isArray(data) && data.length > 0) {
                                    carrito = data.map(p => ({
                                        id: p.id || p.productoId,
                                        nombre: p.nombre || p.productoNombre,
                                        precio: p.precio || 0,
                                        cantidad: p.cantidad || 1
                                    }));
                                } else {
                                    carrito = [];
                                }
                                actualizarCarrito();
                            });
                    })
                    .catch(error => console.error("❌ Error al eliminar el producto:", error));
            }
        });
    });
}

// ========================================
// FUNCIONES DE NAVEGACIÓN
// ========================================

function actualizarPasos(pasoActual) {
    document.querySelectorAll('.paso').forEach(paso => {
        paso.classList.remove('activo', 'completado');
    });

    if (pasoActual === 1) {
        document.getElementById('paso1').classList.add('activo');
    } else if (pasoActual === 2) {
        document.getElementById('paso1').classList.add('completado');
        document.getElementById('paso2').classList.add('activo');
    } else if (pasoActual === 3) {
        document.getElementById('paso1').classList.add('completado');
        document.getElementById('paso2').classList.add('completado');
        document.getElementById('paso3').classList.add('activo');
    }
}

function mostrarFormularioPedido() {
    document.getElementById('vista-carrito').classList.add('oculto');
    document.getElementById('formulario-pedido').classList.remove('oculto');
    actualizarPasos(2);
}

function volverAlCarrito() {
    document.getElementById('formulario-pedido').classList.add('oculto');
    document.getElementById('vista-carrito').classList.remove('oculto');
    actualizarPasos(1);
}

// ========================================
// FUNCIONES DE MÉTODO DE PAGO
// ========================================

function seleccionarMetodoPago(metodo) {
    document.querySelectorAll('.metodo-pago').forEach(elemento => {
        elemento.classList.remove('seleccionado');
    });

    const elementoMetodo = document.querySelector(`.metodo-pago[data-metodo="${metodo}"]`);
    if (elementoMetodo) {
        elementoMetodo.classList.add('seleccionado');
        const radioButton = elementoMetodo.querySelector('input[type="radio"]');
        radioButton.checked = true;
        metodoPagoSeleccionado = metodo;
    }
}

// ========================================
// FUNCIONES DE MODALES
// ========================================

function abrirModal(tipo) {
    const total = calcularTotal();

    if (tipo === 'nequi') {
        document.getElementById('monto-nequi').textContent = `$${total.toFixed(2)}`;
        document.getElementById('modal-nequi').classList.add('activo');
    } else if (tipo === 'visa') {
        document.getElementById('monto-visa').textContent = `$${total.toFixed(2)}`;
        document.getElementById('modal-visa').classList.add('activo');
    }
}

function cerrarModal(tipo) {
    if (tipo === 'nequi') {
        document.getElementById('modal-nequi').classList.remove('activo');
        limpiarFormularioNequi();
    } else if (tipo === 'visa') {
        document.getElementById('modal-visa').classList.remove('activo');
        limpiarFormularioVisa();
    }
}

function limpiarFormularioNequi() {
    document.getElementById('telefono-nequi').value = '';
    document.getElementById('codigo-nequi').value = '';
}

function limpiarFormularioVisa() {
    document.getElementById('numero-tarjeta').value = '';
    document.getElementById('nombre-tarjeta').value = '';
    document.getElementById('fecha-exp').value = '';
    document.getElementById('cvv').value = '';
}

// ========================================
// FUNCIONES DE PROCESAMIENTO DE PAGO
// ========================================

function procesarPagoNequi() {
    const telefono = document.getElementById('telefono-nequi').value.trim();
    const codigo = document.getElementById('codigo-nequi').value.trim();

    // Validaciones del formulario de Nequi
    if (!telefono || !codigo) {
        alert('⚠️ Por favor, completa todos los campos requeridos');
        return;
    }

    if (codigo.length !== 4) {
        alert('⚠️ El código de confirmación debe tener 4 dígitos');
        return;
    }

    // Mostrar mensaje de procesamiento
    console.log('💳 Procesando pago con Nequi...');
    console.log('Teléfono:', telefono);
    console.log('Código:', codigo);

    // Cerramos el modal
    cerrarModal('nequi');

    // ✅ Llamamos a la función que crea el pedido en la BD
    finalizarPedido();
}

function procesarPagoVisa() {
    const numeroTarjeta = document.getElementById('numero-tarjeta').value.replace(/\s/g, '');
    const nombreTarjeta = document.getElementById('nombre-tarjeta').value.trim();
    const fechaExp = document.getElementById('fecha-exp').value.trim();
    const cvv = document.getElementById('cvv').value.trim();

    // Validaciones del formulario de VISA
    if (!numeroTarjeta || !nombreTarjeta || !fechaExp || !cvv) {
        alert('⚠️ Por favor, completa todos los campos requeridos');
        return;
    }

    if (cvv.length !== 3) {
        alert('⚠️ El CVV debe tener 3 dígitos');
        return;
    }

    if (numeroTarjeta.length < 13 || numeroTarjeta.length > 19) {
        alert('⚠️ Número de tarjeta inválido');
        return;
    }

    // Mostrar mensaje de procesamiento
    console.log('💳 Procesando pago con VISA...');
    console.log('Tarjeta:', numeroTarjeta.slice(-4)); // Solo mostramos últimos 4 dígitos

    // Cerramos el modal
    cerrarModal('visa');

    // ✅ Llamamos a la función que crea el pedido en la BD
    finalizarPedido();
}

function finalizarPedido() {
    // 📦 1. Obtenemos los datos del formulario
    const direccion = document.getElementById('direccion').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const comentarios = document.getElementById('comentarios').value.trim();

    // 🔍 2. Validación adicional
    if (!direccion) {
        alert('⚠️ Por favor ingresa una dirección de entrega.');
        return;
    }

    console.log('📤 Enviando pedido al servidor...');
    console.log('📍 Dirección:', direccion); // ✅ AGREGADO para debug

    fetch('/api/pedido/confirmar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
            direccion: direccion  // ✅ Asegúrate que esto no sea vacío
        })
    })
        .then(response => {
            console.log('📥 Respuesta recibida:', response);

            // ✅ AGREGADO: Leer el mensaje de error del servidor
            if (!response.ok) {
                return response.text().then(errorMsg => {
                    throw new Error(errorMsg || 'Error en el servidor: ' + response.status);
                });
            }
            return response.text();
        })
        .then(mensaje => {
            console.log('✅ Pedido confirmado:', mensaje);
            alert('✅ ' + mensaje);

            carrito = [];
            actualizarCarrito();

            document.getElementById('formulario-pedido').classList.add('oculto');
            document.getElementById('resumen-pedido').classList.remove('oculto');
            actualizarPasos(3);

            document.getElementById('direccion').value = '';
            document.getElementById('telefono').value = '';
            document.getElementById('comentarios').value = '';
        })
        .catch(error => {
            console.error('❌ Error al confirmar el pedido:', error);
            alert('❌ ' + error.message); // ✅ Ahora verás el mensaje exacto del backend
        });
}

// ========================================
// FUNCIÓN DE CONFIRMACIÓN DE PEDIDO
// ========================================

function confirmarPedido() {
    const direccion = document.getElementById('direccion').value;
    const telefono = document.getElementById('telefono').value;
    const metodoPago = document.querySelector('input[name="metodo-pago"]:checked');

    if (!direccion || !telefono) {
        alert('⚠️ Por favor, completa todos los campos obligatorios.');
        return;
    }

    if (!metodoPago) {
        alert('⚠️ Por favor, selecciona un método de pago.');
        return;
    }

    // Abrir el modal según el método de pago seleccionado
    abrirModal(metodoPago.value);
}

// ========================================
// EVENT LISTENERS
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    actualizarCarrito();
    actualizarPasos(1);

    // Selección de método de pago
    document.querySelectorAll('.metodo-pago').forEach(elemento => {
        elemento.addEventListener('click', function() {
            const metodo = this.getAttribute('data-metodo');
            seleccionarMetodoPago(metodo);
        });
    });

    // Seleccionar el primer método de pago por defecto
    const primerMetodo = document.querySelector('.metodo-pago');
    if (primerMetodo) {
        seleccionarMetodoPago(primerMetodo.getAttribute('data-metodo'));
    }

    // Botones de navegación
    document.getElementById('continuar-pedido').addEventListener('click', mostrarFormularioPedido);
    document.getElementById('volver-carrito').addEventListener('click', volverAlCarrito);
    document.getElementById('confirmar-pedido').addEventListener('click', confirmarPedido);

    // Botón de nueva compra
    document.getElementById('nueva-compra').addEventListener('click', function() {
        document.getElementById('resumen-pedido').classList.add('oculto');
        document.getElementById('vista-carrito').classList.remove('oculto');
        actualizarPasos(1);
        carrito = [];
        actualizarCarrito();
    });

    // Formatear número de tarjeta
    document.getElementById('numero-tarjeta').addEventListener('input', function(e) {
        let valor = e.target.value.replace(/\s/g, '');
        let valorFormateado = valor.match(/.{1,4}/g);
        e.target.value = valorFormateado ? valorFormateado.join(' ') : '';
    });

    // Formatear fecha de expiración
    document.getElementById('fecha-exp').addEventListener('input', function(e) {
        let valor = e.target.value.replace(/\D/g, '');
        if (valor.length >= 2) {
            valor = valor.slice(0, 2) + '/' + valor.slice(2, 4);
        }
        e.target.value = valor;
    });

    // Solo números en CVV
    document.getElementById('cvv').addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '');
    });

    // Solo números en código Nequi
    document.getElementById('codigo-nequi').addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '');
    });

    // Cerrar modal al hacer clic fuera
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                const modalId = this.id.replace('modal-', '');
                cerrarModal(modalId);
            }
        });
    });
});