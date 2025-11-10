// ===================================
// FUNCIÓN PARA CARGAR PRODUCTOS DESDE EL SERVIDOR
// ===================================
async function cargarProductos() {
    try {
        // Simulamos una pequeña demora para mostrar el estado de carga
        await new Promise(resolve => setTimeout(resolve, 800));

        // Petición al servidor para obtener los productos
        const response = await fetch("http://localhost:8080/inventario/producto");

        // Verificamos si la respuesta fue exitosa
        if (!response.ok) throw new Error("Error al cargar productos");

        // Convertimos la respuesta a JSON
        const productos = await response.json();

        // Llamamos a la función para mostrar los productos
        renderizarProductos(productos);
    } catch (error) {
        // Si hay un error, lo mostramos en consola y en la interfaz
        console.error("Error:", error);
        document.getElementById("productosContainer").innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i> 
                No se pudieron cargar los productos. Verifica la conexión al servidor.
            </div>`;
    }
}

// ===================================
// FUNCIÓN PARA DETERMINAR EL NIVEL DE STOCK
// Retorna un objeto con la clase CSS y el ícono correspondiente
// ===================================
function obtenerNivelStock(cantidad) {
    if (cantidad >= 50) {
        return {
            clase: 'stock-high',
            claseCantidad: 'cantidad-high',
            icono: 'fa-check-circle',
            texto: 'Stock Alto'
        };
    } else if (cantidad >= 20) {
        return {
            clase: 'stock-medium',
            claseCantidad: 'cantidad-medium',
            icono: 'fa-exclamation-circle',
            texto: 'Stock Medio'
        };
    } else {
        return {
            clase: 'stock-low',
            claseCantidad: 'cantidad-low',
            icono: 'fa-times-circle',
            texto: 'Stock Bajo'
        };
    }
}

// ===================================
// FUNCIÓN PARA RENDERIZAR LOS PRODUCTOS EN EL DOM
// ===================================
function renderizarProductos(lista) {
    const container = document.getElementById("productosContainer");

    // Verificamos si hay productos
    if (lista.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-box-open" style="font-size: 3rem; margin-bottom: 15px;"></i>
                <h3>No hay productos disponibles</h3>
                <p>No se encontraron productos en el inventario.</p>
            </div>`;
        return;
    }

    // Limpiamos el contenedor
    container.innerHTML = "";

    // Iteramos sobre cada producto
    lista.forEach(producto => {
        // Creamos la tarjeta del producto
        const card = document.createElement("div");
        card.className = "product-card";

        // Formateamos el precio en formato moneda
        const precioFormateado = new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD'
        }).format(producto.precio);

        // Obtenemos el nivel de stock basado en la cantidad
        const nivelStock = obtenerNivelStock(producto.cantidad);

        // Construimos el HTML de la tarjeta
        card.innerHTML = `
            <div class="product-image-container">
                <img src="/uploads/productos/${producto.imagen.trim()}" 
                     alt="${producto.nombre}" 
                     class="product-image"
                     onerror="this.src='/imagenes/default-product.jpg'">
                
                <!-- Badge de estado del producto (ACTIVO/INACTIVO) -->
                <div class="product-badge ${producto.estado === 'INACTIVO' ? 'badge-inactive' : 'badge-active'}">
                    ${producto.estado}
                </div>
                
                <!-- Badge de nivel de stock (ALTO/MEDIO/BAJO) -->
                <div class="stock-badge ${nivelStock.clase}">
                    <i class="fas ${nivelStock.icono}"></i>
                    ${nivelStock.texto}
                </div>
            </div>
            
            <div class="product-info">
                <h2 class="product-name">${producto.nombre}</h2>
                <p class="product-description">${producto.descripcion}</p>
                
                <!-- Detalles del producto en grid -->
                <div class="product-details">
                    <div class="detail-item">
                        <span class="detail-label">ID</span>
                        <span class="detail-value">${producto.idProducto}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Categoría</span>
                        <span class="detail-value">${producto.categoria}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Cantidad</span>
                        <!-- Aplicamos color dinámico a la cantidad -->
                        <span class="detail-value cantidad-valor ${nivelStock.claseCantidad}">
                            ${producto.cantidad} unidades
                        </span>
                    </div>
                </div>
                
                <!-- Precio del producto -->
                <div class="price">${precioFormateado}</div>
                
                <!-- Botón para añadir al inventario -->
                <button class="btn-add" onclick="agregarInventario(${producto.idProducto})">
                    <i class="fas fa-cart-plus"></i> Añadir al inventario
                </button>
            </div>
        `;

        // Añadimos la tarjeta al contenedor
        container.appendChild(card);
    });
}

// ===================================
// FUNCIÓN PARA FILTRAR PRODUCTOS POR BÚSQUEDA
// ===================================
function filtrarProductos() {
    // Obtenemos el texto de búsqueda en minúsculas
    const texto = document.getElementById("searchInput").value.toLowerCase();

    // Obtenemos todas las tarjetas de productos
    const cards = document.querySelectorAll(".product-card");

    // Contador de resultados encontrados
    let resultadosEncontrados = 0;

    // Iteramos sobre cada tarjeta
    cards.forEach(card => {
        // Obtenemos el nombre del producto
        const nombre = card.querySelector(".product-name").textContent.toLowerCase();

        // Mostramos u ocultamos según coincida con la búsqueda
        if (nombre.includes(texto)) {
            card.style.display = "flex";
            resultadosEncontrados++;
        } else {
            card.style.display = "none";
        }
    });

    // Manejo del mensaje de "sin resultados"
    const container = document.getElementById("productosContainer");
    let noResultsMsg = container.querySelector(".no-results");

    // Si no hay resultados y hay texto de búsqueda
    if (resultadosEncontrados === 0 && texto !== "") {
        // Si no existe el mensaje, lo creamos
        if (!noResultsMsg) {
            noResultsMsg = document.createElement("div");
            noResultsMsg.className = "no-results";
            noResultsMsg.innerHTML = `
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 15px;"></i>
                <h3>No se encontraron productos</h3>
                <p>No hay resultados para "${texto}". Intenta con otros términos.</p>
            `;
            container.appendChild(noResultsMsg);
        }
    } else if (noResultsMsg) {
        // Si hay resultados o no hay búsqueda, eliminamos el mensaje
        noResultsMsg.remove();
    }
}

// ===================================
// FUNCIÓN PARA AGREGAR PRODUCTO AL INVENTARIO
// ===================================
function agregarInventario(idProducto) {
    // Datos que se enviarán al servidor
    const datos = {
        idProducto: idProducto,
        cantidadDisponible: 10, // Cantidad fija (puede modificarse)
        ubicacion: "local1",
        fechaCaducidad: "2026-12-31"
    };

    // Petición POST al servidor
    fetch("http://localhost:8080/inventario/agregar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
    })
        .then(res => {
            // Verificamos si la respuesta fue exitosa
            if (!res.ok) throw new Error("Error al agregar inventario");
            return res.text();
        })
        .then(msg => {
            // Mostramos notificación de éxito
            mostrarNotificacion("Producto agregado al inventario correctamente", "success");
        })
        .catch(err => {
            // Mostramos notificación de error
            console.error(err);
            mostrarNotificacion("No se pudo agregar el producto al inventario", "error");
        });
}

// ===================================
// FUNCIÓN PARA MOSTRAR NOTIFICACIONES TEMPORALES
// ===================================
function mostrarNotificacion(mensaje, tipo) {
    // Creamos el elemento de notificación
    const notificacion = document.createElement("div");
    notificacion.textContent = mensaje;
    notificacion.className = `notificacion ${tipo}`;

    // Agregamos la notificación al body
    document.body.appendChild(notificacion);

    // Animación de entrada (desliza desde la derecha)
    setTimeout(() => {
        notificacion.style.transform = "translateX(0)";
    }, 100);

    // Animación de salida y eliminación después de 3 segundos
    setTimeout(() => {
        notificacion.style.transform = "translateX(100%)";
        setTimeout(() => {
            document.body.removeChild(notificacion);
        }, 300);
    }, 3000);
}

// ===================================
// EVENTO: Búsqueda al presionar Enter
// ===================================
document.getElementById("searchInput").addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        filtrarProductos();
    }
});

// ===================================
// INICIALIZACIÓN: Cargar productos al cargar la página
// ===================================
document.addEventListener('DOMContentLoaded', cargarProductos);