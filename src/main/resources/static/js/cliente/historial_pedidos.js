// Datos de ejemplo para demostración
const sampleOrders = [
    {
        id: "ORD-2024-001",
        date: "2024-01-15",
        status: "entregado",
        customer: "Juan Pérez",
        email: "juan@email.com",
        total: "$150.00",
        shippingAddress: "Av. Principal 123, Ciudad",
        items: [
            { name: "Laptop Gaming", quantity: 1, price: "$120.00" },
            { name: "Mouse Inalámbrico", quantity: 1, price: "$30.00" }
        ],
        estimatedDelivery: "2024-01-18",
        actualDelivery: "2024-01-17"
    },
    {
        id: "ORD-2024-002",
        date: "2024-01-20",
        status: "camino",
        customer: "Juan Pérez",
        email: "juan@email.com",
        total: "$75.50",
        shippingAddress: "Av. Principal 123, Ciudad",
        items: [
            { name: "Auriculares Bluetooth", quantity: 1, price: "$45.00" },
            { name: "Funda para Laptop", quantity: 1, price: "$25.00" },
            { name: "Cable USB-C", quantity: 2, price: "$5.50" }
        ],
        estimatedDelivery: "2024-01-25",
        actualDelivery: null
    },
    {
        id: "ORD-2024-003",
        date: "2024-01-25",
        status: "pendiente",
        customer: "Juan Pérez",
        email: "juan@email.com",
        total: "$200.00",
        shippingAddress: "Av. Principal 123, Ciudad",
        items: [
            { name: "Tablet 10 pulgadas", quantity: 1, price: "$200.00" }
        ],
        estimatedDelivery: "2024-02-01",
        actualDelivery: null
    },
    {
        id: "ORD-2024-004",
        date: "2024-01-10",
        status: "entregado",
        customer: "María García",
        email: "maria@email.com",
        total: "$89.99",
        shippingAddress: "Calle Secundaria 456, Pueblo",
        items: [
            { name: "Smartwatch", quantity: 1, price: "$89.99" }
        ],
        estimatedDelivery: "2024-01-15",
        actualDelivery: "2024-01-14"
    },
    {
        id: "ORD-2024-005",
        date: "2024-02-01",
        status: "camino",
        customer: "Carlos Rodríguez",
        email: "carlos@email.com",
        total: "$320.75",
        shippingAddress: "Plaza Central 789, Villa",
        items: [
            { name: "Monitor 24\"", quantity: 1, price: "$250.00" },
            { name: "Teclado Mecánico", quantity: 1, price: "$70.75" }
        ],
        estimatedDelivery: "2024-02-05",
        actualDelivery: null
    },
    {
        id: "ORD-2024-006",
        date: "2024-02-03",
        status: "entregado",
        customer: "Ana López",
        email: "ana@email.com",
        total: "$45.99",
        shippingAddress: "Calle Norte 321, Colonia",
        items: [
            { name: "Mouse Pad XL", quantity: 2, price: "$22.99" }
        ],
        estimatedDelivery: "2024-02-06",
        actualDelivery: "2024-02-05"
    }
];

// Elementos del DOM
const tabs = document.querySelectorAll('.tab');
const orderSections = document.querySelectorAll('.orders-section');
const btnNovedad = document.getElementById('btnNovedad');
const novedadModal = document.getElementById('novedadModal');
const closeModal = document.getElementById('closeModal');
const cancelNovedad = document.getElementById('cancelNovedad');
const novedadForm = document.getElementById('novedadForm');

// Funciones para formatear fechas
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

// Función para crear el HTML de un pedido
function createOrderCard(order) {
    const statusClass = `status-${order.status}`;
    const statusText = {
        'entregado': 'Entregado',
        'camino': 'En Camino',
        'pendiente': 'Pendiente'
    }[order.status];

    return `
                <div class="order-card">
                    <div class="order-header">
                        <div>
                            <span class="order-id">${order.id}</span>
                            <span class="order-date"> - ${formatDate(order.date)}</span>
                        </div>
                        <span class="order-status ${statusClass}">${statusText}</span>
                    </div>
                    
                    <div class="order-details">
                        <div class="detail-item">
                            <span class="detail-label">Cliente</span>
                            <span class="detail-value">${order.customer}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Total</span>
                            <span class="detail-value">${order.total}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Dirección de Envío</span>
                            <span class="detail-value">${order.shippingAddress}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">
                                ${order.status === 'entregado' ? 'Fecha de Entrega' : 'Entrega Estimada'}
                            </span>
                            <span class="detail-value">
                                ${formatDate(order.status === 'entregado' ? order.actualDelivery : order.estimatedDelivery)}
                            </span>
                        </div>
                    </div>
                    
                    <div class="order-items">
                        <div class="items-title">Productos:</div>
                        <ul class="item-list">
                            ${order.items.map(item => `
                                <li class="item">
                                    <span>${item.name} x${item.quantity}</span>
                                    <span>${item.price}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            `;
}

// Función para mostrar pedidos
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

// Función para filtrar pedidos por estado
function filterOrdersByStatus(orders, status) {
    if (status === 'all') return orders;
    return orders.filter(order => order.status === status);
}

// Inicializar la página con todos los pedidos
function initializePage() {
    // Mostrar todos los pedidos inicialmente
    displayOrders(sampleOrders, 'orders-container-all');
    displayOrders(filterOrdersByStatus(sampleOrders, 'delivered'), 'orders-container-delivered');
    displayOrders(filterOrdersByStatus(sampleOrders, 'shipping'), 'orders-container-shipping');
}

// Event Listeners
// Navegación por pestañas
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Remover clase active de todas las pestañas
        tabs.forEach(t => t.classList.remove('active'));
        // Añadir clase active a la pestaña clickeada
        tab.classList.add('active');

        // Ocultar todas las secciones
        orderSections.forEach(section => section.classList.remove('active'));
        // Mostrar la sección correspondiente
        const tabId = tab.getAttribute('data-tab');
        document.getElementById(`${tabId}-orders`).classList.add('active');
    });
});

// Modal de novedades
btnNovedad.addEventListener('click', () => {
    novedadModal.style.display = 'flex';
    // Establecer fecha actual por defecto
    document.getElementById('fecha').valueAsDate = new Date();
});

closeModal.addEventListener('click', () => {
    novedadModal.style.display = 'none';
});

cancelNovedad.addEventListener('click', () => {
    novedadModal.style.display = 'none';
});

// Cerrar modal al hacer clic fuera del contenido
window.addEventListener('click', (e) => {
    if (e.target === novedadModal) {
        novedadModal.style.display = 'none';
    }
});

// Envío del formulario de novedad
novedadForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Aquí iría la lógica para enviar el formulario
    alert('Novedad reportada correctamente. Nos contactaremos pronto.');
    novedadModal.style.display = 'none';
    novedadForm.reset();
});

// Inicializar la página
window.addEventListener('load', initializePage);