/* ============================================
   VERIFICACIÓN DE SESIÓN
   Al cargar la página, verifica que el usuario esté logueado
   ============================================ */
fetch('/session', { credentials: 'same-origin' }) // Envía la cookie de sesión
    .then(res => res.json())
    .then(({ usuario_id, rol }) => {
        // Si no hay usuario o rol, redirige al login
        if (!usuario_id || !rol) {
            alert("❌ Sesión no iniciada. Redirigiendo al inicio...");
            window.location.href = '/login';
            return;
        }

        // Muestra información de la sesión en la consola (para desarrollo)
        console.log('ID de sesión:', usuario_id);
        console.log('Rol:', rol);

        // Si el usuario es ADMIN, carga pedidos pendientes
        if (rol === 'ADMIN') {
            cargarPedidosRecientes('PENDIENTE');
        }
    })
    .catch(error => {
        // Si hay error al verificar la sesión, redirige al login
        console.error("Error al obtener sesión:", error);
        window.location.href = '/login';
    });

/* ============================================
   MENÚ LATERAL - BOTÓN HAMBURGUESA
   Permite abrir/cerrar el menú en dispositivos móviles
   ============================================ */
const btntoggle = document.querySelector('.toggle-btn');
btntoggle.addEventListener('click', function () {
    // Alterna la clase 'active' para mostrar/ocultar el menú
    const sidebar = document.getElementById('sidebar');
    const isExpanded = this.getAttribute('aria-expanded') === 'true';

    // Si está abierto, lo cierra; si está cerrado, lo abre
    sidebar.classList.toggle('active');
    this.setAttribute('aria-expanded', !isExpanded);
});

/* ============================================
   CARGA INICIAL DE DATOS
   Cuando la página termina de cargar, ejecuta estas funciones
   ============================================ */
document.addEventListener("DOMContentLoaded", () => {
    cargarPedidosAsignados();  // Carga los pedidos asignados al conductor
    mostrarHistorial();         // Carga el historial de pedidos
    actualizarContadores();     // Actualiza los números de las tarjetas
});

/* ============================================
   FUNCIÓN: cargarPedidosAsignados()
   Obtiene del servidor los pedidos asignados a este conductor
   y los muestra en la tabla
   ============================================ */
function cargarPedidosAsignados() {
    // Hace una petición al servidor para obtener los pedidos
    fetch("/api/pedido/conductor")
        .then(response => response.json())
        .then(data => {
            // Selecciona el cuerpo de la tabla donde irán los pedidos
            const tbody = document.querySelector("#tabla-pedidos_asignados tbody");
            const mensajeVacio = document.getElementById("mensaje-sin-pedidos");

            // Limpia la tabla antes de llenarla
            tbody.innerHTML = "";

            // Verifica si hay pedidos para mostrar
            if (data.success && data.data.length > 0) {
                // Oculta el mensaje de "sin pedidos" y muestra la tabla
                if (mensajeVacio) mensajeVacio.style.display = "none";
                tbody.parentElement.parentElement.style.display = "table";

                // Recorre cada pedido y crea una fila en la tabla
                data.data.forEach(pedido => {
                    const fila = document.createElement("tr");

                    // Determina qué botones mostrar según el estado del pedido
                    let botones = "";

                    if (pedido.estado === 'ASIGNADO') {
                        // Si está asignado, puede entregar o rechazar
                        botones = `
                            <button class="btn-accion btn-entregado" onclick="marcarEnCamino(${pedido.idPedidos})">
                                <i class="fas fa-truck"></i> Entregar
                            </button>
                            <button class="btn-accion btn-cancelar" onclick="rechazarPedido(${pedido.idPedidos})">
                                <i class="fas fa-times"></i> Rechazar
                            </button>
                        `;
                    } else if (pedido.estado === 'EN_CAMINO') {
                        // Si está en camino, puede ver la ruta y marcar como entregado
                        const direccion = encodeURIComponent(pedido.direccion);
                        botones = `
                            <button class="btn-accion" onclick="window.open('mapa_conductor?direccion=${direccion}', '_blank')">
                                <i class="fas fa-map"></i> Ver ruta
                            </button>
                            <button class="btn-accion btn-entregado" onclick="marcarEntregado(${pedido.idPedidos})">
                                <i class="fas fa-check"></i> Entregado
                            </button>
                        `;
                    } else if (pedido.estado === 'ENTREGADO') {
                        // Si ya está entregado, solo muestra el estado
                        botones = `<span style="color: green; font-weight: bold;">✓ Entregado</span>`;
                    }

                    // Crea el HTML del estado con colores e iconos
                    let estadoHTML = '';
                    switch (pedido.estado) {
                        case 'ASIGNADO':
                            estadoHTML = '<span class="estado-asignado">📦 ASIGNADO</span>';
                            break;
                        case 'EN_CAMINO':
                            estadoHTML = '<span class="estado-en-camino">🚚 EN CAMINO</span>';
                            break;
                        case 'ENTREGADO':
                            estadoHTML = '<span class="estado-entregado">✓ ENTREGADO</span>';
                            break;
                        default:
                            estadoHTML = pedido.estado;
                    }

                    // Construye el HTML completo de la fila
                    fila.innerHTML = `
                        <td>${pedido.idPedidos}</td>
                        <td>${pedido.nombreCliente} ${pedido.apellidoCliente}</td>
                        <td>${pedido.telefono}</td>
                        <td>${pedido.direccion}</td>
                        <td>${pedido.productos}</td>
                        <td>${estadoHTML}</td>
                        <td>${botones}</td>
                    `;

                    // Agrega la fila a la tabla
                    tbody.appendChild(fila);
                });
            } else {
                // Si no hay pedidos, muestra el mensaje correspondiente
                tbody.parentElement.parentElement.style.display = "none";
                if (mensajeVacio) mensajeVacio.style.display = "block";
            }

            // Actualiza los contadores después de cargar los pedidos
            actualizarContadores();
        })
        .catch(error => {
            console.error("❌ Error al cargar pedidos:", error);
            alert("Error al cargar los pedidos. Por favor, recarga la página.");
        });
}

/* ============================================
   FUNCIÓN: marcarEnCamino()
   Cambia el estado del pedido a "EN_CAMINO"
   ============================================ */
function marcarEnCamino(idPedido) {
    // Envía la petición al servidor para actualizar el estado
    fetch('/api/pedido/actualizar-estado-conductor', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            idPedido: idPedido,
            estado: 'EN_CAMINO'
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                // Si fue exitoso, muestra un mensaje y recarga la tabla
                alert("✓ Pedido marcado como EN CAMINO");
                cargarPedidosAsignados();
            } else {
                alert("❌ Error al actualizar el estado");
            }
        })
        .catch(err => {
            console.error("❌ Error:", err);
            alert("Error al conectar con el servidor");
        });
}

/* ============================================
   FUNCIÓN: rechazarPedido()
   Permite al conductor rechazar un pedido
   ============================================ */
function rechazarPedido(idPedido) {
    // Pide confirmación antes de rechazar
    if (confirm("¿Está seguro de que desea rechazar este pedido?")) {
        // TODO: Implementar la lógica de rechazo en el backend
        alert("🔴 Función rechazar aún no implementada completamente");

        // Aquí iría el código para enviar la petición al servidor:
        /*
        fetch('/api/pedido/rechazar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idPedido: idPedido })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("Pedido rechazado");
                cargarPedidosAsignados();
            }
        });
        */
    }
}

/* ============================================
   FUNCIÓN: marcarEntregado()
   Cambia el estado del pedido a "ENTREGADO"
   ============================================ */
function marcarEntregado(idPedido) {
    // Pide confirmación antes de marcar como entregado
    if (!confirm("¿Confirma que este pedido ha sido entregado?")) {
        return; // Si cancela, no hace nada
    }

    // Envía la petición al servidor
    fetch('/api/pedido/actualizar-estado-conductor', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            idPedido: idPedido,
            estado: 'ENTREGADO'
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("✅ Pedido marcado como ENTREGADO.");
                cargarPedidosAsignados(); // Recarga la tabla
                mostrarHistorial();       // Actualiza el historial
            } else {
                alert("❌ Error al actualizar a ENTREGADO");
            }
        })
        .catch(err => {
            console.error("❌ Error:", err);
            alert("Error al conectar con el servidor");
        });
}

/* ============================================
   FUNCIÓN: mostrarHistorial()
   Carga y muestra el historial de pedidos completados
   ============================================ */
function mostrarHistorial() {
    // Hace la petición al servidor
    fetch("/api/pedido/conductor/historial")
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector("#tabla-pedidos tbody");
            const mensajeVacio = document.getElementById("mensaje-sin-historial");

            // Limpia la tabla
            tbody.innerHTML = "";

            // Verifica si hay datos para mostrar
            if (data.success && data.data.length > 0) {
                // Oculta el mensaje de "sin historial" y muestra la tabla
                if (mensajeVacio) mensajeVacio.style.display = "none";
                tbody.parentElement.parentElement.style.display = "table";

                // Recorre cada pedido del historial
                data.data.forEach(pedido => {
                    const fila = document.createElement("tr");

                    // Crea el HTML del estado con estilos
                    let estadoHTML = `<span class="estado-${pedido.estado.toLowerCase()}">${pedido.estado}</span>`;

                    // Construye la fila
                    fila.innerHTML = `
                        <td>${pedido.idPedido}</td>
                        <td>${pedido.nombreUsuario}</td>
                        <td>${pedido.productos}</td>
                        <td>${pedido.direccion}</td>
                        <td>${pedido.totalFormateado}</td>
                        <td>${estadoHTML}</td>
                        <td>${pedido.fechaCreacion}</td>
                    `;

                    tbody.appendChild(fila);
                });
            } else {
                // Si no hay historial, muestra el mensaje
                tbody.parentElement.parentElement.style.display = "none";
                if (mensajeVacio) mensajeVacio.style.display = "block";
            }
        })
        .catch(error => {
            console.error("❌ Error al cargar historial:", error);
        });
}

/* ============================================
   FUNCIÓN: actualizarContadores()
   Actualiza los números de las tarjetas del dashboard
   ============================================ */
function actualizarContadores() {
    // Obtiene las filas de la tabla de pedidos asignados
    const filas = document.querySelectorAll("#tabla-pedidos_asignados tbody tr");
    let totalAsignados = filas.length;
    let totalPendientes = 0;

    // Cuenta cuántos pedidos están pendientes (ASIGNADO o EN_CAMINO)
    filas.forEach(fila => {
        const estadoTexto = fila.querySelector('td:nth-child(6)').textContent;
        if (estadoTexto.includes('ASIGNADO') || estadoTexto.includes('EN CAMINO')) {
            totalPendientes++;
        }
    });

    // Actualiza los contadores en el HTML
    const contadorAsignados = document.getElementById('totalAsignados');
    const contadorPendientes = document.getElementById('totalPendientes');

    if (contadorAsignados) contadorAsignados.textContent = totalAsignados;
    if (contadorPendientes) contadorPendientes.textContent = totalPendientes;
}

/* ============================================
   BÚSQUEDA EN PEDIDOS ASIGNADOS
   Filtra los pedidos mientras el usuario escribe
   ============================================ */
document.addEventListener("DOMContentLoaded", function () {
    const inputBuscar = document.getElementById("buscar-conductor");
    const form = document.getElementById("form-busqueda-conductor");
    const tbody = document.querySelector("#tabla-pedidos_asignados tbody");

    // Función que realiza la búsqueda
    function buscarPedidos(valor) {
        const texto = valor.trim().toLowerCase();

        // Si no hay texto, recarga todos los pedidos
        if (texto === "") {
            cargarPedidosAsignados();
            return;
        }

        // Obtiene todas las filas de la tabla
        const filas = tbody.querySelectorAll("tr");
        let hayResultados = false;

        // Recorre cada fila y verifica si coincide con la búsqueda
        filas.forEach(fila => {
            const contenido = fila.textContent.toLowerCase();

            if (contenido.includes(texto)) {
                fila.style.display = ""; // Muestra la fila
                hayResultados = true;
            } else {
                fila.style.display = "none"; // Oculta la fila
            }
        });

        // Si no hay resultados, muestra un mensaje
        if (!hayResultados && tbody.children.length > 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 20px;">
                        ⚠️ No se encontraron resultados para "${valor}"
                    </td>
                </tr>`;
        }
    }

    // Buscar mientras el usuario escribe
    if (inputBuscar) {
        inputBuscar.addEventListener("keyup", () => {
            buscarPedidos(inputBuscar.value);
        });
    }

    // Evitar que el formulario se envíe (evita recargar la página)
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            buscarPedidos(inputBuscar.value);
        });
    }
});

/* ============================================
   BÚSQUEDA EN HISTORIAL DE PEDIDOS
   Filtra el historial mientras el usuario escribe
   ============================================ */
document.addEventListener("DOMContentLoaded", function () {
    const inputBuscar = document.getElementById("buscar-historial");
    const form = document.getElementById("form-busqueda-historial");
    const tbody = document.querySelector("#tabla-pedidos tbody");

    // Función que realiza la búsqueda en el historial
    function buscarHistorial(valor) {
        const texto = valor.trim().toLowerCase();

        // Si no hay texto, recarga todo el historial
        if (texto === "") {
            mostrarHistorial();
            return;
        }

        // Obtiene todas las filas de la tabla de historial
        const filas = tbody.querySelectorAll("tr");
        let hayResultados = false;

        // Recorre cada fila y verifica si coincide con la búsqueda
        filas.forEach(fila => {
            const contenido = fila.textContent.toLowerCase();

            if (contenido.includes(texto)) {
                fila.style.display = ""; // Muestra la fila
                hayResultados = true;
            } else {
                fila.style.display = "none"; // Oculta la fila
            }
        });

        // Si no hay resultados, muestra un mensaje
        if (!hayResultados && tbody.children.length > 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 20px;">
                        ⚠️ No se encontraron resultados para "${valor}"
                    </td>
                </tr>`;
        }
    }

    // Buscar mientras el usuario escribe
    if (inputBuscar) {
        inputBuscar.addEventListener("keyup", () => {
            buscarHistorial(inputBuscar.value);
        });
    }

    // Evitar que el formulario se envíe
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            buscarHistorial(inputBuscar.value);
        });
    }
});

/* ============================================
   GESTIÓN DE FOTO DE PERFIL
   Permite al conductor subir y mostrar su foto
   ============================================ */
document.addEventListener("DOMContentLoaded", () => {
    const avatarImg = document.getElementById("avatar-imagen");
    const avatarIniciales = document.getElementById("avatar-iniciales");
    const inputFoto = document.getElementById("input-foto");

    // Cargar la foto de perfil del servidor (si existe)
    fetch("PHP/obtener_foto.php")
        .then(res => res.json())
        .then(data => {
            if (data.success && data.ruta) {
                // Si tiene foto, la muestra
                avatarImg.src = data.ruta;
                avatarImg.style.display = "block";
                avatarIniciales.style.display = "none";
            } else {
                // Si no tiene foto, muestra las iniciales
                const iniciales = data.iniciales || "CD";
                avatarIniciales.textContent = iniciales;
                avatarImg.style.display = "none";
                avatarIniciales.style.display = "flex";
            }
        })
        .catch(error => {
            console.error("Error al cargar foto de perfil:", error);
        });

    // Cuando el usuario selecciona una foto nueva
    if (inputFoto) {
        inputFoto.addEventListener("change", () => {
            const archivo = inputFoto.files[0];
            if (!archivo) return;

            // Crea un objeto FormData para enviar el archivo
            const formData = new FormData();
            formData.append("foto", archivo);

            // Envía la foto al servidor
            fetch("PHP/subir_foto.php", {
                method: "POST",
                body: formData
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        // Si se subió correctamente, actualiza la imagen
                        avatarImg.src = data.ruta;
                        avatarImg.style.display = "block";
                        avatarIniciales.style.display = "none";
                        alert("✓ Foto actualizada correctamente");
                    } else {
                        alert("❌ " + data.message);
                    }
                })
                .catch(error => {
                    console.error("Error subiendo imagen:", error);
                    alert("Error al subir la foto");
                });
        });
    }
});

/* ============================================
   CERRAR SESIÓN
   Limpia los datos y redirige al login
   ============================================ */
const btnCerrarSesion = document.getElementById("cerrar_sesion");
if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener("click", function(e) {
        e.preventDefault(); // Evita que el enlace funcione normalmente

        // Pide confirmación antes de cerrar sesión
        if (confirm("¿Está seguro de que desea cerrar sesión?")) {
            localStorage.clear(); // Limpia datos locales del navegador
            window.location.href = "/logout"; // Redirige al endpoint de logout
        }
    });
}