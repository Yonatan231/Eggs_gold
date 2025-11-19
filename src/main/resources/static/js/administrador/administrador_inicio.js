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
// ============================================
// VARIABLES GLOBALES - USUARIOS
// ============================================
let todosUsuarios = [];
let usuariosFiltrados = [];
let rolesDisponibles = [];

// ============================================
// CARGAR USUARIOS AL INICIAR
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    cargarUsuarios();
    cargarRoles();
    inicializarEventosUsuarios();
});

// ============================================
// INICIALIZAR EVENT LISTENERS - USUARIOS
// ============================================
function inicializarEventosUsuarios() {
    // Filtro por rol
    const filtroRol = document.getElementById('filtro-rol');
    if (filtroRol) {
        filtroRol.addEventListener('change', filtrarUsuarios);
    }

    // Filtro por estado
    const filtroEstadoUsuario = document.getElementById('filtro-estado-usuario');
    if (filtroEstadoUsuario) {
        filtroEstadoUsuario.addEventListener('change', filtrarUsuarios);
    }

    // Búsqueda de usuarios
    const formBusquedaUsuarios = document.getElementById('form-busqueda-usuarios');
    if (formBusquedaUsuarios) {
        formBusquedaUsuarios.addEventListener('submit', function(e) {
            e.preventDefault();
            buscarUsuarios();
        });
    }

    // Form de edición de usuario
    const formEditarUsuario = document.getElementById('form-editar-usuario');
    if (formEditarUsuario) {
        formEditarUsuario.addEventListener('submit', function(e) {
            e.preventDefault();
            guardarCambiosUsuario();
        });
    }
}

// ============================================
// CARGAR USUARIOS DESDE EL BACKEND
// ============================================
async function cargarUsuarios() {
    try {
        const response = await fetch('/api/admin/usuarios');

        if (!response.ok) {
            throw new Error('Error al cargar los usuarios');
        }

        todosUsuarios = await response.json();
        usuariosFiltrados = [...todosUsuarios];

        mostrarUsuarios(usuariosFiltrados);
        actualizarContadorUsuarios();

    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al cargar los usuarios. Por favor, recarga la página.', 'error');
    }
}

// ============================================
// CARGAR ROLES DISPONIBLES
// ============================================
async function cargarRoles() {
    try {
        const response = await fetch('/api/admin/roles');

        if (!response.ok) {
            throw new Error('Error al cargar los roles');
        }

        rolesDisponibles = await response.json();
        llenarSelectRoles();

    } catch (error) {
        console.error('Error:', error);
    }
}

// ============================================
// LLENAR SELECT DE ROLES
// ============================================
function llenarSelectRoles() {
    const filtroRol = document.getElementById('filtro-rol');
    const editRol = document.getElementById('edit-rol');

    rolesDisponibles.forEach(rol => {
        // Agregar al filtro
        if (filtroRol) {
            const option = document.createElement('option');
            option.value = rol.idRoles;
            option.textContent = rol.nombreRol;
            filtroRol.appendChild(option);
        }

        // Agregar al select de edición
        if (editRol) {
            const option = document.createElement('option');
            option.value = rol.idRoles;
            option.textContent = rol.nombreRol;
            editRol.appendChild(option);
        }
    });
}

// ============================================
// MOSTRAR USUARIOS EN LA TABLA
// ============================================
function mostrarUsuarios(usuarios) {
    const tbody = document.querySelector('#tabla-usuarios tbody');
    const mensajeSinUsuarios = document.getElementById('mensaje-sin-usuarios');

    if (!tbody) return;

    tbody.innerHTML = '';

    if (usuarios.length === 0) {
        if (mensajeSinUsuarios) {
            mensajeSinUsuarios.style.display = 'block';
        }
        return;
    }

    if (mensajeSinUsuarios) {
        mensajeSinUsuarios.style.display = 'none';
    }

    usuarios.forEach(usuario => {
        const fila = crearFilaUsuario(usuario);
        tbody.appendChild(fila);
    });
}

// ============================================
// CREAR FILA DE USUARIO
// ============================================
function crearFilaUsuario(usuario) {
    const tr = document.createElement('tr');
    tr.setAttribute('data-id', usuario.idUsuario);

    tr.innerHTML = `
        <td>${usuario.idUsuario}</td>
        <td>${usuario.nombre} ${usuario.apellido}</td>
        <td>${usuario.numDocumento}</td>
        <td>${usuario.telefono}</td>
        <td>
            <span class="badge-rol">${usuario.nombreRol}</span>
        </td>
        <td>
            <span class="estado-usuario ${usuario.estado}">${usuario.estado}</span>
        </td>
        <td>
            <button class="btn-accion btn-editar" onclick="abrirModalEditarUsuario(${usuario.idUsuario})">
                <i class="fas fa-edit"></i> Editar
            </button>
        </td>
    `;

    return tr;
}

// ============================================
// ABRIR MODAL PARA EDITAR USUARIO
// ============================================
async function abrirModalEditarUsuario(idUsuario) {
    try {
        const response = await fetch(`/api/admin/usuarios/${idUsuario}`);

        if (!response.ok) {
            throw new Error('Error al cargar el usuario');
        }

        const usuario = await response.json();
        llenarFormularioEdicion(usuario);

        const modal = document.getElementById('modal-usuario');
        if (modal) {
            modal.style.display = 'flex';
            document.body.classList.add('modal-abierto');
        }

    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al cargar los datos del usuario.', 'error');
    }
}

// ============================================
// LLENAR FORMULARIO DE EDICIÓN
// ============================================
function llenarFormularioEdicion(usuario) {
    document.getElementById('edit-id-usuario').value = usuario.idUsuario;
    document.getElementById('edit-nombre').value = usuario.nombre;
    document.getElementById('edit-apellido').value = usuario.apellido;
    document.getElementById('edit-tipo-documento').value = usuario.tipoDocumento;
    document.getElementById('edit-num-documento').value = usuario.numDocumento;
    document.getElementById('edit-direccion').value = usuario.direccion;
    document.getElementById('edit-telefono').value = usuario.telefono;
    document.getElementById('edit-correo').value = usuario.correo;
    document.getElementById('edit-rol').value = usuario.idRol;
    document.getElementById('edit-estado').value = usuario.estado;
    document.getElementById('edit-fecha-registro').textContent = formatearFecha(usuario.fechaRegistro);
}

// ============================================
// GUARDAR CAMBIOS DEL USUARIO
// ============================================
async function guardarCambiosUsuario() {
    const idUsuario = document.getElementById('edit-id-usuario').value;

    const usuarioDTO = {
        idUsuario: parseInt(idUsuario),
        nombre: document.getElementById('edit-nombre').value,
        apellido: document.getElementById('edit-apellido').value,
        tipoDocumento: document.getElementById('edit-tipo-documento').value,
        numDocumento: document.getElementById('edit-num-documento').value,
        direccion: document.getElementById('edit-direccion').value,
        telefono: document.getElementById('edit-telefono').value,
        correo: document.getElementById('edit-correo').value,
        idRol: parseInt(document.getElementById('edit-rol').value),
        estado: document.getElementById('edit-estado').value
    };

    try {
        const response = await fetch(`/api/admin/usuarios/${idUsuario}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(usuarioDTO)
        });

        if (!response.ok) {
            throw new Error('Error al actualizar el usuario');
        }

        mostrarMensaje('Usuario actualizado correctamente', 'success');
        cerrarModalUsuario();
        cargarUsuarios();

    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al guardar los cambios. Intenta nuevamente.', 'error');
    }
}

// ============================================
// CERRAR MODAL DE USUARIO
// ============================================
function cerrarModalUsuario() {
    const modal = document.getElementById('modal-usuario');
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-abierto');
    }
}

// ============================================
// FILTRAR USUARIOS
// ============================================
function filtrarUsuarios() {
    const filtroRol = document.getElementById('filtro-rol').value;
    const filtroEstado = document.getElementById('filtro-estado-usuario').value;

    let usuariosFiltradosTemp = [...todosUsuarios];

    // Filtrar por rol
    if (filtroRol !== 'TODOS') {
        usuariosFiltradosTemp = usuariosFiltradosTemp.filter(
            usuario => usuario.idRol === parseInt(filtroRol)
        );
    }

    // Filtrar por estado
    if (filtroEstado !== 'TODOS') {
        usuariosFiltradosTemp = usuariosFiltradosTemp.filter(
            usuario => usuario.estado === filtroEstado
        );
    }

    usuariosFiltrados = usuariosFiltradosTemp;
    mostrarUsuarios(usuariosFiltrados);
}

// ============================================
// BUSCAR USUARIOS
// ============================================
function buscarUsuarios() {
    const termino = document.getElementById('buscar-usuario').value.toLowerCase().trim();

    if (!termino) {
        mostrarUsuarios(usuariosFiltrados);
        return;
    }

    const resultados = usuariosFiltrados.filter(usuario => {
        const nombre = `${usuario.nombre} ${usuario.apellido}`.toLowerCase();
        const documento = usuario.numDocumento.toLowerCase();
        const telefono = usuario.telefono.toLowerCase();

        return nombre.includes(termino) ||
            documento.includes(termino) ||
            telefono.includes(termino);
    });

    mostrarUsuarios(resultados);
}

// ============================================
// ACTUALIZAR CONTADOR DE USUARIOS
// ============================================
function actualizarContadorUsuarios() {
    const contador = document.getElementById('totalUsuarios');
    if (contador) {
        contador.textContent = todosUsuarios.length;
    }
}

// ============================================
// CERRAR MODAL AL HACER CLIC FUERA - USUARIOS
// ============================================
document.addEventListener('click', function(e) {
    const modalUsuario = document.getElementById('modal-usuario');
    if (e.target === modalUsuario) {
        cerrarModalUsuario();
    }
});