// ============================================
// INICIALIZACIÓN Y VARIABLES GLOBALES
// ============================================
let todosPedidos = []; // Almacena todos los pedidos cargados
let pedidosFiltrados = []; // Pedidos después de aplicar filtros

// ============================================
// CARGAR DATOS AL INICIAR LA PÁGINA
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    cargarPedidos();
    inicializarEventos();
});

// ============================================
// INICIALIZAR EVENT LISTENERS
// ============================================
function inicializarEventos() {
    // Filtro por estado
    const filtroEstado = document.getElementById('filtro-estado');
    if (filtroEstado) {
        filtroEstado.addEventListener('change', filtrarPedidos);
    }

    // Búsqueda de pedidos
    const formBusqueda = document.getElementById('form-busqueda-pedidos');
    if (formBusqueda) {
        formBusqueda.addEventListener('submit', function(e) {
            e.preventDefault();
            buscarPedidos();
        });
    }

    // Menú lateral (toggle)
    const toggleBtn = document.querySelector('.toggle-btn');
    const sidebar = document.getElementById('sidebar');
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
}

// ============================================
// CARGAR PEDIDOS DESDE EL BACKEND
// ============================================
async function cargarPedidos() {
    try {
        const response = await fetch('/api/admin/pedidos');

        if (!response.ok) {
            throw new Error('Error al cargar los pedidos');
        }

        todosPedidos = await response.json();
        pedidosFiltrados = [...todosPedidos];

        mostrarPedidos(pedidosFiltrados);

    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al cargar los pedidos. Por favor, recarga la página.', 'error');
    }
}

// ============================================
// MOSTRAR PEDIDOS EN LA TABLA
// ============================================
function mostrarPedidos(pedidos) {
    const tbody = document.querySelector('#tabla-pedidos tbody');
    const mensajeSinPedidos = document.getElementById('mensaje-sin-pedidos');

    if (!tbody) return;

    // Limpiar tabla
    tbody.innerHTML = '';

    // Si no hay pedidos
    if (pedidos.length === 0) {
        if (mensajeSinPedidos) {
            mensajeSinPedidos.style.display = 'block';
        }
        return;
    }

    // Ocultar mensaje vacío
    if (mensajeSinPedidos) {
        mensajeSinPedidos.style.display = 'none';
    }

    // Mostrar pedidos
    pedidos.forEach(pedido => {
        const fila = crearFilaPedido(pedido);
        tbody.appendChild(fila);
    });
}

// ============================================
// CREAR FILA DE PEDIDO
// ============================================
function crearFilaPedido(pedido) {
    const tr = document.createElement('tr');
    tr.setAttribute('data-estado', pedido.estado);
    tr.setAttribute('data-id', pedido.idPedido);

    const fecha = formatearFecha(pedido.fechaCreacion);
    const total = formatearMoneda(pedido.totalPedido);

    tr.innerHTML = `
        <td>${pedido.idPedido}</td>
        <td>${pedido.nombreCliente} ${pedido.apellidoCliente}</td>
        <td>${pedido.cantidadTotal}</td>
        <td>${total}</td>
        <td>${fecha}</td>
        <td>
            <span class="estado ${pedido.estado}">${formatearEstado(pedido.estado)}</span>
        </td>
        <td>
            <button class="btn-accion btn-primary" onclick="verDetallePedido(${pedido.idPedido})">
                <i class="fas fa-eye"></i> Ver
            </button>
        </td>
    `;

    return tr;
}

// ============================================
// VER DETALLE DEL PEDIDO EN MODAL
// ============================================
async function verDetallePedido(idPedido) {
    try {
        const response = await fetch(`/api/admin/pedidos/${idPedido}`);

        if (!response.ok) {
            throw new Error('Error al cargar el detalle del pedido');
        }

        const pedido = await response.json();
        mostrarModalDetalle(pedido);

    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al cargar el detalle. Intenta nuevamente.', 'error');
    }
}

// ============================================
// MOSTRAR MODAL CON DETALLE DEL PEDIDO
// ============================================
function mostrarModalDetalle(pedido) {
    const modal = document.getElementById('modal-pedido');
    const detalle = document.getElementById('detalle-pedido');

    if (!modal || !detalle) return;

    let html = `
        <p><strong>Cliente:</strong> ${pedido.nombreCliente} ${pedido.apellidoCliente}</p>
        <p><strong>Dirección:</strong> ${pedido.direccion}</p>
        <p><strong>Contacto:</strong> ${pedido.telefonoCliente}</p>
        <p><strong>Fecha creación:</strong> ${formatearFechaCompleta(pedido.fechaCreacion)}</p>
        <p><strong>Método de pago:</strong> ${pedido.metodoPago || 'No especificado'}</p>
        <p><strong>Estado:</strong> <span class="estado ${pedido.estado}">${formatearEstado(pedido.estado)}</span></p>
    `;

    // Información según el estado
    if (pedido.detalleCliente) {
        html += `<p><strong>Detalle del cliente:</strong> ${pedido.detalleCliente}</p>`;
    }

    // Mostrar logística si el pedido está en alistamiento o posterior
    if (pedido.nombreLogistica &&
        ['EN_ALISTAMIENTO', 'LISTO', 'ASIGNADO', 'EN_CAMINO', 'ENTREGADO'].includes(pedido.estado)) {
        html += `<p><strong>Usuario logística:</strong> ${pedido.nombreLogistica} ${pedido.apellidoLogistica}</p>`;
    }

    // Mostrar conductor si está asignado o posterior
    if (pedido.nombreConductor &&
        ['ASIGNADO', 'EN_CAMINO', 'ENTREGADO'].includes(pedido.estado)) {
        html += `<p><strong>Conductor asignado:</strong> ${pedido.nombreConductor} ${pedido.apellidoConductor}</p>`;
    }

    // Información específica de entrega completada
    if (pedido.estado === 'ENTREGADO') {
        if (pedido.fechaEntrega) {
            html += `<p><strong>Fecha de entrega:</strong> ${formatearFechaCompleta(pedido.fechaEntrega)}</p>`;
        }
        if (pedido.observacionConductor) {
            html += `<p><strong>Comentario del conductor:</strong> ${pedido.observacionConductor}</p>`;
        }
    }

    // Productos del pedido
    html += `<hr><strong>Productos del pedido:</strong><ul>`;

    if (pedido.productos && pedido.productos.length > 0) {
        pedido.productos.forEach(producto => {
            html += `<li>${producto.nombreProducto} - ${producto.categoria} - ${producto.cantidad} unidades - ${formatearMoneda(producto.subtotal)}</li>`;
        });
    } else {
        html += `<li>No hay productos</li>`;
    }

    html += `</ul><p><strong>Total:</strong> ${formatearMoneda(pedido.totalPedido)}</p>`;

    detalle.innerHTML = html;
    modal.style.display = 'flex';
    document.body.classList.add('modal-abierto');
}

// ============================================
// CERRAR MODAL DE PEDIDO
// ============================================
function cerrarModalPedido() {
    const modal = document.getElementById('modal-pedido');
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-abierto');
    }
}

// ============================================
// FILTRAR PEDIDOS POR ESTADO
// ============================================
function filtrarPedidos() {
    const filtro = document.getElementById('filtro-estado').value;

    if (filtro === 'TODOS') {
        pedidosFiltrados = [...todosPedidos];
    } else {
        pedidosFiltrados = todosPedidos.filter(pedido => pedido.estado === filtro);
    }

    mostrarPedidos(pedidosFiltrados);
}

// ============================================
// BUSCAR PEDIDOS
// ============================================
function buscarPedidos() {
    const termino = document.getElementById('buscar-pedido').value.toLowerCase().trim();

    if (!termino) {
        // Si no hay término, mostrar todos
        mostrarPedidos(pedidosFiltrados);
        return;
    }

    const resultados = pedidosFiltrados.filter(pedido => {
        const id = pedido.idPedido.toString().toLowerCase();
        const cliente = `${pedido.nombreCliente} ${pedido.apellidoCliente}`.toLowerCase();

        return id.includes(termino) || cliente.includes(termino);
    });

    mostrarPedidos(resultados);
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

// Formatear fecha (dd/mm/yyyy)
function formatearFecha(fechaISO) {
    if (!fechaISO) return 'N/A';

    const fecha = new Date(fechaISO);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();

    return `${dia}/${mes}/${anio}`;
}

// Formatear fecha completa (dd/mm/yyyy HH:mm)
function formatearFechaCompleta(fechaISO) {
    if (!fechaISO) return 'N/A';

    const fecha = new Date(fechaISO);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();
    const horas = fecha.getHours().toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');

    return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
}

// Formatear moneda (COP)
function formatearMoneda(valor) {
    if (!valor) return '$0';

    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(valor);
}

// Formatear nombre del estado
function formatearEstado(estado) {
    const estados = {
        'PENDIENTE': 'Pendiente',
        'EN_ALISTAMIENTO': 'En Alistamiento',
        'LISTO': 'Listo',
        'ASIGNADO': 'Asignado',
        'EN_CAMINO': 'En Camino',
        'ENTREGADO': 'Entregado'
    };

    return estados[estado] || estado;
}

// Mostrar mensaje de notificación
function mostrarMensaje(mensaje, tipo = 'info') {
    // Puedes implementar un sistema de notificaciones toast aquí
    console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
    alert(mensaje);
}

// ============================================
// CERRAR MODAL AL HACER CLIC FUERA
// ============================================
document.addEventListener('click', function(e) {
    const modal = document.getElementById('modal-pedido');
    if (e.target === modal) {
        cerrarModalPedido();
    }
});

// ============================================
// CERRAR MODAL CON TECLA ESC
// ============================================
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        cerrarModalPedido();
    }
});