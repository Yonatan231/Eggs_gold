let todosLosPedidos = [];
let pedidoIdParaFactura = null;

let tabs, orderSections, btnNovedad, novedadModal, closeModal, cancelNovedad, novedadForm;
let facturaModal, closeFacturaModal, closeFacturaBtn, downloadFacturaBtn;

function cargarPedidos() {
    fetch('/api/cliente/mis-pedidos')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                todosLosPedidos = data.pedidos;
                mostrarPedidosPorFiltro('all');
            } else {
                console.error('Error:', data.message);
                mostrarSinPedidos('all');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarSinPedidos('all');
        });
}

function mapearEstado(estado) {
    const estadosAlistamiento = ['PENDIENTE', 'EN_ALISTAMIENTO', 'LISTO'];
    const estadosEntrega = ['ASIGNADO', 'EN_CAMINO'];

    if (estadosAlistamiento.includes(estado)) {
        return {
            categoria: 'alistamiento',
            clase: 'status-pendiente',
            texto: 'En Alistamiento'
        };
    } else if (estadosEntrega.includes(estado)) {
        return {
            categoria: 'entrega',
            clase: 'status-camino',
            texto: 'En Camino'
        };
    } else if (estado === 'ENTREGADO') {
        return {
            categoria: 'entregado',
            clase: 'status-entregado',
            texto: 'Entregado'
        };
    }

    return {
        categoria: 'pendiente',
        clase: 'status-pendiente',
        texto: estado
    };
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

function createOrderCard(pedido) {
    const estadoInfo = mapearEstado(pedido.estado);

    const productosHTML = pedido.productos.map(item => `
        <li class="item">
            <span>${item.nombre} x${item.cantidad}</span>
            <span>$${parseFloat(item.subtotal).toLocaleString('es-CO', {minimumFractionDigits: 2})}</span>
        </li>
    `).join('');

    return `
        <div class="order-card">
            <div class="order-header">
                <div>
                    <span class="order-id">Pedido #${pedido.idPedido}</span>
                    <span class="order-date"> - ${formatDate(pedido.fechaCreacion)}</span>
                </div>
                <span class="order-status ${estadoInfo.clase}">${estadoInfo.texto}</span>
            </div>
            
            <div class="order-details">
                <div class="detail-item">
                    <span class="detail-label">Direccion de Entrega</span>
                    <span class="detail-value">${pedido.direccion}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Total</span>
                    <span class="detail-value">$${parseFloat(pedido.total).toLocaleString('es-CO', {minimumFractionDigits: 2})}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Metodo de Pago</span>
                    <span class="detail-value">${pedido.metodoPago}</span>
                </div>
                ${pedido.fechaEntrega ? `
                <div class="detail-item">
                    <span class="detail-label">Fecha de Entrega</span>
                    <span class="detail-value">${formatDate(pedido.fechaEntrega)}</span>
                </div>
                ` : ''}
            </div>
            
            <div class="order-items">
                <div class="items-title">Productos:</div>
                <ul class="item-list">
                    ${productosHTML}
                </ul>
            </div>
            
            <button class="btn-ver-factura" onclick="verFactura(${pedido.idPedido})">
                Ver Factura
            </button>
        </div>
    `;
}

function mostrarPedidosPorFiltro(filtro) {
    let pedidosFiltrados = [];

    if (filtro === 'all') {
        pedidosFiltrados = todosLosPedidos;
    } else {
        pedidosFiltrados = todosLosPedidos.filter(pedido => {
            const estadoInfo = mapearEstado(pedido.estado);
            return estadoInfo.categoria === filtro;
        });
    }

    const containerMap = {
        'all': 'orders-container-all',
        'entregado': 'orders-container-delivered',
        'entrega': 'orders-container-shipping',
        'alistamiento': 'orders-container-alistamiento'
    };

    const containerId = containerMap[filtro];
    displayOrders(pedidosFiltrados, containerId);
}

function displayOrders(orders, containerId) {
    const container = document.getElementById(containerId);

    if (!container) {
        console.error('Container no encontrado:', containerId);
        return;
    }

    if (orders.length === 0) {
        container.innerHTML = `
            <div class="no-orders">
                <h3>No se encontraron pedidos</h3>
                <p>No hay pedidos que coincidan con el filtro seleccionado</p>
            </div>
        `;
        return;
    }

    container.innerHTML = orders.map(order => createOrderCard(order)).join('');
}

function mostrarSinPedidos(filtro) {
    const containerMap = {
        'all': 'orders-container-all',
        'entregado': 'orders-container-delivered',
        'entrega': 'orders-container-shipping',
        'alistamiento': 'orders-container-alistamiento'
    };

    const containerId = containerMap[filtro] || 'orders-container-all';
    displayOrders([], containerId);
}

function verFactura(idPedido) {
    pedidoIdParaFactura = idPedido;

    fetch('/api/cliente/factura/' + idPedido)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarFacturaEnModal(data.factura);
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al cargar la factura');
        });
}

function mostrarFacturaEnModal(factura) {
    const fecha = new Date(factura.fechaPago);
    const fechaFormateada = fecha.toLocaleString('es-ES');

    const productosHTML = factura.productos.map(prod => `
        <tr>
            <td>${prod.nombre}</td>
            <td>${prod.cantidad}</td>
            <td>$${parseFloat(prod.precioUnitario).toLocaleString('es-CO', {minimumFractionDigits: 2})}</td>
            <td>$${parseFloat(prod.subtotal).toLocaleString('es-CO', {minimumFractionDigits: 2})}</td>
        </tr>
    `).join('');

    const facturaHTML = `
        <div class="factura-header">
            <h1> EGGS GOLD</h1>
            <p>Factura de Venta</p>
        </div>
        
        <div class="factura-info">
            <div class="factura-section">
                <h3>Informacion de Factura</h3>
                <p><strong>N° Factura:</strong> ${factura.numeroFactura}</p>
                <p><strong>Fecha:</strong> ${fechaFormateada}</p>
                <p><strong>Metodo de Pago:</strong> ${factura.metodoPago}</p>
            </div>
            
            <div class="factura-section">
                <h3>Datos del Cliente</h3>
                <p><strong>Nombre:</strong> ${factura.clienteNombre}</p>
                <p><strong>Documento:</strong> ${factura.clienteDocumento}</p>
                <p><strong>Telefono:</strong> ${factura.clienteTelefono}</p>
                <p><strong>Direccion:</strong> ${factura.clienteDireccion}</p>
            </div>
        </div>
        
        <table class="factura-table">
            <thead>
                <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio Unit.</th>
                    <th>Subtotal</th>
                </tr>
            </thead>
            <tbody>
                ${productosHTML}
            </tbody>
        </table>
        
        <div class="factura-total">
            TOTAL: $${parseFloat(factura.totalPagado).toLocaleString('es-CO', {minimumFractionDigits: 2})}
        </div>
    `;

    document.getElementById('facturaContent').innerHTML = facturaHTML;
    facturaModal.style.display = 'flex';
}

function descargarFacturaPDF() {
    if (!pedidoIdParaFactura) return;
    window.open('/api/cliente/factura/' + pedidoIdParaFactura + '/pdf', '_blank');
}

document.addEventListener('DOMContentLoaded', function() {
    // inicializar elementos del dom
    tabs = document.querySelectorAll('.tab');
    orderSections = document.querySelectorAll('.orders-section');
    btnNovedad = document.getElementById('btnNovedad');
    novedadModal = document.getElementById('novedadModal');
    closeModal = document.getElementById('closeModal');
    cancelNovedad = document.getElementById('cancelNovedad');
    novedadForm = document.getElementById('novedadForm');
    facturaModal = document.getElementById('facturaModal');
    closeFacturaModal = document.getElementById('closeFacturaModal');
    closeFacturaBtn = document.getElementById('closeFacturaBtn');
    downloadFacturaBtn = document.getElementById('downloadFacturaBtn');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            orderSections.forEach(section => section.classList.remove('active'));

            const filtro = tab.getAttribute('data-tab');
            const seccion = document.getElementById(`${filtro}-orders`);

            if (seccion) {
                seccion.classList.add('active');
            }

            mostrarPedidosPorFiltro(filtro);
        });
    });

    if (btnNovedad) {
        btnNovedad.addEventListener('click', () => {
            novedadModal.style.display = 'flex';
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            novedadModal.style.display = 'none';
        });
    }

    if (cancelNovedad) {
        cancelNovedad.addEventListener('click', () => {
            novedadModal.style.display = 'none';
        });
    }

    if (closeFacturaModal) {
        closeFacturaModal.addEventListener('click', () => {
            facturaModal.style.display = 'none';
        });
    }

    if (closeFacturaBtn) {
        closeFacturaBtn.addEventListener('click', () => {
            facturaModal.style.display = 'none';
        });
    }

    if (downloadFacturaBtn) {
        downloadFacturaBtn.addEventListener('click', descargarFacturaPDF);
    }

    if (novedadForm) {
        novedadForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const idPedido = document.getElementById('orderNumber').value.trim();
            const tipoNovedad = document.getElementById('tipoNovedad').value;
            const descripcion = document.getElementById('descripcion').value.trim();
            const imagenFile = document.getElementById('evidencia').files[0];

            const validacion = validarCamposNovedad(idPedido, tipoNovedad, descripcion);
            if (!validacion.valido) {
                alert(validacion.mensaje);
                return;
            }

            const idUsuario = obtenerIdUsuario();
            if (!idUsuario) {
                alert('Error: No se pudo obtener la informacion de usuario. Recargue la pagina.');
                return;
            }

            reportarNovedad(idUsuario, parseInt(idPedido), tipoNovedad, descripcion, imagenFile)
                .then(resultado => {
                    if (resultado.success) {
                        alert(resultado.message);
                        novedadModal.style.display = 'none';
                        novedadForm.reset();
                    } else {
                        alert('Error: ' + resultado.message);
                    }
                });
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === novedadModal) {
            novedadModal.style.display = 'none';
        }
        if (e.target === facturaModal) {
            facturaModal.style.display = 'none';
        }
    });

    cargarPedidos();
});