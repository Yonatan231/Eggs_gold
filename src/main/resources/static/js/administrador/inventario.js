// ============================================
// VARIABLES GLOBALES
// ============================================
let inventarioCompleto = []; // Almacena todos los datos del inventario

// ============================================
// CARGAR INVENTARIO DESDE EL BACKEND
// ============================================
function cargarInventario() {
    // Hacer petición al backend
    fetch('/api/inventario/lista')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Guardar datos en variable global
                inventarioCompleto = data.data;

                // Mostrar datos en la tabla
                mostrarInventario(inventarioCompleto);

                // Aplicar colores a los badges
                aplicarColores();
            } else {
                mostrarError("Error al cargar inventario: " + data.message);
            }
        })
        .catch(error => {
            console.error("Error al cargar inventario:", error);
            mostrarError("Error de conexión al cargar el inventario");
        });
}

// ============================================
// MOSTRAR INVENTARIO EN LA TABLA
// ============================================
function mostrarInventario(inventarios) {
    const tbody = document.getElementById("tabla-inventario-body");

    // Limpiar tabla
    tbody.innerHTML = "";

    // Si no hay datos, mostrar mensaje
    if (inventarios.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #999;">
                    <i class="fas fa-box-open" style="font-size: 3rem; margin-bottom: 10px; display: block;"></i>
                    No se encontraron registros en el inventario
                </td>
            </tr>
        `;
        return;
    }

    // Recorrer cada registro y crear una fila
    inventarios.forEach(inv => {
        const fila = document.createElement("tr");
        fila.className = "fila-inventario";

        // Atributo data-estado basado en el estado del producto
        fila.setAttribute("data-estado", inv.estado || "DISPONIBLE");

        // Formatear fecha de actualización
        const fechaActualizacion = formatearFecha(inv.fechaActualizacion);

        // Obtener ID del producto (viene del DTO que agrupa inventarios por producto)
        const idProducto = obtenerIdProducto(inv);

        // Construir el HTML de la fila
        fila.innerHTML = `
            <td>${idProducto}</td>
            <td class="td-nombre">${inv.nombre}</td>
            <td>${inv.categoria}</td>
            <td class="td-cantidad">
                <span class="badge-cantidad">${inv.cantidadDisponible}</span>
            </td>
            <td>
                <span class="badge-estado ${obtenerClaseEstado(inv.estado)}">${formatearEstado(inv.estado)}</span>
            </td>
            <td>${fechaActualizacion}</td>
            <td>
                <button class="btn-editar" onclick="abrirModalEdicion(${idProducto})">
                    <i class="fas fa-edit"></i> Editar
                </button>
            </td>
        `;

        tbody.appendChild(fila);
    });
}

// ============================================
// OBTENER ID DEL PRODUCTO
// ============================================
function obtenerIdProducto(inv) {
    // El DTO puede tener el ID como 'idProducto' o extraerlo del inventario
    return inv.idProducto || inv.idInventario || 0;
}

// ============================================
// OBTENER CLASE CSS SEGÚN ESTADO
// ============================================
function obtenerClaseEstado(categoria) {
    // Nota: El DTO usa 'categoria' pero puede contener info de estado
    // Por ahora basamos el estado en la categoría, puedes ajustar según necesites
    return "disponible"; // Por defecto verde
}

// ============================================
// FORMATEAR NOMBRE DEL ESTADO
// ============================================
function formatearEstado(categoria) {
    // Mapear estado
    return "Disponible"; // Por defecto
}

// ============================================
// APLICAR COLORES A LOS BADGES DE CANTIDAD
// ============================================
function aplicarColores() {
    // Seleccionar todas las filas de inventario
    document.querySelectorAll(".fila-inventario").forEach(fila => {
        // Obtener el td que contiene la cantidad
        const td = fila.querySelector(".td-cantidad");
        if (!td) return;

        const badge = td.querySelector(".badge-cantidad");
        if (!badge) return;

        const cantidad = parseInt(badge.innerText);

        // Limpiar clases anteriores
        badge.classList.remove("roja", "amarilla", "verde");

        // Aplicar clase según la cantidad
        if (cantidad < 100) {
            badge.classList.add("roja");
        } else if (cantidad < 500) {
            badge.classList.add("amarilla");
        } else {
            badge.classList.add("verde");
        }
    });
}

// ============================================
// FILTRAR DATOS (Búsqueda + Estado)
// ============================================
function filtrarDatos() {
    // Obtener valores de filtros
    const texto = document.getElementById("buscar").value.toLowerCase();
    const estadoFiltro = document.getElementById("filtro-estado").value;

    // Filtrar el inventario completo
    const inventarioFiltrado = inventarioCompleto.filter(inv => {
        // Filtro por texto de búsqueda
        const coincideBusqueda = texto === "" ||
            inv.nombre.toLowerCase().includes(texto) ||
            inv.categoria.toLowerCase().includes(texto) ||
            inv.descripcion.toLowerCase().includes(texto);

        // Filtro por estado del producto (DISPONIBLE, DESCONTINUADO)
        const coincideEstado = estadoFiltro === "todos" ||
            (inv.estado && inv.estado.toUpperCase() === estadoFiltro);

        return coincideBusqueda && coincideEstado;
    });

    // Mostrar inventario filtrado
    mostrarInventario(inventarioFiltrado);
    aplicarColores();
}

// ============================================
// ABRIR MODAL DE EDICIÓN
// ============================================
function abrirModalEdicion(idProducto) {
    // Mostrar el modal
    document.getElementById("modal").style.display = "flex";

    // Obtener datos del producto desde el backend
    fetch(`/api/inventario/producto/${idProducto}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const prod = data.data;

                // Llenar campos del modal - SOLO PRODUCTO
                document.getElementById("prod-id").value = prod.idProducto;
                document.getElementById("prod-nombre").value = prod.nombre;
                document.getElementById("prod-precio").value = prod.precio;
                document.getElementById("prod-categoria").value = prod.categoria;
                document.getElementById("prod-descripcion").value = prod.descripcion;
                document.getElementById("prod-estado").value = prod.estado;

                // Guardar imagen actual
                document.getElementById("prod-imagen-actual").value = prod.imagen;

                // Mostrar preview de imagen actual
                const previewImg = document.getElementById("preview-imagen-modal");
                if (prod.imagen) {
                    previewImg.src = `/uploads/productos/${prod.imagen}`;
                    previewImg.style.display = "block";
                } else {
                    previewImg.style.display = "none";
                }

                // Limpiar input de archivo y nombre
                document.getElementById("prod-imagen-file").value = "";
                document.getElementById("nombre-archivo-seleccionado").textContent = "";
            } else {
                alert("Error al cargar datos: " + data.message);
                cerrarModal();
            }
        })
        .catch(error => {
            console.error("Error al cargar producto:", error);
            alert("Error de conexión al cargar los datos");
            cerrarModal();
        });
}

// ============================================
// GUARDAR CAMBIOS DEL MODAL
// ============================================
function guardarCambios(event) {
    event.preventDefault(); // Prevenir envío normal del formulario

    // Crear FormData para enviar archivos
    const formData = new FormData();

    // Añadir campos del producto
    formData.append("idProducto", document.getElementById("prod-id").value);
    formData.append("nombre", document.getElementById("prod-nombre").value);
    formData.append("precio", document.getElementById("prod-precio").value);
    formData.append("categoria", document.getElementById("prod-categoria").value);
    formData.append("descripcion", document.getElementById("prod-descripcion").value);
    formData.append("estado", document.getElementById("prod-estado").value);

    // Añadir archivo de imagen si se seleccionó uno nuevo
    const imagenFile = document.getElementById("prod-imagen-file").files[0];
    if (imagenFile) {
        formData.append("imagenFile", imagenFile);
    }

    // Enviar datos al backend
    fetch('/api/inventario/actualizar-con-imagen', {
        method: 'POST',
        body: formData // NO incluir Content-Type, el navegador lo hace automáticamente
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("✅ Producto actualizado correctamente");
                cerrarModal();
                cargarInventario(); // Recargar tabla
            } else {
                alert("❌ Error al actualizar: " + data.message);
            }
        })
        .catch(error => {
            console.error("Error al actualizar:", error);
            alert("❌ Error de conexión al actualizar");
        });
}

// ============================================
// VALIDAR FORMULARIO
// ============================================
function validarFormulario(datos) {
    // Verificar campos obligatorios - SOLO PRODUCTO
    return datos.nombre &&
        datos.precio &&
        datos.categoria &&
        datos.descripcion &&
        datos.estado;
}

// ============================================
// CERRAR MODAL
// ============================================
function cerrarModal() {
    document.getElementById("modal").style.display = "none";
    // Limpiar formulario
    document.getElementById("form-editar-inventario").reset();
}

// ============================================
// FORMATEAR FECHA (de YYYY-MM-DD a DD/MM/YYYY)
// ============================================
function formatearFecha(fecha) {
    if (!fecha) return "No especificada";

    // Si la fecha ya viene en formato array [YYYY, M, D]
    if (Array.isArray(fecha)) {
        const [anio, mes, dia] = fecha;
        return `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${anio}`;
    }

    // Si la fecha viene en formato string "YYYY-MM-DD"
    const partes = fecha.split("-");
    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    return fecha;
}

// ============================================
// MOSTRAR MENSAJE DE ERROR
// ============================================
function mostrarError(mensaje) {
    const tbody = document.getElementById("tabla-inventario-body");
    tbody.innerHTML = `
        <tr>
            <td colspan="7" style="text-align: center; padding: 40px; color: #c62828;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 10px; display: block;"></i>
                ${mensaje}
            </td>
        </tr>
    `;
}

// ============================================
// EVENTOS AL CARGAR LA PÁGINA
// ============================================
window.addEventListener("DOMContentLoaded", function() {
    // Cargar inventario al iniciar
    cargarInventario();

    // Agregar evento al formulario de edición
    const formEditar = document.getElementById("form-editar-inventario");
    if (formEditar) {
        formEditar.addEventListener("submit", guardarCambios);
    }

    // Cerrar modal al hacer clic fuera de él
    const modal = document.getElementById("modal");
    if (modal) {
        modal.addEventListener("click", function(e) {
            if (e.target === modal) {
                cerrarModal();
            }
        });
    }
});

// ============================================
// OBTENER CLASE CSS SEGÚN ESTADO
// ============================================
function obtenerClaseEstado(estado) {
    // Convertir estado a minúsculas para comparación
    const estadoLower = (estado || '').toLowerCase();

    if (estadoLower === 'disponible') return 'disponible';
    if (estadoLower === 'descontinuado') return 'descontinuado';
    if (estadoLower === 'agotado') return 'agotado';

    // Por defecto
    return 'disponible';
}

// ============================================
// FORMATEAR NOMBRE DEL ESTADO
// ============================================
function formatearEstado(estado) {
    // Mapear estado a texto legible
    const estadoLower = (estado || '').toLowerCase();

    if (estadoLower === 'disponible') return 'Disponible';
    if (estadoLower === 'descontinuado') return 'Descontinuado';
    if (estadoLower === 'agotado') return 'Agotado';

    // Por defecto
    return 'Disponible';
}

// ============================================
// OBTENER ID DEL PRODUCTO
// ============================================
function obtenerIdProducto(inv) {
    // El DTO tiene el ID como 'idProducto'
    return inv.idProducto || 0;
}

// ============================================
// PREVIEW DE IMAGEN EN EL MODAL
// ============================================
document.addEventListener("DOMContentLoaded", function() {
    const inputImagen = document.getElementById("prod-imagen-file");
    const previewImagen = document.getElementById("preview-imagen-modal");
    const nombreArchivo = document.getElementById("nombre-archivo-seleccionado");

    if (inputImagen) {
        inputImagen.addEventListener("change", function(e) {
            const file = e.target.files[0];

            if (file) {
                // Mostrar nombre del archivo seleccionado
                nombreArchivo.textContent = file.name;

                // Crear preview de la nueva imagen
                const reader = new FileReader();
                reader.onload = function(event) {
                    previewImagen.src = event.target.result;
                    previewImagen.style.display = "block";
                };
                reader.readAsDataURL(file);
            } else {
                // Si se cancela la selección, restaurar imagen actual
                nombreArchivo.textContent = "";
                const imagenActual = document.getElementById("prod-imagen-actual").value;
                if (imagenActual) {
                    previewImagen.src = `/uploads/productos/${imagenActual}`;
                }
            }
        });
    }
});