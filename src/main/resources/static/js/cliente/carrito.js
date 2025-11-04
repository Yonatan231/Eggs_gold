let carrito = [
    { id: 1, nombre: "Camiseta Básica Negra", precio: 25.99, cantidad: 2 },
    { id: 2, nombre: "Pantalón Jeans Clásico", precio: 45.50, cantidad: 1 },
];

let metodoPagoSeleccionado = null;

function calcularTotal() {
    return carrito.reduce((total, producto) => {
        return total + (producto.precio * producto.cantidad);
    }, 0);
}

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

    document.querySelectorAll('.eliminar').forEach(boton => {
        boton.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            carrito = carrito.filter(p => p.id !== id);
            actualizarCarrito();
        });
    });
}

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

function procesarPagoNequi() {
    const telefono = document.getElementById('telefono-nequi').value;
    const codigo = document.getElementById('codigo-nequi').value;

    if (!telefono || !codigo) {
        alert('Por favor, completa todos los campos requeridos');
        return;
    }

    if (codigo.length !== 4) {
        alert('El código de confirmación debe tener 4 dígitos');
        return;
    }

    alert('✅ Pago procesado exitosamente con Nequi');
    cerrarModal('nequi');
    finalizarPedido();
}

function procesarPagoVisa() {
    const numeroTarjeta = document.getElementById('numero-tarjeta').value;
    const nombreTarjeta = document.getElementById('nombre-tarjeta').value;
    const fechaExp = document.getElementById('fecha-exp').value;
    const cvv = document.getElementById('cvv').value;

    if (!numeroTarjeta || !nombreTarjeta || !fechaExp || !cvv) {
        alert('Por favor, completa todos los campos requeridos');
        return;
    }

    if (cvv.length !== 3) {
        alert('El CVV debe tener 3 dígitos');
        return;
    }

    alert('✅ Pago procesado exitosamente con VISA');
    cerrarModal('visa');
    finalizarPedido();
}

function finalizarPedido() {
    carrito = [];
    actualizarCarrito();

    document.getElementById('formulario-pedido').classList.add('oculto');
    document.getElementById('resumen-pedido').classList.remove('oculto');
    actualizarPasos(3);
}

function confirmarPedido() {
    const direccion = document.getElementById('direccion').value;
    const telefono = document.getElementById('telefono').value;
    const metodoPago = document.querySelector('input[name="metodo-pago"]:checked');

    if (!direccion || !telefono) {
        alert('Por favor, completa todos los campos obligatorios.');
        return;
    }

    if (!metodoPago) {
        alert('Por favor, selecciona un método de pago.');
        return;
    }

    // Abrir el modal según el método de pago seleccionado
    abrirModal(metodoPago.value);
}

// Formatear número de tarjeta mientras se escribe
document.addEventListener('DOMContentLoaded', function() {
    actualizarCarrito();
    actualizarPasos(1);

    document.querySelectorAll('.metodo-pago').forEach(elemento => {
        elemento.addEventListener('click', function() {
            const metodo = this.getAttribute('data-metodo');
            seleccionarMetodoPago(metodo);
        });
    });

    const primerMetodo = document.querySelector('.metodo-pago');
    if (primerMetodo) {
        seleccionarMetodoPago(primerMetodo.getAttribute('data-metodo'));
    }

    document.getElementById('continuar-pedido').addEventListener('click', mostrarFormularioPedido);
    document.getElementById('volver-carrito').addEventListener('click', volverAlCarrito);
    document.getElementById('confirmar-pedido').addEventListener('click', confirmarPedido);
    document.getElementById('ver-historial').addEventListener('click', function() {
        alert('Aquí se mostraría el historial de pedidos');
    });
    document.getElementById('nueva-compra').addEventListener('click', function() {
        document.getElementById('resumen-pedido').classList.add('oculto');
        document.getElementById('vista-carrito').classList.remove('oculto');
        actualizarPasos(1);

        // Restaurar productos de prueba para nueva compra
        carrito = [
            { id: 1, nombre: "Camiseta Básica Negra", precio: 25.99, cantidad: 2 },
            { id: 2, nombre: "Pantalón Jeans Clásico", precio: 45.50, cantidad: 1 },

        ];
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