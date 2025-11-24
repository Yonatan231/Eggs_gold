// ===== entrada_stock.js =====
// Reemplazar TODO el contenido del archivo

/* ============================================
   CARGAR PRODUCTOS DISPONIBLES
   ============================================ */

// Variable global para almacenar todos los productos
let todosLosProductos = [];

document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    configurarBuscador();
    configurarCSV();
});

/**
 * Carga la lista de productos desde el backend
 */
function cargarProductos() {
    fetch("/entrada-stock/api/productos")
        .then(response => response.json())
        .then(productos => {
            todosLosProductos = productos;
            mostrarProductos(productos);
        })
        .catch(error => {
            console.error("❌ Error al cargar productos:", error);
            mostrarMensaje("Error al cargar la lista de productos", "error");
        });
}

/**
 * Muestra productos en el select
 */
function mostrarProductos(productos) {
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
}

/* ============================================
   BUSCADOR DE PRODUCTOS
   ============================================ */

function configurarBuscador() {
    const inputBuscador = document.getElementById("buscar-producto");

    inputBuscador.addEventListener('input', function(e) {
        const textoBusqueda = e.target.value.toLowerCase().trim();

        if (textoBusqueda === '') {
            // Si está vacío, mostrar todos
            mostrarProductos(todosLosProductos);
        } else {
            // Filtrar productos que coincidan
            const productosFiltrados = todosLosProductos.filter(producto => {
                const nombre = producto.nombre.toLowerCase();
                const categoria = producto.categoria.toLowerCase();
                return nombre.includes(textoBusqueda) || categoria.includes(textoBusqueda);
            });

            mostrarProductos(productosFiltrados);
        }
    });
}

/* ============================================
   CARGA CSV
   ============================================ */

function configurarCSV() {
    // Manejar clic en botón CSV
    document.getElementById('btn-csv').addEventListener('click', function() {
        document.getElementById('input-csv').click();
    });

    // Manejar selección de archivo CSV
    document.getElementById('input-csv').addEventListener('change', function(e) {
        const archivo = e.target.files[0];

        if (!archivo) {
            return;
        }

        // Validar extensión
        if (!archivo.name.toLowerCase().endsWith('.csv')) {
            alert('❌ Por favor selecciona un archivo .csv');
            return;
        }

        // Confirmar antes de enviar
        if (!confirm('¿Deseas cargar las entradas desde el archivo ' + archivo.name + '?')) {
            e.target.value = ''; // Limpiar selección
            return;
        }

        // Crear FormData y enviar
        const formData = new FormData();
        formData.append('archivoCSV', archivo);

        // Mostrar indicador de carga
        document.getElementById('btn-csv').disabled = true;
        document.getElementById('btn-csv').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';

        // Enviar petición
        fetch('/entrada-stock/api/cargar-csv', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                // Restaurar botón
                document.getElementById('btn-csv').disabled = false;
                document.getElementById('btn-csv').innerHTML = '<i class="fas fa-file-csv"></i> Cargar CSV';

                // Limpiar input
                e.target.value = '';

                // Mostrar resultado en modal
                mostrarResultado(data);
            })
            .catch(error => {
                // Restaurar botón
                document.getElementById('btn-csv').disabled = false;
                document.getElementById('btn-csv').innerHTML = '<i class="fas fa-file-csv"></i> Cargar CSV';

                alert('❌ Error al cargar el archivo: ' + error);
                console.error('Error:', error);
            });
    });
}

/**
 * Función para mostrar resultado en modal
 */
function mostrarResultado(data) {
    const modal = document.getElementById('modal-resultado');
    const titulo = document.getElementById('modal-titulo');
    const mensaje = document.getElementById('modal-mensaje');
    const divErrores = document.getElementById('modal-errores');
    const listaErrores = document.getElementById('lista-errores');

    // Configurar título y mensaje
    if (data.success) {
        titulo.textContent = '✅ Carga completada';
        titulo.style.color = '#27AE60';
    } else {
        titulo.textContent = '❌ Error en la carga';
        titulo.style.color = '#c62828';
    }

    mensaje.textContent = data.message;

    // Mostrar errores si existen
    if (data.errores && data.errores.length > 0) {
        divErrores.style.display = 'block';
        listaErrores.innerHTML = '';
        data.errores.forEach(error => {
            const li = document.createElement('li');
            li.textContent = error;
            listaErrores.appendChild(li);
        });
    } else {
        divErrores.style.display = 'none';
    }

    // Mostrar modal
    modal.style.display = 'flex';
}

/**
 * Función para cerrar modal
 */
function cerrarModal() {
    document.getElementById('modal-resultado').style.display = 'none';
    // Recargar página para ver las nuevas entradas
    location.reload();
}

/* ============================================
   MOSTRAR MENSAJES
   ============================================ */

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