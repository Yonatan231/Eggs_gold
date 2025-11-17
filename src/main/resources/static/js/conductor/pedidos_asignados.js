// ============================================
// SCRIPT PARA PEDIDOS ASIGNADOS DEL CONDUCTOR
// Versión simplificada para principiantes
// ============================================

// ============================================
// DATOS DE EJEMPLO (simulan el servidor)
// ============================================
const pedidosEjemplo = {
    15: {
        cliente: "Juan Pérez",
        direccion: "Calle 12 # 5-10",
        telefono: "321 456 7890",
        productos: [
            { nombre: "Huevo Verde", categoria: "AA", cantidad: 2 },
            { nombre: "Huevo de Campo", categoria: "A", cantidad: 1 }
        ]
    },
    16: {
        cliente: "María González",
        direccion: "Carrera 20 # 22-33",
        telefono: "310 234 5678",
        productos: [
            { nombre: "Huevo Orgánico", categoria: "AAA", cantidad: 2 }
        ]
    },
    17: {
        cliente: "Carlos Rodríguez",
        direccion: "Avenida 15 # 30-45",
        telefono: "315 678 9012",
        productos: [
            { nombre: "Huevo Blanco", categoria: "AA", cantidad: 3 },
            { nombre: "Huevo Moreno", categoria: "A", cantidad: 2 }
        ]
    }
};

// ============================================
// BOTÓN PARA ABRIR/CERRAR EL MENÚ
// ============================================
const botonMenu = document.querySelector('.toggle-btn');

// Cuando se hace clic en el botón del menú
botonMenu.addEventListener('click', function () {
    const menuLateral = document.getElementById('sidebar');

    // Si el menú está abierto, lo cierra. Si está cerrado, lo abre
    menuLateral.classList.toggle('active');
});

// ============================================
// CUANDO LA PÁGINA CARGA
// Ejecuta estas funciones automáticamente
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    actualizarContador(); // Actualiza el contador de pedidos
});

// ============================================
// FUNCIÓN: actualizarContador()
// Cuenta cuántos pedidos hay en la tabla
// ============================================
function actualizarContador() {
    // Obtiene todas las filas de pedidos
    const filas = document.querySelectorAll('#tablaBody tr');

    // Cuenta cuántas filas hay
    const total = filas.length;

    // Actualiza el número en el contador
    document.getElementById('contador').textContent = total;

    // Si no hay pedidos, muestra el mensaje
    if (total === 0) {
        document.getElementById('tablaPedidos').style.display = 'none';
        document.getElementById('sin-pedidos').style.display = 'block';
    } else {
        document.getElementById('tablaPedidos').style.display = 'table';
        document.getElementById('sin-pedidos').style.display = 'none';
    }
}

// ============================================
// FUNCIÓN: aceptarPedido(idPedido)
// Simula aceptar un pedido
// ============================================
function aceptarPedido(idPedido) {
    // Pedimos confirmación
    if (!confirm('¿Deseas aceptar el pedido #' + idPedido + '?')) {
        return; // Si dice que no, no hace nada
    }

    // Busca la fila del pedido
    const filas = document.querySelectorAll('#tablaBody tr');
    let filaEliminar = null;

    // Busca la fila que contiene este pedido
    filas.forEach(function(fila) {
        const idCelda = fila.querySelector('td:first-child').textContent;
        if (idCelda == idPedido) {
            filaEliminar = fila;
        }
    });

    // Si encontró la fila
    if (filaEliminar) {
        // Elimina la fila
        filaEliminar.remove();

        // Actualiza el contador
        actualizarContador();

        // Muestra mensaje de éxito
        mostrarMensaje('✓ Pedido #' + idPedido + ' aceptado correctamente', 'success');
    }
}

// ============================================
// FUNCIÓN: verDetalle(idPedido)
// Abre el modal con los detalles del pedido
// ============================================
function verDetalle(idPedido) {
    // Poner el ID del pedido en el título del modal
    document.getElementById('pedidoId').textContent = idPedido;

    // Obtener los datos del pedido
    const pedido = pedidosEjemplo[idPedido];

    // Si existe el pedido
    if (pedido) {
        // Llenar la información del cliente
        document.getElementById('clienteNombre').textContent = pedido.cliente;
        document.getElementById('clienteDireccion').textContent = pedido.direccion;
        document.getElementById('clienteTelefono').textContent = pedido.telefono;

        // Llenar la lista de productos
        const lista = document.getElementById('listaProductos');
        lista.innerHTML = ''; // Limpiar la lista

        // Agregar cada producto a la lista
        pedido.productos.forEach(function(producto) {
            const li = document.createElement('li');
            li.textContent = producto.nombre + ' - Categoría: ' + producto.categoria + ' - ' + producto.cantidad + ' unidades';
            lista.appendChild(li);
        });

        // Mostrar el modal
        document.getElementById('modalDetallePedido').style.display = 'flex';

    } else {
        // Si no existe, mostrar alerta
        alert('No hay datos disponibles para este pedido');
    }
}

// ============================================
// FUNCIÓN: cerrarModal()
// Cierra el modal de detalles
// ============================================
function cerrarModal() {
    const modal = document.getElementById('modalDetallePedido');
    modal.style.display = 'none'; // Oculta el modal
}

// ============================================
// FUNCIÓN: aceptarDesdeModal()
// Acepta el pedido desde el modal
// ============================================
function aceptarDesdeModal() {
    // Obtener el ID del pedido del modal
    const idPedido = document.getElementById('pedidoId').textContent;

    // Cerrar el modal
    cerrarModal();

    // Aceptar el pedido
    aceptarPedido(idPedido);
}

// ============================================
// FUNCIÓN: mostrarMensaje(texto, tipo)
// Muestra mensajes al usuario
// ============================================
function mostrarMensaje(texto, tipo) {
    let mensaje;

    // Selecciona el tipo de mensaje
    if (tipo === 'success') {
        mensaje = document.getElementById('mensaje-success');
    } else {
        mensaje = document.getElementById('mensaje-error');
    }

    // Mostrar el mensaje
    mensaje.textContent = texto;
    mensaje.style.display = 'block';

    // Ocultar el mensaje después de 3 segundos
    setTimeout(function() {
        mensaje.style.display = 'none';
    }, 3000);
}

// ============================================
// CERRAR MODAL AL HACER CLIC FUERA
// Si el usuario hace clic fuera del modal, se cierra
// ============================================
window.addEventListener('click', function(e) {
    const modal = document.getElementById('modalDetallePedido');

    // Si hace clic en el fondo oscuro (no en el contenido)
    if (e.target === modal) {
        cerrarModal();
    }
});