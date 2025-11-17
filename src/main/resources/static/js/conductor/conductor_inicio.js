// ============================================
// DATOS DE EJEMPLO (simulan el servidor)
// ============================================
const pedidosEjemplo = {
    21: {
        cliente: "Carlos Ruiz",
        direccion: "Calle 30 # 8-22",
        telefono: "123 454 6789",
        comentario: "Es en la casa Roja",
        productos: [
            { nombre: "Huevo Verde", categoria: "AA", cantidad: 2 },
            { nombre: "Huevo de Campo", categoria: "A", cantidad: 3 }
        ]
    },
    22: {
        cliente: "María Ruiz",
        direccion: "Calle 30 # 8-52",
        telefono: "453 454 6789",
        comentario: "Dejar en la puerta",
        productos: [
            { nombre: "Huevo Orgánico", categoria: "AAA", cantidad: 20 },
            { nombre: "Huevo Blanco", categoria: "AA", cantidad: 15 },
            { nombre: "Huevo Moreno", categoria: "A", cantidad: 15 }
        ]
    }
};

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
document.addEventListener("DOMContentLoaded", function() {
    actualizarContadores();     // Actualiza los números de las tarjetas
    configurarBusqueda();       // Configura la búsqueda de pedidos
    configurarModalNovedad();   // Configura el modal de novedades
});

// ============================================
// FUNCIÓN: marcarEntregado()
// Marca el pedido como entregado
// ============================================
function marcarEntregado(idPedido) {

    // Pedimos confirmación
    if (!confirm("¿Confirma que este pedido ha sido entregado?")) {
        return; // Si dice que no, no hace nada
    }

    // Aquí iría el código para enviar al servidor
    // Por ahora solo mostramos un mensaje

    alert("✓ Pedido #" + idPedido + " marcado como ENTREGADO");

    // Buscar y eliminar la fila del pedido
    const filas = document.querySelectorAll('#tablaPedidosDiaBody tr');
    filas.forEach(function(fila) {
        const idCelda = fila.querySelector('td:first-child').textContent;
        if (idCelda == idPedido) {
            fila.remove();
        }
    });

    // Actualizar los contadores
    actualizarContadores();
}

// ============================================
// FUNCIÓN: actualizarContadores()
// Actualiza los números de las tarjetas
// ============================================
function actualizarContadores() {

    // Obtenemos todas las filas de pedidos
    const filas = document.querySelectorAll("#tablaPedidosDiaBody tr");
    const filasVisibles = Array.from(filas).filter(function(fila) {
        return fila.style.display !== 'none';
    });

    let totalAsignados = filasVisibles.length;
    let totalPendientes = filasVisibles.length; // Todos son pendientes por entregar

    // Actualizamos los números en la página
    document.getElementById('totalAsignados').textContent = totalAsignados;
    document.getElementById('totalPendientes').textContent = totalPendientes;

    // Si no hay pedidos, muestra el mensaje
    if (totalAsignados === 0) {
        document.getElementById('tablaPedidosDia').style.display = 'none';
        document.getElementById('mensajeVacio').style.display = 'block';
    } else {
        document.getElementById('tablaPedidosDia').style.display = 'table';
        document.getElementById('mensajeVacio').style.display = 'none';
    }
}

// ============================================
// FUNCIÓN: configurarBusqueda()
// Configura la barra de búsqueda de pedidos
// ============================================
function configurarBusqueda() {
    const inputBuscar = document.getElementById("buscarPedido");
    const tbody = document.getElementById("tablaPedidosDiaBody");

    // Cuando el usuario escribe en el campo de búsqueda
    inputBuscar.addEventListener("keyup", function() {
        const textoBusqueda = inputBuscar.value.toLowerCase(); // Convertimos a minúsculas
        const filas = tbody.querySelectorAll("tr"); // Obtenemos todas las filas

        // Revisamos cada fila
        filas.forEach(function(fila) {
            const contenido = fila.textContent.toLowerCase(); // Texto de la fila en minúsculas

            // Si el texto de búsqueda está en la fila, la mostramos
            if (contenido.includes(textoBusqueda)) {
                fila.style.display = ""; // Mostramos la fila
            } else {
                fila.style.display = "none"; // Ocultamos la fila
            }
        });

        // Actualiza el contador después de filtrar
        actualizarContadores();
    });
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
        document.getElementById('clienteComentario').textContent = pedido.comentario;

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
// FUNCIÓN: verRuta(idPedido)
// Redirige a la página de ruta (Google Maps u otra)
// ============================================
function verRuta(idPedido) {
    // Obtener la dirección del pedido
    const pedido = pedidosEjemplo[idPedido];

    if (pedido) {
        // Aquí puedes cambiar la URL por la que necesites
        // Por ejemplo, Google Maps:
        const direccion = encodeURIComponent(pedido.direccion);
        const urlMaps = 'https://www.google.com/maps/search/?api=1&query=' + direccion;

        // Abrir en una nueva pestaña
        window.open(urlMaps, '_blank');
    } else {
        alert('No se encontró la dirección del pedido');
    }
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
// CONFIGURAR MODAL DE NOVEDAD
// ============================================
function configurarModalNovedad() {
    // Elementos del DOM relacionados con el modal
    const btnNovedad = document.getElementById('btnNovedad');
    const novedadModal = document.getElementById('novedadModal');
    const closeModal = document.getElementById('closeModal');
    const cancelNovedad = document.getElementById('cancelNovedad');
    const novedadForm = document.getElementById('novedadForm');

    // Abrir modal de novedades
    if (btnNovedad) {
        btnNovedad.addEventListener('click', function(e) {
            e.preventDefault(); // Evita que el enlace haga scroll
            novedadModal.style.display = 'flex';
            // Establecer fecha actual por defecto
            document.getElementById('fecha').valueAsDate = new Date();
        });
    }

    // Cerrar modal con la X
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            novedadModal.style.display = 'none';
        });
    }

    // Cerrar modal con botón Cancelar
    if (cancelNovedad) {
        cancelNovedad.addEventListener('click', function() {
            novedadModal.style.display = 'none';
        });
    }

    // Cerrar modal al hacer clic fuera del contenido
    window.addEventListener('click', function(e) {
        if (e.target === novedadModal) {
            novedadModal.style.display = 'none';
        }
    });

    // Envío del formulario de novedad
    if (novedadForm) {
        novedadForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Aquí iría la lógica para enviar el formulario al servidor
            alert('Novedad reportada correctamente. Nos contactaremos pronto.');
            novedadModal.style.display = 'none';
            novedadForm.reset();
        });
    }
}

// ============================================
// FIN DEL SCRIPT
// ============================================