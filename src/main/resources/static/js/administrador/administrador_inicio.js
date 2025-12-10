let todosPedidos = [];
let pedidosFiltrados = [];

document.addEventListener('DOMContentLoaded', function() {
    cargarDashboard();
    cargarPedidos();
    cargarUsuarios();
    inicializarEventos();
    inicializarActualizacionAutomatica();
});

async function cargarDashboard() {
    try {
        const response = await fetch('/api/admin/dashboard/resumen');

        if (!response.ok) {
            throw new Error('Error al cargar dashboard');
        }

        const datos = await response.json();

        const contadorUsuarios = document.getElementById('totalUsuarios');
        if (contadorUsuarios) {
            contadorUsuarios.textContent = datos.totalUsuarios;
        }

        const contadorVentas = document.getElementById('totalVentas');
        if (contadorVentas) {
            const ventasFormateadas = formatearPesos(datos.ventasHoy);
            contadorVentas.textContent = ventasFormateadas;
        }

        const contadorNovedades = document.getElementById('notificacion-contador');
        if (contadorNovedades) {
            if (datos.novedadesPendientes > 0) {
                contadorNovedades.textContent = datos.novedadesPendientes;
                contadorNovedades.style.display = 'flex';
            } else {
                contadorNovedades.style.display = 'none';
            }
        }

    } catch (error) {
        console.error('Error al cargar dashboard:', error);
    }
}

function formatearPesos(valor) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(valor);
}

function inicializarActualizacionAutomatica() {
    setInterval(() => {
        cargarDashboard();
    }, 60000);

    setInterval(() => {
        const ahora = new Date();
        if (ahora.getHours() === 0 && ahora.getMinutes() === 0 && ahora.getSeconds() === 0) {
            console.log('nuevo dia, reiniciando dashboard');
            cargarDashboard();
        }
    }, 1000);
}

function inicializarEventos() {
    const filtroEstado = document.getElementById('filtro-estado');
    if (filtroEstado) {
        filtroEstado.addEventListener('change', filtrarPedidos);
    }

    const formBusqueda = document.getElementById('form-busqueda-pedidos');
    if (formBusqueda) {
        formBusqueda.addEventListener('submit', function(e) {
            e.preventDefault();
            buscarPedidos();
        });
    }

    const toggleBtn = document.querySelector('.toggle-btn');
    const sidebar = document.getElementById('sidebar');
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
}

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

function mostrarPedidos(pedidos) {
    const tbody = document.querySelector('#tabla-pedidos tbody');
    const mensajeSinPedidos = document.getElementById('mensaje-sin-pedidos');

    if (!tbody) return;

    tbody.innerHTML = '';

    if (pedidos.length === 0) {
        if (mensajeSinPedidos) {
            mensajeSinPedidos.style.display = 'block';
        }
        return;
    }

    if (mensajeSinPedidos) {
        mensajeSinPedidos.style.display = 'none';
    }

    // invertir orden: mas antiguos arriba, mas recientes abajo (cola fifo)
    const pedidosOrdenados = [...pedidos].reverse();

    pedidosOrdenados.forEach(pedido => {
        const fila = crearFilaPedido(pedido);
        tbody.appendChild(fila);
    });
}

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
            <button class="btn-accion btn-ver" onclick="verDetallePedido(${pedido.idPedido})">
                Ver
            </button>
        </td>
    `;

    return tr;
}

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

    if (pedido.detalleCliente) {
        html += `<p><strong>Detalle del cliente:</strong> ${pedido.detalleCliente}</p>`;
    }

    if (pedido.nombreLogistica &&
        ['EN_ALISTAMIENTO', 'LISTO', 'ASIGNADO', 'EN_CAMINO', 'ENTREGADO'].includes(pedido.estado)) {
        html += `<p><strong>Usuario logística:</strong> ${pedido.nombreLogistica} ${pedido.apellidoLogistica}</p>`;
    }

    if (pedido.nombreConductor &&
        ['ASIGNADO', 'EN_CAMINO', 'ENTREGADO'].includes(pedido.estado)) {
        html += `<p><strong>Conductor asignado:</strong> ${pedido.nombreConductor} ${pedido.apellidoConductor}</p>`;
    }

    if (pedido.estado === 'ENTREGADO') {
        if (pedido.fechaEntrega) {
            html += `<p><strong>Fecha de entrega:</strong> ${formatearFechaCompleta(pedido.fechaEntrega)}</p>`;
        }
        if (pedido.observacionConductor) {
            html += `<p><strong>Comentario del conductor:</strong> ${pedido.observacionConductor}</p>`;
        }
    }

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

function cerrarModalPedido() {
    const modal = document.getElementById('modal-pedido');
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-abierto');
    }
}

function filtrarPedidos() {
    const filtro = document.getElementById('filtro-estado').value;

    if (filtro === 'TODOS') {
        pedidosFiltrados = [...todosPedidos];
    } else {
        pedidosFiltrados = todosPedidos.filter(pedido => pedido.estado === filtro);
    }

    mostrarPedidos(pedidosFiltrados);
}

function buscarPedidos() {
    const termino = document.getElementById('buscar-pedido').value.toLowerCase().trim();

    if (!termino) {
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

function formatearFecha(fechaISO) {
    if (!fechaISO) return 'N/A';

    const fecha = new Date(fechaISO);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();

    return `${dia}/${mes}/${anio}`;
}

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

function formatearMoneda(valor) {
    if (!valor) return '$0';

    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(valor);
}

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

function mostrarMensaje(mensaje, tipo = 'info') {
    console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
    alert(mensaje);
}

document.addEventListener('click', function(e) {
    const modal = document.getElementById('modal-pedido');
    if (e.target === modal) {
        cerrarModalPedido();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        cerrarModalPedido();
    }
});

let todosUsuarios = [];
let usuariosFiltrados = [];
let rolesDisponibles = [];

document.addEventListener('DOMContentLoaded', function() {
    cargarUsuarios();
    cargarRoles();
    inicializarEventosUsuarios();
});

function inicializarEventosUsuarios() {
    const filtroRol = document.getElementById('filtro-rol');
    if (filtroRol) {
        filtroRol.addEventListener('change', filtrarUsuarios);
    }

    const filtroEstadoUsuario = document.getElementById('filtro-estado-usuario');
    if (filtroEstadoUsuario) {
        filtroEstadoUsuario.addEventListener('change', filtrarUsuarios);
    }

    const formBusquedaUsuarios = document.getElementById('form-busqueda-usuarios');
    if (formBusquedaUsuarios) {
        formBusquedaUsuarios.addEventListener('submit', function(e) {
            e.preventDefault();
            buscarUsuarios();
        });
    }

    const formEditarUsuario = document.getElementById('form-editar-usuario');
    if (formEditarUsuario) {
        formEditarUsuario.addEventListener('submit', function(e) {
            e.preventDefault();
            guardarCambiosUsuario();
        });
    }
}

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

function llenarSelectRoles() {
    const filtroRol = document.getElementById('filtro-rol');
    const editRol = document.getElementById('edit-rol');

    rolesDisponibles.forEach(rol => {
        if (filtroRol) {
            const option = document.createElement('option');
            option.value = rol.idRoles;
            option.textContent = rol.nombreRol;
            filtroRol.appendChild(option);
        }

        if (editRol) {
            // ❌ No permitir seleccionar rol ADMIN (código 1) en el modal de edición
            if (rol.idRoles !== 1) {
                const option = document.createElement('option');
                option.value = rol.idRoles;
                option.textContent = rol.nombreRol;
                editRol.appendChild(option);
            }
        }
    });
}

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

function crearFilaUsuario(usuario) {
    const tr = document.createElement('tr');
    tr.setAttribute('data-id', usuario.idUsuario);

    tr.innerHTML = `
        <td>${usuario.nombre} ${usuario.apellido}</td>
        <td>${usuario.numDocumento}</td>
        <td>${usuario.telefono}</td>
        <td>${usuario.nombreRol || 'Sin rol'}</td>
        <td>
            <span class="estado-usuario ${usuario.estado}">${usuario.estado}</span>
        </td>
        <td>
            <button class="btn-accion btn-editar" onclick="abrirModalEditarUsuario(${usuario.idUsuario})">
                Editar
            </button>
        </td>
    `;

    return tr;
}

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

function llenarFormularioEdicion(usuario) {
    // Obtener ID del admin actual
    const idAdminActual = parseInt(sessionStorage.getItem('usuario_id'));
    const esPropiaCuenta = usuario.idUsuario === idAdminActual;

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
    // guardar estado original para detectar cambios
    document.getElementById('edit-estado').setAttribute('data-estado-original', usuario.estado);
    document.getElementById('edit-fecha-registro').textContent = formatearFecha(usuario.fechaRegistro);

    // Deshabilitar correo SIEMPRE (política de seguridad)
    document.getElementById('edit-correo').disabled = true;
    document.getElementById('edit-correo').style.backgroundColor = '#f5f5f5';
    document.getElementById('edit-correo').style.cursor = 'not-allowed';

    // Si es su propia cuenta, deshabilitar TODO y mostrar advertencia
    if (esPropiaCuenta) {
        const campos = ['edit-nombre', 'edit-apellido', 'edit-tipo-documento',
            'edit-direccion', 'edit-telefono', 'edit-estado', 'edit-rol'];

        campos.forEach(id => {
            const campo = document.getElementById(id);
            campo.disabled = true;
            campo.style.backgroundColor = '#f5f5f5';
            campo.style.cursor = 'not-allowed';
        });

        // Deshabilitar botón guardar
        const btnGuardar = document.querySelector('#modal-usuario .btn-guardar');
        if (btnGuardar) {
            btnGuardar.disabled = true;
            btnGuardar.style.opacity = '0.5';
            btnGuardar.style.cursor = 'not-allowed';
        }

        mostrarMensaje('No puedes modificar tu propia cuenta', 'error');
    } else {
        // Si NO es su propia cuenta, habilitar campos editables (incluyendo rol)
        const campos = ['edit-nombre', 'edit-apellido', 'edit-tipo-documento',
            'edit-direccion', 'edit-telefono', 'edit-estado', 'edit-rol'];

        campos.forEach(id => {
            const campo = document.getElementById(id);
            campo.disabled = false;
            campo.style.backgroundColor = '';
            campo.style.cursor = '';
        });

        // Habilitar botón guardar
        const btnGuardar = document.querySelector('#modal-usuario .btn-guardar');
        if (btnGuardar) {
            btnGuardar.disabled = false;
            btnGuardar.style.opacity = '1';
            btnGuardar.style.cursor = 'pointer';
        }
    }
}

async function guardarCambiosUsuario() {
    const idUsuario = document.getElementById('edit-id-usuario').value;
    const estadoAnterior = document.getElementById('edit-estado').getAttribute('data-estado-original');
    const estadoNuevo = document.getElementById('edit-estado').value;

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
        estado: estadoNuevo
    };

    try {
        // actualizar usuario
        const response = await fetch(`/api/admin/usuarios/${idUsuario}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(usuarioDTO)
        });

        if (response.status === 403) {
            const errorData = await response.json();
            mostrarMensaje(errorData.error || 'No tienes permiso para realizar esta acción', 'error');
            return;
        }

        if (!response.ok) {
            throw new Error('Error al actualizar el usuario');
        }

        // si el estado cambio, enviar correo automaticamente
        if (estadoAnterior && estadoAnterior !== estadoNuevo) {
            try {
                const emailResponse = await fetch(`/api/usuarios/${idUsuario}/estado`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ estado: estadoNuevo })
                });

                if (emailResponse.ok) {
                    const emailResult = await emailResponse.json();
                    console.log('correo de cambio de estado enviado:', emailResult.message);
                }
            } catch (emailError) {
                console.error('error al enviar correo de notificacion:', emailError);
                // no detener el flujo si falla el correo
            }
        }

        mostrarMensaje('Usuario actualizado correctamente', 'success');
        cerrarModalUsuario();
        cargarUsuarios();

    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al guardar los cambios. Intenta nuevamente.', 'error');
    }
}

function cerrarModalUsuario() {
    const modal = document.getElementById('modal-usuario');
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-abierto');
    }
}

function filtrarUsuarios() {
    const filtroRol = document.getElementById('filtro-rol').value;
    const filtroEstado = document.getElementById('filtro-estado-usuario').value;

    let usuariosFiltradosTemp = [...todosUsuarios];

    if (filtroRol !== 'TODOS') {
        usuariosFiltradosTemp = usuariosFiltradosTemp.filter(
            usuario => usuario.idRol === parseInt(filtroRol)
        );
    }

    if (filtroEstado !== 'TODOS') {
        usuariosFiltradosTemp = usuariosFiltradosTemp.filter(
            usuario => usuario.estado === filtroEstado
        );
    }

    usuariosFiltrados = usuariosFiltradosTemp;
    mostrarUsuarios(usuariosFiltrados);
}

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

function actualizarContadorUsuarios() {
    const contador = document.getElementById('totalUsuarios');
    if (contador) {
        contador.textContent = todosUsuarios.length;
    }
}

document.addEventListener('click', function(e) {
    const modalUsuario = document.getElementById('modal-usuario');
    if (e.target === modalUsuario) {
        cerrarModalUsuario();
    }
});

function sincronizarContadorNotificaciones() {
    const contadorDesktop = document.getElementById("notificacion-contador");
    const contadorMobile = document.getElementById("notificacion-contador-mobile");

    if (contadorDesktop && contadorMobile) {
        contadorMobile.textContent = contadorDesktop.textContent;
        contadorMobile.style.display = contadorDesktop.style.display;
    }
}

const cargarDashboardOriginal = cargarDashboard;
cargarDashboard = async function() {
    await cargarDashboardOriginal();
    sincronizarContadorNotificaciones();
};