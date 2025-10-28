// ========================================
// ARCHIVO: inventario.js
// DESCRIPCIÓN: Controla toda la funcionalidad del carrito de compras
// ========================================

/* ========================================
   1. VERIFICACIÓN DE SESIÓN DEL USUARIO
   ======================================== */

// Esta función se ejecuta automáticamente cuando se carga la página
// Verifica que el usuario haya iniciado sesión antes de acceder
fetch('/session', { credentials: 'same-origin' }) // Envía la cookie de sesión al servidor
    .then(res => res.json()) // Convierte la respuesta del servidor a formato JSON
    .then(({ usuario_id, rol }) => {
        // Verificamos si el usuario tiene sesión activa
        if (!usuario_id || !rol) {
            alert("❌ Sesión no iniciada. Redirigiendo al inicio...");
            window.location.href = '/login'; // Redirige a la página de login
            return; // Salimos de la función
        }

        // Si llegamos aquí, el usuario sí tiene sesión activa
        console.log('✅ ID de sesión:', usuario_id);
        console.log('✅ Rol:', rol);

        // Si el usuario es administrador, cargamos funciones especiales
        if (rol === 'ADMIN') {
            cargarPedidosRecientes('PENDIENTE');
        }
    })
    .catch(error => {
        // Si hay algún error, lo mostramos en consola y redirigimos al login
        console.error("❌ Error al obtener sesión:", error);
        window.location.href = '/login';
    });


/* ========================================
   2. INICIALIZACIÓN AL CARGAR LA PÁGINA
   ======================================== */

// Event listener: se ejecuta cuando el HTML está completamente cargado
document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ DOM completamente cargado");

    // Verificamos qué página estamos visualizando y cargamos lo necesario

    // Si estamos en la página de productos (inventario)
    if (document.getElementById("productos-container")) {
        cargarProductos(); // Cargamos todos los productos disponibles
    }

    // Si estamos en la página del carrito
    if (document.getElementById("productos-carrito")) {
        mostrarCarrito(); // Mostramos los productos del carrito
        agregarBotonConfirmar(); // Agregamos el botón de confirmar pedido
        actualizarPasos(1); // Iniciamos en el paso 1
    }

    // Actualizamos el contador de productos en el carrito (en el header)
    actualizarContadorCarrito();
});


/* ========================================
   3. OBTENCIÓN DE DATOS DEL CLIENTE
   ======================================== */

// Obtenemos los datos del cliente guardados en localStorage (almacenamiento local del navegador)
const clienteGuardado = JSON.parse(localStorage.getItem("cliente"));

// Validamos que los datos del cliente existan
if (clienteGuardado && clienteGuardado.nombre) {
    console.log("👤 Nombre del cliente:", clienteGuardado.nombre);
} else {
    console.warn("⚠️ Cliente no definido o incompleto");
}

// Obtenemos el ID del usuario de forma segura (usando optional chaining)
// El operador ?. evita errores si clienteGuardado es null o undefined
const usuarioId = clienteGuardado?.idUsuarios || clienteGuardado?.id;

console.log("🧑 ID del usuario:", usuarioId);


/* ========================================
   4. VARIABLES GLOBALES
   ======================================== */

// Array que almacenará todos los productos disponibles
let listaProductos = [];


/* ========================================
   5. FUNCIONES PARA EL INDICADOR DE PASOS
   ======================================== */

/**
 * Función: actualizarPasos
 * Descripción: Actualiza el indicador visual de los pasos del proceso
 * @param {number} pasoActual - Número del paso actual (1, 2 o 3)
 */
function actualizarPasos(pasoActual) {
    // Removemos todas las clases activas y completadas de todos los pasos
    document.querySelectorAll('.paso').forEach(paso => {
        paso.classList.remove('activo', 'completado');
    });

    // Marcamos los pasos según el paso actual
    if (pasoActual === 1) {
        // Paso 1: Carrito (activo)
        document.getElementById('paso1').classList.add('activo');
    } else if (pasoActual === 2) {
        // Paso 2: Datos (activo), Paso 1 completado
        document.getElementById('paso1').classList.add('completado');
        document.getElementById('paso2').classList.add('activo');
    } else if (pasoActual === 3) {
        // Paso 3: Confirmación (activo), Pasos 1 y 2 completados
        document.getElementById('paso1').classList.add('completado');
        document.getElementById('paso2').classList.add('completado');
        document.getElementById('paso3').classList.add('activo');
    }
}


/* ========================================
   6. FUNCIONES PARA CARGAR Y MOSTRAR PRODUCTOS
   ======================================== */

/**
 * Función: cargarProductos
 * Descripción: Obtiene todos los productos disponibles desde el servidor
 */
function cargarProductos() {
    // Hacemos una petición GET al servidor
    fetch("/inventario/disponibles")
        .then(response => response.json()) // Convertimos la respuesta a JSON
        .then(productos => {
            listaProductos = productos; // Guardamos los productos en la variable global
            mostrarProductos(productos); // Mostramos los productos en la página
        })
        .catch(error => console.error("❌ Error cargando los productos:", error));
}

/**
 * Función: mostrarProductos
 * Descripción: Muestra los productos en el contenedor HTML
 * @param {Array} productos - Array con los productos a mostrar
 */
function mostrarProductos(productos) {
    const productosContainer = document.getElementById("productos-container");
    productosContainer.innerHTML = ""; // Limpiamos el contenedor

    // Validamos que la respuesta sea un array
    if (!Array.isArray(productos)) {
        console.error("❌ La respuesta no es un array:", productos);
        productosContainer.innerHTML = "<p>No se pudieron cargar los productos.</p>";
        return;
    }

    // Iteramos sobre cada producto y creamos su tarjeta HTML
    productos.forEach(producto => {
        // Creamos el HTML de cada producto usando template literals (backticks)
        const productoHTML = `
            <div class="tarjeta-producto">
                <img src="/imagenes/${producto.imagen}" class="producto1" alt="${producto.nombre}">
                <h4 class="inventarios">${producto.nombre}</h4>
                <p class="categoria-producto">${producto.categoria}</p>
                <p class="descripcion-producto">${producto.descripcion}</p>
                <p class="estado-producto">${producto.estado}</p>
                <p class="stock-producto">Stock: ${producto.cantidad}</p>
                <h4 class="inventarios2">$${new Intl.NumberFormat("es-CO").format(producto.precio)}</h4>
                <button class="boton_compra" 
                        data-id="${producto.idProducto}" 
                        data-nombre="${producto.nombre}" 
                        data-precio="${producto.precio}">
                    🛒 Agregar al carrito
                </button>
            </div>
        `;
        productosContainer.innerHTML += productoHTML;
    });
}


/* ========================================
   7. FUNCIONES DEL CARRITO DE COMPRAS
   ======================================== */

/**
 * Función: agregarAlCarrito
 * Descripción: Agrega un producto al carrito del usuario
 * @param {number} idProducto - ID del producto a agregar
 * @param {number} precioProducto - Precio del producto
 * @param {number} cantidad - Cantidad a agregar
 */
function agregarAlCarrito(idProducto, precioProducto, cantidad) {
    // Creamos un objeto con los datos a enviar
    const datosProducto = {
        productoId: idProducto,
        cantidad: cantidad
    };

    // Realizamos la petición POST al servidor
    fetch("/api/carrito/agregar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json" // Indicamos que enviamos JSON
        },
        body: JSON.stringify(datosProducto) // Convertimos el objeto a JSON
    })
        .then(response => response.text()) // Obtenemos la respuesta como texto
        .then(mensaje => {
            alert(mensaje); // Mostramos el mensaje de confirmación
            actualizarContadorCarrito(); // Actualizamos el contador del carrito

            // Si estamos en la página del carrito, lo refrescamos
            const productosCarrito = document.getElementById("productos-carrito");
            if (productosCarrito) {
                mostrarCarrito(); // Actualizamos la vista del carrito
            }
        })
        .catch(error => console.error("❌ Error agregando producto al carrito:", error));
}

/**
 * Función: actualizarContadorCarrito
 * Descripción: Actualiza el número que muestra cuántos productos hay en el carrito
 */
function actualizarContadorCarrito() {
    // Obtenemos el carrito temporal del usuario
    fetch(`/api/carrito/temporal?usuario=${usuarioId}`)
        .then(response => response.json())
        .then(carrito => {
            console.log("📦 Respuesta carrito:", carrito);

            // Validamos que el carrito sea un array
            if (!Array.isArray(carrito)) {
                console.error("⚠️ El carrito no es un array:", carrito);
                return;
            }

            // Calculamos el total de productos sumando las cantidades
            const totalProductos = carrito.reduce((total, producto) => {
                // Obtenemos la cantidad del producto (puede venir en diferentes formatos)
                const cantidad = parseInt(producto.CANTIDAD || producto.cantidad || 0);
                return total + cantidad;
            }, 0);

            // Actualizamos el contador en el DOM (si existe)
            const contadorCarrito = document.getElementById("contador-carrito");
            if (contadorCarrito) {
                contadorCarrito.textContent = totalProductos;
            }
        })
        .catch(error => console.error("❌ Error actualizando contador del carrito:", error));
}

/**
 * Función: mostrarCarrito
 * Descripción: Muestra todos los productos del carrito con su información
 */
function mostrarCarrito() {
    const listaCarrito = document.getElementById("productos-carrito");
    const totalCarrito = document.getElementById("total-carrito");

    // Verificamos que los elementos existan en el HTML
    if (!listaCarrito || !totalCarrito) return;

    // Obtenemos los productos del carrito desde el servidor
    fetch(`/api/carrito/temporal?usuario=${usuarioId}`)
        .then(response => response.json())
        .then(carrito => {
            listaCarrito.innerHTML = ""; // Limpiamos la lista actual

            // Si el carrito está vacío, mostramos un mensaje
            if (carrito.length === 0) {
                listaCarrito.innerHTML = "<p class='mensaje-vacio'>🛒 Tu carrito está vacío.</p>";
                totalCarrito.textContent = "Total: $0";
                mostrarCarritoVacio(); // Mostramos el mensaje especial de carrito vacío
                return;
            }

            // Variable para acumular el total
            let total = 0;

            // Iteramos sobre cada producto del carrito
            carrito.forEach(item => {
                const cantidad = item.cantidad || item.CANTIDAD || 0;
                const precioTotal = item.precio * cantidad;

                // Creamos el elemento HTML para cada producto
                const li = document.createElement("li");
                li.className = "item-carrito"; // Agregamos clase para estilos

                // Estructura HTML del producto
                li.innerHTML = `
                    <div class="info-producto">
                        <div class="nombre-producto">
                            📦 ${item.nombre}
                        </div>
                        <div class="detalles-producto">
                            Cantidad: ${cantidad} | 
                            Precio unitario: $${new Intl.NumberFormat("es-CO").format(item.precio)} | 
                            Subtotal: $${new Intl.NumberFormat("es-CO").format(precioTotal)}
                        </div>
                    </div>
                    <button class="eliminar-item" data-id="${item.id}">
                        🗑️ Eliminar
                    </button>
                `;

                listaCarrito.appendChild(li);
                total += precioTotal; // Sumamos al total
            });

            // Actualizamos el total formateado en pesos colombianos
            totalCarrito.textContent = `Total: $${new Intl.NumberFormat("es-CO").format(total)}`;

            // Agregamos funcionalidad a los botones de eliminar
            agregarEventosEliminar();

            // Ocultamos el mensaje de carrito vacío y actualizamos pasos
            ocultarCarritoVacio();
            actualizarPasos(1); // Volvemos al paso 1 (carrito)
        })
        .catch(error => console.error("❌ Error al obtener productos del carrito:", error));
}

/**
 * Función: agregarEventosEliminar
 * Descripción: Agrega funcionalidad a los botones de eliminar productos
 */
function agregarEventosEliminar() {
    document.querySelectorAll(".eliminar-item").forEach(boton => {
        boton.addEventListener("click", () => {
            const id = boton.getAttribute("data-id");

            // Confirmamos si el usuario quiere eliminar el producto
            if (confirm("¿Estás seguro de eliminar este producto del carrito?")) {
                // Realizamos petición DELETE al servidor
                fetch(`/api/carrito/eliminar?id=${id}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: `id=${id}`
                })
                    .then(response => response.text())
                    .then(msg => {
                        alert(msg); // Mostramos mensaje de confirmación
                        mostrarCarrito(); // Refrescamos el carrito
                        actualizarContadorCarrito(); // Actualizamos el contador
                    })
                    .catch(error => console.error("❌ Error al eliminar el producto:", error));
            }
        });
    });
}

/**
 * Función: mostrarCarritoVacio
 * Descripción: Muestra un mensaje especial cuando el carrito está vacío
 */
function mostrarCarritoVacio() {
    const carritoVacio = document.getElementById("carrito-vacio");
    const confirmarContainer = document.getElementById("confirmar-pedido-container");

    if (carritoVacio) {
        carritoVacio.classList.remove("oculto");
    }

    // Ocultamos el botón de confirmar si el carrito está vacío
    if (confirmarContainer) {
        confirmarContainer.style.display = "none";
    }
}

/**
 * Función: ocultarCarritoVacio
 * Descripción: Oculta el mensaje de carrito vacío cuando hay productos
 */
function ocultarCarritoVacio() {
    const carritoVacio = document.getElementById("carrito-vacio");
    const confirmarContainer = document.getElementById("confirmar-pedido-container");

    if (carritoVacio) {
        carritoVacio.classList.add("oculto");
    }

    // Mostramos el botón de confirmar si hay productos
    if (confirmarContainer) {
        confirmarContainer.style.display = "block";
    }
}


/* ========================================
   8. FUNCIONES PARA CONFIRMAR PEDIDO
   ======================================== */

/**
 * Función: agregarBotonConfirmar
 * Descripción: Agrega el botón de confirmar pedido al contenedor
 */
function agregarBotonConfirmar() {
    const contenedor = document.getElementById("confirmar-pedido-container");
    if (!contenedor) return; // Si no existe el contenedor, salimos

    // Creamos el botón
    const btnConfirmar = document.createElement("button");
    btnConfirmar.textContent = "✅ Confirmar Pedido";
    btnConfirmar.className = "boton-confirmar"; // Agregamos clase para estilos

    // Agregamos el evento click
    btnConfirmar.addEventListener("click", confirmarPedido);

    // Agregamos el botón al contenedor
    contenedor.appendChild(btnConfirmar);
}

/**
 * Función: confirmarPedido
 * Descripción: Procesa la confirmación del pedido y lo envía al servidor
 */
function confirmarPedido() {
    const direccion = document.getElementById("direccion").value.trim();

    // Validamos que se haya ingresado una dirección
    if (!direccion) {
        alert("⚠️ Por favor ingresa una dirección de entrega.");
        // Enfocamos el campo de dirección
        document.getElementById("direccion").focus();
        actualizarPasos(2); // Movemos al paso 2 (datos)
        return;
    }

    // Validamos que la dirección tenga al menos 10 caracteres
    if (direccion.length < 10) {
        alert("⚠️ Por favor ingresa una dirección válida (mínimo 10 caracteres).");
        actualizarPasos(2); // Movemos al paso 2 (datos)
        return;
    }

    // Mostramos mensaje de carga
    const btnConfirmar = document.querySelector("#confirmar-pedido-container button");
    const textoOriginal = btnConfirmar.textContent;
    btnConfirmar.textContent = "⏳ Procesando pedido...";
    btnConfirmar.disabled = true; // Deshabilitamos el botón

    // Actualizamos al paso 3 (procesando)
    actualizarPasos(3);

    // Realizamos petición POST al servidor
    fetch(`/api/pedido/confirmar`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include", // 🔒 Necesario para mantener la sesión activa
        body: JSON.stringify({
            direccion: direccion
        })
    })
        .then(response => response.text())
        .then(mensaje => {
            alert("✅ " + mensaje); // Mostramos mensaje de confirmación

            // Limpiamos el campo de dirección
            document.getElementById("direccion").value = "";

            // Actualizamos la vista
            actualizarContadorCarrito();
            mostrarCarrito(); // Esto refrescará y volverá al paso 1

            // Restauramos el botón
            btnConfirmar.textContent = textoOriginal;
            btnConfirmar.disabled = false;
        })
        .catch(error => {
            console.error("❌ Error al confirmar el pedido:", error);
            alert("❌ Error al confirmar el pedido. Por favor intenta nuevamente.");

            // Restauramos el botón y volvemos al paso 2
            btnConfirmar.textContent = textoOriginal;
            btnConfirmar.disabled = false;
            actualizarPasos(2);
        });
}


/* ========================================
   9. FUNCIONES DE BÚSQUEDA Y FILTRADO
   ======================================== */

// Event listener para el buscador de productos
document.addEventListener("DOMContentLoaded", () => {
    const buscador = document.getElementById("buscador-productos");

    // Solo agregamos el evento si el buscador existe en la página
    if (buscador) {
        buscador.addEventListener("input", () => {
            const texto = buscador.value.toLowerCase(); // Convertimos a minúsculas

            // Filtramos los productos que contengan el texto buscado
            const filtrados = listaProductos.filter(producto =>
                producto.nombre.toLowerCase().includes(texto)
            );

            // Mostramos solo los productos filtrados
            mostrarProductos(filtrados);
        });

        // Cargamos todos los productos al iniciar
        cargarProductos();
    }
});


/* ========================================
   10. EVENT LISTENERS GLOBALES
   ======================================== */

// Event listener global para capturar clics en botones de compra
document.addEventListener("click", function (event) {
    // Verificamos si se hizo clic en un botón de compra
    if (event.target.classList.contains("boton_compra")) {
        const idProducto = event.target.getAttribute("data-id");
        const precioProducto = parseFloat(event.target.getAttribute("data-precio"));

        // Agregamos el producto al carrito
        agregarAlCarrito(idProducto, precioProducto, 1);
    }
});


/* ========================================
   11. FUNCIONES ADICIONALES PARA ADMIN
   ======================================== */

/**
 * Función: cargarPedidosRecientes (solo para administradores)
 * Descripción: Carga los pedidos recientes según su estado
 * @param {string} estado - Estado de los pedidos a cargar
 */
function cargarPedidosRecientes(estado) {
    // Esta función solo se ejecuta para usuarios con rol ADMIN
    console.log(`📋 Cargando pedidos con estado: ${estado}`);

    // Aquí iría la lógica para cargar pedidos (implementar según backend)
    // fetch(`/api/pedidos?estado=${estado}`)
    //     .then(response => response.json())
    //     .then(pedidos => {
    //         console.log("Pedidos recientes:", pedidos);
    //         // Mostrar los pedidos en la interfaz
    //     });
}


/* ========================================
   NOTAS PARA PRINCIPIANTES:
   ========================================

   🎯 INDICADOR DE PASOS:
   - Paso 1: Carrito - Revisas los productos
   - Paso 2: Datos - Ingresas dirección
   - Paso 3: Confirmación - Pedido procesándose

   📦 ESTADOS DEL CARRITO:
   - Vacío: Muestra mensaje especial
   - Con productos: Muestra lista y botón confirmar
   - Procesando: Botón deshabilitado y paso 3 activo

   🔄 FLUJO DE TRABAJO:
   1. Usuario agrega productos al carrito
   2. Ve su carrito (Paso 1)
   3. Ingresa dirección (Paso 2)
   4. Confirma pedido (Paso 3)
   5. Carrito se vacía y vuelve al Paso 1

   ========================================
*/