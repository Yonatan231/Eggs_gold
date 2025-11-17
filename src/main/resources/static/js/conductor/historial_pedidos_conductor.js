// ============================================
// SCRIPT PARA HISTORIAL DE PEDIDOS ENTREGADOS
// Versión simplificada para principiantes
// ============================================

// ============================================
// DATOS DE EJEMPLO (simulan el servidor)
// ============================================
const pedidosHistorial = [
    {
        id: 15,
        fecha: "2025-11-10",
        cliente: "Juan Pérez",
        direccion: "Calle 10 #15-22",
        tipos: 2,
        total: 3,
        comentarioCliente: "Por favor entregar rápido.",
        comentarioConductor: "Todo entregado correctamente.",
        productos: [
            { nombre: "Huevo Verde", categoria: "AA", cantidad: 2 },
            { nombre: "Huevo de Campo", categoria: "A", cantidad: 1 }
        ]
    },
    {
        id: 16,
        fecha: "2025-11-11",
        cliente: "Laura Gómez",
        direccion: "Av 30 #20-10",
        tipos: 1,
        total: 2,
        comentarioCliente: "Tocar el timbre suave.",
        comentarioConductor: "Cliente tardó en abrir.",
        productos: [
            { nombre: "Huevo Orgánico", categoria: "AAA", cantidad: 2 }
        ]
    }
];

// ============================================
// BOTÓN PARA ABRIR/CERRAR EL MENÚ
// ============================================
const botonMenu = document.querySelector('.toggle-btn');

// Cuando se hace clic en el botón del menú
if (botonMenu) {
    botonMenu.addEventListener('click', function () {
        const menuLateral = document.getElementById('sidebar');

        // Si el menú está abierto, lo cierra. Si está cerrado, lo abre
        menuLateral.classList.toggle('active');
    });
}

// ============================================
// CUANDO LA PÁGINA CARGA
// Ejecuta estas funciones automáticamente
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    cargarTablaPedidos(); // Carga los pedidos en la tabla
    actualizarContador(); // Actualiza el contador de pedidos
});

// ============================================
// FUNCIÓN: cargarTablaPedidos()
// Llena la tabla con los datos de ejemplo
// ============================================
function cargarTablaPedidos() {
    const tbody = document.getElementById('tablaBody');

    // Limpia el contenido actual de la tabla
    tbody.innerHTML = '';

    // Recorre cada pedido y lo agrega a la tabla
    pedidosHistorial.forEach(function(pedido) {
        const fila = document.createElement('tr');

        // Crea el contenido HTML de la fila
        fila.innerHTML = `
            <td>${pedido.id}</td>
            <td>${pedido.fecha}</td>
            <td>${pedido.cliente}</td>
            <td>${pedido.direccion}</td>
            <td>${pedido.tipos}</td>
            <td>${pedido.total} unidades</td>
            <td>
                <button class="btn-accion btn-ver" onclick="verDetalle(${pedido.id})">
                    <i class="fas fa-eye"></i> Ver
                </button>
            </td>
        `;

        // Agrega la fila a la tabla
        tbody.appendChild(fila);
    });
}

// ============================================
// FUNCIÓN: actualizarContador()
// Cuenta cuántos pedidos hay en la tabla
// ============================================
function actualizarContador() {
    // Obtiene todas las filas visibles de pedidos
    const filas = document.querySelectorAll('#tablaBody tr');
    const filasVisibles = Array.from(filas).filter(function(fila) {
        return fila.style.display !== 'none';
    });

    // Cuenta cuántas filas visibles hay
    const total = filasVisibles.length;

    // Actualiza el número en el contador
    document.getElementById('contador').textContent = total;

    // Si no hay pedidos visibles, muestra el mensaje
    if (total === 0) {
        document.getElementById('tablaPedidos').style.display = 'none';
        document.getElementById('sin-pedidos').style.display = 'block';
    } else {
        document.getElementById('tablaPedidos').style.display = 'table';
        document.getElementById('sin-pedidos').style.display = 'none';
    }
}

// ============================================
// FUNCIÓN: filtrarPedidos()
// Filtra los pedidos según el texto de búsqueda
// ============================================
function filtrarPedidos() {
    // Obtiene el texto de búsqueda y lo convierte a minúsculas
    const textoBusqueda = document.getElementById('busqueda').value.toLowerCase();

    // Obtiene todas las filas de la tabla
    const filas = document.querySelectorAll('#tablaBody tr');

    // Recorre cada fila
    filas.forEach(function(fila) {
        // Obtiene todo el texto de la fila
        const contenidoFila = fila.textContent.toLowerCase();

        // Si el texto de búsqueda está en la fila, la muestra
        // Si no está, la oculta
        if (contenidoFila.includes(textoBusqueda)) {
            fila.style.display = ''; // Muestra la fila
        } else {
            fila.style.display = 'none'; // Oculta la fila
        }
    });

    // Actualiza el contador después de filtrar
    actualizarContador();
}

// ============================================
// FUNCIÓN: verDetalle(idPedido)
// Abre el modal con los detalles del pedido
// ============================================
function verDetalle(idPedido) {
    // Busca el pedido en el array de datos
    const pedido = pedidosHistorial.find(function(p) {
        return p.id === idPedido;
    });

    // Si existe el pedido
    if (pedido) {
        // Poner el ID del pedido en el título del modal
        document.getElementById('pedidoId').textContent = idPedido;

        // Llenar la información del cliente
        document.getElementById('clienteNombre').textContent = pedido.cliente;
        document.getElementById('clienteDireccion').textContent = pedido.direccion;
        document.getElementById('fechaEntrega').textContent = pedido.fecha;

        // Llenar los comentarios
        document.getElementById('comentarioCliente').textContent = pedido.comentarioCliente;
        document.getElementById('comentarioConductor').textContent = pedido.comentarioConductor;

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
        alert('No se encontró información del pedido #' + idPedido);
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

// ============================================
// FIN DEL SCRIPT
// ============================================