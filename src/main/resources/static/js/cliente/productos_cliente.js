/* ============================================
   CARGAR PRODUCTOS DISPONIBLES PARA CLIENTE
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    console.log("🔍 Iniciando carga de productos...");
    cargarProductos();
    cargarContadorCarrito(); // ✅ Cargar contador al inicio
});

/**
 * Carga los productos disponibles desde el backend
 */
function cargarProductos() {
    const container = document.getElementById("productos-container");
    const mensajeCarga = document.getElementById("mensaje-carga");
    const mensajeError = document.getElementById("mensaje-error");
    const mensajeSinProductos = document.getElementById("mensaje-sin-productos");

    if (!container) {
        console.error("❌ No se encontró el contenedor de productos");
        return;
    }

    console.log("📡 Haciendo petición al servidor...");

    fetch("/cliente/api/productos")
        .then(response => {
            console.log("📥 Respuesta recibida:", response.status);
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(productos => {
            console.log("📦 Productos recibidos:", productos);

            if (mensajeCarga) mensajeCarga.style.display = 'none';

            if (!productos || productos.length === 0) {
                console.warn("⚠️ No hay productos disponibles");
                if (mensajeSinProductos) mensajeSinProductos.style.display = 'block';
                return;
            }

            container.innerHTML = "";

            productos.forEach(producto => {
                const card = crearTarjetaProducto(producto);
                container.appendChild(card);
            });

            console.log(`✅ ${productos.length} productos cargados correctamente`);
        })
        .catch(error => {
            console.error("❌ Error al cargar productos:", error);

            if (mensajeCarga) mensajeCarga.style.display = 'none';
            if (mensajeError) mensajeError.style.display = 'block';
        });
}

/**
 * Crea una tarjeta HTML para un producto
 */
function crearTarjetaProducto(producto) {
    const card = document.createElement("div");
    card.className = "producto-card";
    card.setAttribute("data-id", producto.idProducto);

    const img = document.createElement("img");
    img.src = producto.imagen && producto.imagen.trim() !== ''
        ? `/uploads/productos/${producto.imagen.trim()}`
        : '/uploads/productos/default.png';
    img.alt = producto.nombre;
    img.onerror = function() {
        this.src = '/uploads/productos/default.png';
    };

    const nombre = document.createElement("h4");
    nombre.textContent = producto.nombre;

    const categoria = document.createElement("p");
    categoria.className = "producto-categoria";
    categoria.textContent = ` ${producto.categoria}`;

    const descripcion = document.createElement("p");
    descripcion.className = "producto-descripcion";
    descripcion.textContent = producto.descripcion;

    const precio = document.createElement("div");
    precio.className = "inventarios2";
    precio.textContent = `$${parseInt(producto.precio).toLocaleString("es-CO")}`;

    const disponibilidad = document.createElement("p");
    disponibilidad.className = "producto-disponibilidad";
    disponibilidad.textContent = `✅ Disponibles: ${producto.cantidad} unidades`;

    // ✅ Botón activado con evento
    const boton = document.createElement("button");
    boton.className = "boton_compra";
    boton.textContent = "Ver producto";
    boton.onclick = () => abrirModalCantidad(producto);

    card.appendChild(img);
    card.appendChild(nombre);
    card.appendChild(categoria);
    card.appendChild(descripcion);
    card.appendChild(precio);
    card.appendChild(disponibilidad);
    card.appendChild(boton);

    return card;
}

/* ============================================
   MODAL DE CANTIDAD
   ============================================ */

function abrirModalCantidad(producto) {
    // Crear overlay del modal
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay-cantidad";
    overlay.id = "modal-cantidad";

    // Crear contenido del modal
    overlay.innerHTML = `
        <div class="modal-cantidad">
            <div class="modal-header">
                <h3>${producto.nombre}</h3>
                <button class="modal-close" onclick="cerrarModalCantidad()">×</button>
            </div>
            <div class="modal-body">
                <img src="/uploads/productos/${producto.imagen || 'default.png'}" alt="${producto.nombre}">
                <p class="modal-precio">$${parseInt(producto.precio).toLocaleString("es-CO")}</p>
                <p class="modal-disponible">Disponibles: ${producto.cantidad} unidades</p>
                
                <label for="cantidad-input">Cantidad:</label>
                <input type="number" 
                       id="cantidad-input" 
                       min="1" 
                       max="${producto.cantidad}" 
                       value="1" 
                       class="input-cantidad">
                <p class="error-cantidad" id="error-cantidad" style="display: none; color: red;"></p>
            </div>
            <div class="modal-footer">
                <button class="btn-agregar-carrito" onclick="agregarAlCarrito(${producto.idProducto}, ${producto.cantidad})">
                    🛒 Agregar al carrito
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Cerrar modal al hacer clic fuera
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            cerrarModalCantidad();
        }
    });
}

function cerrarModalCantidad() {
    const modal = document.getElementById("modal-cantidad");
    if (modal) {
        modal.remove();
    }
}

function agregarAlCarrito(idProducto, maxCantidad) {
    const inputCantidad = document.getElementById("cantidad-input");
    const errorCantidad = document.getElementById("error-cantidad");
    const cantidad = parseInt(inputCantidad.value);

    // Validaciones
    if (isNaN(cantidad) || cantidad <= 0) {
        errorCantidad.textContent = "❌ La cantidad debe ser mayor a 0";
        errorCantidad.style.display = 'block';
        return;
    }

    if (cantidad > maxCantidad) {
        errorCantidad.textContent = `❌ Solo hay ${maxCantidad} unidades disponibles`;
        errorCantidad.style.display = 'block';
        return;
    }

    // Enviar al backend
    const datos = {
        idProducto: idProducto,
        cantidad: cantidad
    };

    fetch('/carrito/api/agregar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                cerrarModalCantidad();
                cargarContadorCarrito(); // Actualizar contador
            } else {
                errorCantidad.textContent = data.message;
                errorCantidad.style.display = 'block';
            }
        })
        .catch(error => {
            console.error("❌ Error:", error);
            alert("❌ Error al agregar al carrito");
        });
}

/* ============================================
   CONTADOR DEL CARRITO
   ============================================ */

function cargarContadorCarrito() {
    fetch('/carrito/api/contador')
        .then(response => response.json())
        .then(data => {
            const contador = document.getElementById("contador-carrito");
            if (contador) {
                contador.textContent = data.cantidad || 0;
            }
        })
        .catch(error => {
            console.error("❌ Error al cargar contador:", error);
        });
}

/* ============================================
   BÚSQUEDA DE PRODUCTOS
   ============================================ */

const buscador = document.getElementById("buscador-productos");
if (buscador) {
    buscador.addEventListener("input", (e) => {
        const termino = e.target.value.toLowerCase().trim();
        const productos = document.querySelectorAll(".producto-card");

        productos.forEach(card => {
            const nombre = card.querySelector("h4").textContent.toLowerCase();
            const categoria = card.querySelector(".producto-categoria").textContent.toLowerCase();
            const descripcion = card.querySelector(".producto-descripcion").textContent.toLowerCase();

            if (nombre.includes(termino) || categoria.includes(termino) || descripcion.includes(termino)) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });
    });
}