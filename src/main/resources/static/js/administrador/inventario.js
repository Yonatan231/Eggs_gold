// ============================================
// INVENTARIO.JS - GESTIÓN DE INVENTARIO
// ============================================

// ============================================
// VARIABLES GLOBALES
// ============================================
let inventarioCompleto = [];

// ============================================
// CARGAR INVENTARIO DESDE EL BACKEND
// ============================================
function cargarInventario() {
    fetch('/api/inventario/lista')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                inventarioCompleto = data.data;
                mostrarInventario(inventarioCompleto);
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
    tbody.innerHTML = "";

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

    inventarios.forEach(inv => {
        const fila = document.createElement("tr");
        fila.className = "fila-inventario";
        fila.setAttribute("data-estado", inv.estado || "DISPONIBLE");

        const fechaActualizacion = formatearFecha(inv.fechaActualizacion);
        const idProducto = obtenerIdProducto(inv);

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
                    Editar
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
    return inv.idProducto || inv.idInventario || 0;
}

// ============================================
// OBTENER CLASE CSS SEGÚN ESTADO
// ============================================
function obtenerClaseEstado(estado) {
    const estadoLower = (estado || '').toLowerCase();

    if (estadoLower === 'disponible') return 'disponible';
    if (estadoLower === 'descontinuado') return 'descontinuado';
    if (estadoLower === 'agotado') return 'agotado';

    return 'disponible';
}

// ============================================
// FORMATEAR NOMBRE DEL ESTADO
// ============================================
function formatearEstado(estado) {
    const estadoLower = (estado || '').toLowerCase();

    if (estadoLower === 'disponible') return 'Disponible';
    if (estadoLower === 'descontinuado') return 'Descontinuado';
    if (estadoLower === 'agotado') return 'Agotado';

    return 'Disponible';
}

// ============================================
// APLICAR COLORES A LOS BADGES DE CANTIDAD
// ============================================
function aplicarColores() {
    document.querySelectorAll(".fila-inventario").forEach(fila => {
        const td = fila.querySelector(".td-cantidad");
        if (!td) return;

        const badge = td.querySelector(".badge-cantidad");
        if (!badge) return;

        const cantidad = parseInt(badge.innerText);

        badge.classList.remove("roja", "amarilla", "verde");

        if (cantidad < 500) {
            badge.classList.add("roja");
        } else if (cantidad < 1000) {
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
    const texto = document.getElementById("buscar").value.toLowerCase();
    const estadoFiltro = document.getElementById("filtro-estado").value;

    const inventarioFiltrado = inventarioCompleto.filter(inv => {
        const coincideBusqueda = texto === "" ||
            inv.nombre.toLowerCase().includes(texto) ||
            inv.categoria.toLowerCase().includes(texto) ||
            inv.descripcion.toLowerCase().includes(texto);

        const coincideEstado = estadoFiltro === "todos" ||
            (inv.estado && inv.estado.toUpperCase() === estadoFiltro);

        return coincideBusqueda && coincideEstado;
    });

    mostrarInventario(inventarioFiltrado);
    aplicarColores();
}

// ============================================
// ABRIR MODAL DE EDICIÓN
// ============================================
function abrirModalEdicion(idProducto) {
    document.getElementById("modal").style.display = "flex";

    fetch(`/api/inventario/producto/${idProducto}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const prod = data.data;

                document.getElementById("prod-id").value = prod.idProducto;
                document.getElementById("prod-nombre").value = prod.nombre;
                document.getElementById("prod-precio").value = prod.precio;
                document.getElementById("prod-categoria").value = prod.categoria;
                document.getElementById("prod-descripcion").value = prod.descripcion;
                document.getElementById("prod-estado").value = prod.estado;
                document.getElementById("prod-imagen-actual").value = prod.imagen;

                // ✅ CORRECCIÓN: Usar URL completa de Cloudinary
                const previewImg = document.getElementById("preview-imagen-modal");
                if (prod.imagen && prod.imagen !== 'default.jpg') {
                    previewImg.src = prod.imagen; // URL completa de Cloudinary
                    previewImg.style.display = "block";
                } else {
                    previewImg.src = '/imagenes/default.png'; // Imagen por defecto local
                    previewImg.style.display = "block";
                }

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
    event.preventDefault();

    const precio = parseFloat(document.getElementById("prod-precio").value);
    if (precio <= 0) {
        alert("❌ El precio debe ser mayor a 0");
        return;
    }

    const formData = new FormData();
    formData.append("idProducto", document.getElementById("prod-id").value);
    formData.append("nombre", document.getElementById("prod-nombre").value);
    formData.append("precio", precio);
    formData.append("categoria", document.getElementById("prod-categoria").value);
    formData.append("descripcion", document.getElementById("prod-descripcion").value);
    formData.append("estado", document.getElementById("prod-estado").value);

    const imagenFile = document.getElementById("prod-imagen-file").files[0];
    if (imagenFile) {
        formData.append("imagenFile", imagenFile);
    }

    fetch('/api/inventario/actualizar-con-imagen', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("✅ Producto actualizado correctamente");
                cerrarModal();
                cargarInventario();
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
// CERRAR MODAL
// ============================================
function cerrarModal() {
    document.getElementById("modal").style.display = "none";
    document.getElementById("form-editar-inventario").reset();
}

// ============================================
// FORMATEAR FECHA
// ============================================
function formatearFecha(fecha) {
    if (!fecha) return "No especificada";

    if (Array.isArray(fecha)) {
        const [anio, mes, dia] = fecha;
        return `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${anio}`;
    }

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
// PREVIEW DE IMAGEN EN EL MODAL
// ============================================
function configurarPreviewImagen() {
    const inputImagen = document.getElementById("prod-imagen-file");
    const previewImagen = document.getElementById("preview-imagen-modal");
    const nombreArchivo = document.getElementById("nombre-archivo-seleccionado");

    if (inputImagen) {
        inputImagen.addEventListener("change", function(e) {
            const file = e.target.files[0];

            if (file) {
                nombreArchivo.textContent = file.name;

                const reader = new FileReader();
                reader.onload = function(event) {
                    previewImagen.src = event.target.result;
                    previewImagen.style.display = "block";
                };
                reader.readAsDataURL(file);
            } else {
                nombreArchivo.textContent = "";
                // ✅ CORRECCIÓN: Usar URL completa de Cloudinary
                const imagenActual = document.getElementById("prod-imagen-actual").value;
                if (imagenActual && imagenActual !== 'default.jpg') {
                    previewImagen.src = imagenActual; // URL completa de Cloudinary
                } else {
                    previewImagen.src = '/imagenes/default.png'; // Imagen por defecto local
                }
            }
        });
    }
}

// ============================================
// EVENTOS AL CARGAR LA PÁGINA
// ============================================
window.addEventListener("DOMContentLoaded", function() {
    cargarInventario();

    const formEditar = document.getElementById("form-editar-inventario");
    if (formEditar) {
        formEditar.addEventListener("submit", guardarCambios);
    }

    const modal = document.getElementById("modal");
    if (modal) {
        modal.addEventListener("click", function(e) {
            if (e.target === modal) {
                cerrarModal();
            }
        });
    }

    configurarPreviewImagen();
});