/* ============================================
   CARGAR PRODUCTOS DISPONIBLES
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
});

/**
 * Carga la lista de productos desde el backend
 */
function cargarProductos() {
    fetch("/entrada-stock/api/productos")
        .then(response => response.json())
        .then(productos => {
            const select = document.getElementById("producto");

            // Limpiar opciones existentes (excepto la primera)
            select.innerHTML = '<option value="">-- Seleccionar producto --</option>';

            // Agregar cada producto como opción
            productos.forEach(producto => {
                const option = document.createElement("option");
                option.value = producto.idProducto;
                option.textContent = `${producto.nombre} - ${producto.categoria}`;
                select.appendChild(option);
            });
        })
        .catch(error => {
            console.error("❌ Error al cargar productos:", error);
            mostrarMensaje("Error al cargar la lista de productos", "error");
        });
}

/**
 * Muestra un mensaje de éxito o error
 */
function mostrarMensaje(texto, tipo) {
    const mensajeSuccess = document.getElementById("mensaje-success");
    const mensajeError = document.getElementById("mensaje-error");

    // Ocultar ambos mensajes primero
    mensajeSuccess.style.display = 'none';
    mensajeError.style.display = 'none';

    if (tipo === 'success') {
        mensajeSuccess.textContent = texto;
        mensajeSuccess.style.display = 'block';

        setTimeout(() => {
            mensajeSuccess.style.display = 'none';
        }, 5000);
    } else if (tipo === 'error') {
        mensajeError.textContent = texto;
        mensajeError.style.display = 'block';

        setTimeout(() => {
            mensajeError.style.display = 'none';
        }, 5000);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ============================================
   ENVIAR FORMULARIO
   ============================================ */

const form = document.getElementById("entradaForm");

form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Obtener valores del formulario
    const idProducto = document.getElementById("producto").value;
    const cantidad = document.getElementById("cantidad").value;
    const proveedor = document.getElementById("proveedor").value.trim();

    // Validaciones
    if (!idProducto) {
        mostrarMensaje("Debe seleccionar un producto", "error");
        return;
    }

    if (cantidad <= 0) {
        mostrarMensaje("La cantidad debe ser mayor a 0", "error");
        return;
    }

    if (proveedor.length < 3) {
        mostrarMensaje("El nombre del proveedor debe tener al menos 3 caracteres", "error");
        return;
    }

    // Enviar datos al servidor
    const datos = {
        idProducto: parseInt(idProducto),
        cantidad: parseInt(cantidad),
        proveedor: proveedor,
    };

    fetch('/entrada-stock/api/registrar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(datos)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarMensaje(data.message, "success");
                form.reset();
            } else {
                mostrarMensaje(data.message, "error");
            }
        })
        .catch(error => {
            console.error("❌ Error:", error);
            mostrarMensaje("Error al registrar la entrada. Por favor, intenta nuevamente.", "error");
        });
});