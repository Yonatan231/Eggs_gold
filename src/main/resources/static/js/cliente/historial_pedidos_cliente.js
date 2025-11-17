// ============================================
// VARIABLES GLOBALES
// ============================================
let todosLosPedidos = [];
let pedidoIdParaFactura = null;

// ============================================
// ELEMENTOS DEL DOM
// ============================================
const tabs = document.querySelectorAll('.tab');
const orderSections = document.querySelectorAll('.orders-section');
const btnNovedad = document.getElementById('btnNovedad');
const novedadModal = document.getElementById('novedadModal');
const closeModal = document.getElementById('closeModal');
const cancelNovedad = document.getElementById('cancelNovedad');
const novedadForm = document.getElementById('novedadForm');

// Modal de factura
const facturaModal = document.getElementById('facturaModal');
const closeFacturaModal = document.getElementById('closeFacturaModal');
const closeFacturaBtn = document.getElementById('closeFacturaBtn');
const downloadFacturaBtn = document.getElementById('downloadFacturaBtn');

// ============================================
// CARGAR PEDIDOS DESDE EL SERVIDOR
// ============================================
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

// ============================================
// MAPEO DE ESTADOS
// ============================================
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
            texto: 'En Entrega'
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

// ============================================
// FORMATEAR FECHA
// ============================================
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

// ============================================
// CREAR TARJETA DE PEDIDO
// ============================================
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
                    <span class="detail-label">Dirección de Entrega</span>
                    <span class="detail-value">${pedido.direccion}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Total</span>
                    <span class="detail-value">$${parseFloat(pedido.total).toLocaleString('es-CO', {minimumFractionDigits: 2})}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Método de Pago</span>
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
                <i class="fas fa-file-invoice"></i> Ver Factura
            </button>
        </div>
    `;
}

// ============================================
// MOSTRAR PEDIDOS POR FILTRO
// ============================================
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

    const containerId = filtro === 'all' ? 'orders-container-all' :
        filtro === 'entregado' ? 'orders-container-delivered' :
            'orders-container-shipping';

    displayOrders(pedidosFiltrados, containerId);
}

// ============================================
// MOSTRAR PEDIDOS EN CONTENEDOR
// ============================================
function displayOrders(orders, containerId) {
    const container = document.getElementById(containerId);

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

// ============================================
// MOSTRAR SIN PEDIDOS
// ============================================
function mostrarSinPedidos(filtro) {
    const containerId = filtro === 'all' ? 'orders-container-all' :
        filtro === 'entregado' ? 'orders-container-delivered' :
            'orders-container-shipping';
    displayOrders([], containerId);
}

// ============================================
// VER FACTURA
// ============================================
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

// ============================================
// MOSTRAR FACTURA EN MODAL
// ============================================
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
            <h1>🥚 EGGS GOLD</h1>
            <p>Factura de Venta</p>
        </div>
        
        <div class="factura-info">
            <div class="factura-section">
                <h3>Información de Factura</h3>
                <p><strong>N° Factura:</strong> ${factura.numeroFactura}</p>
                <p><strong>Fecha:</strong> ${fechaFormateada}</p>
                <p><strong>Método de Pago:</strong> ${factura.metodoPago}</p>
            </div>
            
            <div class="factura-section">
                <h3>Datos del Cliente</h3>
                <p><strong>Nombre:</strong> ${factura.clienteNombre}</p>
                <p><strong>Documento:</strong> ${factura.clienteDocumento}</p>
                <p><strong>Teléfono:</strong> ${factura.clienteTelefono}</p>
                <p><strong>Dirección:</strong> ${factura.clienteDireccion}</p>
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

// ============================================
// DESCARGAR FACTURA PDF
// ============================================
function descargarFacturaPDF() {
    if (!pedidoIdParaFactura) return;

    window.open('/api/cliente/factura/' + pedidoIdParaFactura + '/pdf', '_blank');
}

// ============================================
// EVENT LISTENERS
// ============================================

// Navegación por pestañas
tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        orderSections.forEach(section => section.classList.remove('active'));

        const filtros = ['all', 'entregado', 'entrega', 'alistamiento'];
        const filtro = filtros[index];

        document.getElementById(`${filtros[index]}-orders`).classList.add('active');
        mostrarPedidosPorFiltro(filtro);
    });
});

// Modal de novedades
btnNovedad.addEventListener('click', () => {
    novedadModal.style.display = 'flex';
    document.getElementById('fecha').valueAsDate = new Date();
});

closeModal.addEventListener('click', () => {
    novedadModal.style.display = 'none';
});

cancelNovedad.addEventListener('click', () => {
    novedadModal.style.display = 'none';
});

// Modal de factura
closeFacturaModal.addEventListener('click', () => {
    facturaModal.style.display = 'none';
});

closeFacturaBtn.addEventListener('click', () => {
    facturaModal.style.display = 'none';
});

downloadFacturaBtn.addEventListener('click', descargarFacturaPDF);

// Cerrar modal al hacer clic fuera
window.addEventListener('click', (e) => {
    if (e.target === novedadModal) {
        novedadModal.style.display = 'none';
    }
    if (e.target === facturaModal) {
        facturaModal.style.display = 'none';
    }
});

// Envío del formulario de novedad
novedadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Novedad reportada correctamente. Nos contactaremos pronto.');
    novedadModal.style.display = 'none';
    novedadForm.reset();
});

// ============================================
// INICIALIZAR LA PÁGINA
// ============================================
window.addEventListener('load', cargarPedidos);