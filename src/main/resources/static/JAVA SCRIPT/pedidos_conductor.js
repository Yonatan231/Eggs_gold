// Verifica la sesión del usuario al cargar la página
fetch('/session', { credentials: 'same-origin' }) // envía la cookie JSESSIONID
    .then(res => res.json())
    .then(({ usuario_id, rol }) => {
        // Valida que existan los datos de sesión
        if (!usuario_id || !rol) {
            alert("❌ Sesión no iniciada. Redirigiendo al inicio...");
            window.location.href = '/login'; // endpoint Thymeleaf
            return;
        }

        // Muestra en consola los datos de sesión obtenidos
        console.log('ID de sesión:', usuario_id);
        console.log('Rol:', rol);

        // Si el usuario es administrador, carga los pedidos pendientes
        if (rol === 'ADMIN') {
            cargarPedidosRecientes('PENDIENTE');
        }
    })
    .catch(error => {
        // Maneja errores de conexión y redirige al login
        console.error("Error al obtener sesión:", error);
        window.location.href = '/login';
    });



// === TOGGLE DEL MENÚ LATERAL ===
// Obtiene el botón de toggle del menú lateral
const btntoggle = document.querySelector('.toggle-btn');
// Agrega evento click para mostrar/ocultar el sidebar
btntoggle.addEventListener('click', function () {
    document.getElementById('sidebar').classList.toggle('active');
});


// Espera a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
    // Carga los pedidos asignados al conductor
    cargarPedidosAsignados();
});

// Función que carga los pedidos asignados al conductor desde el servidor
function cargarPedidosAsignados() {
    fetch("/api/pedido/conductor")
        .then(response => response.json())
        .then(data => {
            // Obtiene el cuerpo de la tabla donde se mostrarán los pedidos
            const tbody = document.querySelector("#tabla-pedidos_asignados tbody");
            tbody.innerHTML = "";

            // Verifica si hay pedidos disponibles
            if (data.success && data.data.length > 0) {
                // Itera sobre cada pedido recibido
                data.data.forEach(pedido => {
                    const fila = document.createElement("tr");

                    // Determinar los botones según estado del pedido
                    let botones = "";

                    // Si el pedido está asignado, muestra botones de entregar y rechazar
                    if (pedido.estado === 'ASIGNADO') {
                        botones = `
              <button onclick="marcarEnCamino(${pedido.idPedidos})">Entregar</button>
              <button onclick="rechazarPedido(${pedido.idPedidos})">Rechazar</button>
            `;
                        // Si el pedido está en camino, muestra botones de ver ruta y entregado
                    } else if (pedido.estado === 'EN_CAMINO') {
                        const direccion = encodeURIComponent(pedido.direccion);
                        botones = `
              <button onclick="window.open('mapa_conductor?direccion=${direccion}', '_blank')">Ver ruta</button>
              <button onclick="marcarEntregado(${pedido.idPedidos})">Entregado</button>
            `;
                        // Si el pedido ya fue entregado, muestra un indicador visual
                    } else if (pedido.estado === 'ENTREGADO') {
                        botones = `<span style="color: green; font-weight: bold;">✓ Entregado</span>`;
                    }

                    // 🔹 Estado con estilo visual según el tipo de estado
                    let estadoHTML = '';
                    switch (pedido.estado) {
                        case 'ASIGNADO':
                            estadoHTML = '<span style="color: blue; font-weight: bold;">📦 ASIGNADO</span>';
                            break;
                        case 'EN CAMINO':
                            estadoHTML = '<span style="color: orange; font-weight: bold;">🚚 EN CAMINO</span>';
                            break;
                        case 'ENTREGADO':
                            estadoHTML = '<span style="color: green; font-weight: bold;">✓ ENTREGADO</span>';
                            break;
                        default:
                            estadoHTML = pedido.estado;
                    }

                    // Construye el HTML de la fila con todos los datos del pedido
                    fila.innerHTML = `
            <td>${pedido.idPedidos}</td>
            <td>${pedido.nombreCliente} ${pedido.apellidoCliente}</td>
            <td>${pedido.telefono}</td>
            <td>${pedido.direccion}</td>
            <td>${pedido.productos}</td>
            <td>${estadoHTML}</td>
            <td>${botones}</td>
          `;
                    tbody.appendChild(fila);
                });
            } else {
                // Si no hay pedidos, muestra un mensaje informativo
                const fila = document.createElement("tr");
                fila.innerHTML = `<td colspan="7">No hay pedidos asignados.</td>`;
                tbody.appendChild(fila);
            }
        })
        .catch(error => {
            console.error("❌ Error al cargar pedidos:", error);
        });
}

// Función que actualiza el estado del pedido a EN_CAMINO
function marcarEnCamino(idPedido) {
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
            // Si la actualización es exitosa, recarga la tabla
            if (data.success) {
                cargarPedidosAsignados(); // recarga la tabla
            } else {
                alert("❌ Error al actualizar el estado");
            }
        })
        .catch(err => {
            console.error("❌ Error:", err);
        });
}


// Simulación de función rechazar (no implementada completamente)
function rechazarPedido(idPedido) {
    // AQUI podés hacer algo similar a marcarEnCamino pero con estado RECHAZADO si lo necesitás
    alert("🔴 Función rechazar aún no implementada");
}

// Simulación de función ver ruta
function verRuta(idPedido) {
    alert(`🗺️ Mostrando ruta para el pedido #${idPedido}`);
}

/* Función que actualiza el estado del pedido a ENTREGADO */
function marcarEntregado(idPedido) {
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
            // Si la actualización es exitosa, muestra mensaje y recarga la tabla
            if (data.success) {
                alert("✅ Pedido marcado como ENTREGADO.");
                cargarPedidosAsignados(); // recarga la tabla
            } else {
                alert("❌ Error al actualizar a ENTREGADO");
            }
        })
        .catch(err => {
            console.error("❌ Error:", err);
        });
}



// Función que muestra el historial de pedidos del conductor
function mostrarHistorial() {
    // Espera a que el DOM esté cargado antes de ejecutar
    document.addEventListener("DOMContentLoaded", () => {
        fetch("/api/pedido/conductor/historial") // ← nuevo endpoint en Spring Boot
            .then(response => response.json())
            .then(data => {
                // Obtiene el cuerpo de la tabla de historial
                const tbody = document.querySelector("#tabla-pedidos tbody");
                tbody.innerHTML = "";

                // Verifica si hay datos en el historial
                if (data.success && data.data.length > 0) {
                    // Itera sobre cada pedido del historial
                    data.data.forEach(pedido => {
                        const fila = document.createElement("tr");
                        // Construye la fila con los datos del pedido
                        fila.innerHTML = `
              <td>${pedido.idPedido}</td>
              <td>${pedido.nombreUsuario}</td>
              <td>${pedido.productos}</td>
              <td>${pedido.direccion}</td>
              <td>$${pedido.totalFormateado}</td>
              <td>${pedido.estado}</td>
              <td>${pedido.fechaCreacion}</td>
            `;
                        tbody.appendChild(fila);
                    });
                } else {
                    // Si no hay historial, muestra un mensaje
                    const fila = document.createElement("tr");
                    fila.innerHTML = `<td colspan="7" style="text-align:center;">No hay historial de pedidos.</td>`;
                    tbody.appendChild(fila);
                }
            })
            .catch(error => {
                console.error("❌ Error al cargar historial:", error);
            });
    });
}

// Llama a la función para mostrar el historial
mostrarHistorial();


// Función alternativa para ver ruta (duplicada)
function verRuta(pedidoId) {
    alert("Aquí se mostraría la ruta del pedido " + pedidoId); // Puedes reemplazarlo por una ventana modal con mapa si deseas.
}


// Intento de llamar a función con nombre incorrecto (mayúsculas)
MostrarHistorial();

/*FILTROS DE BUSQUEDA PEDIDOS CONDUCTOR*/
// Implementa funcionalidad de búsqueda para los pedidos del conductor
document.addEventListener("DOMContentLoaded", function () {
    const inputBuscar = document.getElementById("buscar-conductor");
    const form = document.getElementById("form-busqueda-conductor");
    const tbody = document.querySelector("#tabla-pedidos_asignados tbody");

    // Función que realiza la búsqueda de pedidos
    function buscarPedidos(valor) {
        const texto = valor.trim();
        // Si no hay texto, muestra mensaje de advertencia
        if (texto === "") {
            tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center;">⚠️ Escriba algo para buscar</td>
        </tr>`;
            return;
        }

        // Prepara los datos para enviar al servidor
        const formData = new FormData();
        formData.append("buscar", texto);

        // Realiza la petición de búsqueda al servidor PHP
        fetch("PHP/buscar_pedidos_conductor.php", {
            method: "POST",
            body: formData
        })
            .then(res => res.json())
            .then(response => {
                const data = response.data || [];
                tbody.innerHTML = "";

                // Si no hay resultados, muestra mensaje
                if (data.length === 0) {
                    tbody.innerHTML = `
            <tr>
              <td colspan="7" style="text-align: center;">❌ No se encontraron resultados</td>
            </tr>`;
                    return;
                }

                // Itera sobre los resultados encontrados
                data.forEach(pedido => {
                    // Genera los botones según el estado del pedido
                    let botones = "";
                    if (pedido.ESTADO === "ASIGNADO") {
                        botones = `
              <button onclick="marcarEnCamino(${pedido.ID_PEDIDOS})">Entregar</button>
              <button onclick="rechazarPedido(${pedido.ID_PEDIDOS})">Rechazar</button>
            `;
                    } else if (pedido.ESTADO === "EN CAMINO") {
                        const direccion = encodeURIComponent(pedido.DIRECCION);
                        botones = `
              <button onclick="window.open('mapa_conductor.html?direccion=${direccion}', '_blank')">Ver ruta</button>
              <button onclick="marcarEntregado(${pedido.ID_PEDIDOS})">Entregado</button>
            `;
                    } else if (pedido.ESTADO === "ENTREGADO") {
                        botones = `<span style="color: green;">✓ Entregado</span>`;
                    }

                    // Construye el HTML de la fila
                    const fila = `
            <tr>
              <td>${pedido.ID_PEDIDOS}</td>
              <td>${pedido.nombre_cliente} ${pedido.apellido_cliente}</td>
              <td>${pedido.TELEFONO}</td>
              <td>${pedido.DIRECCION}</td>
              <td>${pedido.productos}</td>
              <td>${pedido.ESTADO}</td>
              <td>${botones}</td>
            </tr>`;
                    // Concatena el HTML (usando +=, error de rendimiento)
                    tbody.innerHTML += fila;
                });
            })
            .catch(error => {
                console.error("❌ Error al buscar pedidos:", error);
                tbody.innerHTML = `<tr><td colspan="7">❌ Error al buscar los pedidos.</td></tr>`;
            });
    }

    // Buscar mientras el usuario escribe
    inputBuscar.addEventListener("keyup", () => {
        buscarPedidos(inputBuscar.value);
    });

    // Evitar envío tradicional del formulario
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        buscarPedidos(inputBuscar.value);
    });
});



/*FILTROS DE BUSQUEDA HISTORIAL DE PEDIDOS*/
// Implementa funcionalidad de búsqueda para el historial de pedidos
document.addEventListener("DOMContentLoaded", function () {
    const inputBuscar = document.getElementById("buscar-historial");
    const form = document.getElementById("form-busqueda-historial");
    const tbody = document.querySelector("#tabla-pedidos tbody");

    // Función que busca en el historial de pedidos
    function buscarHistorial(valor) {
        const texto = valor.trim();
        // Si no hay texto, recarga toda la tabla
        if (texto === "") {
            MostrarHistorial(); // Recargar toda la tabla si no se escribe nada
            return;
        }

        // Prepara los datos para la búsqueda
        const formData = new FormData();
        formData.append("buscar", texto);

        // Realiza la petición al servidor PHP
        fetch("PHP/buscar_historial_pedido.php", {
            method: "POST",
            body: formData
        })
            .then(res => res.json())
            .then(res => {
                const { success, data } = res;
                tbody.innerHTML = "";

                // Si no hay resultados, muestra mensaje
                if (!success || data.length === 0) {
                    tbody.innerHTML = `
            <tr>
              <td colspan="7" style="text-align: center;">❌ No se encontraron resultados</td>
            </tr>`;
                    return;
                }

                // Itera sobre los resultados del historial
                data.forEach(pedido => {
                    // Construye la fila con los datos del pedido
                    const fila = `
            <tr>
              <td>${pedido.ID_PEDIDOS}</td>
              <td>${pedido.nombre_usuario}</td>
              <td>${pedido.productos}</td>
              <td>${pedido.DIRECCION}</td>
              <td>$${new Intl.NumberFormat('es-CO').format(pedido.TOTAL)}</td>
              <td>${pedido.ESTADO}</td>
              <td>${pedido.FECHA_CREACION}</td>
            </tr>`;
                    // Concatena el HTML (usando +=, error de rendimiento)
                    tbody.innerHTML += fila;
                });
            })
            .catch(error => {
                console.error("❌ Error:", error);
                tbody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align: center;">⚠️ Error al cargar los datos</td>
          </tr>`;
            });
    }

    // Buscar mientras el usuario escribe
    inputBuscar.addEventListener("keyup", () => {
        buscarHistorial(inputBuscar.value);
    });

    // Evitar envío tradicional del formulario
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        buscarHistorial(inputBuscar.value);
    });
});

/*panel de conductor foto*/
// Implementa la funcionalidad de avatar del conductor (foto o iniciales)
document.addEventListener("DOMContentLoaded", () => {
    const avatarImg = document.getElementById("avatar-imagen");
    const avatarIniciales = document.getElementById("avatar-iniciales");
    const inputFoto = document.getElementById("input-foto");

    // Obtener y mostrar imagen o iniciales del conductor
    fetch("PHP/obtener_foto.php")
        .then(res => res.json())
        .then(data => {
            // Si existe una foto, la muestra
            if (data.success && data.ruta) {
                avatarImg.src = data.ruta;
                avatarImg.style.display = "block";
                avatarIniciales.style.display = "none";
            } else {
                // Si no hay foto, muestra las iniciales
                const iniciales = data.iniciales || "AD";
                avatarIniciales.textContent = iniciales;
                avatarImg.style.display = "none";
                avatarIniciales.style.display = "flex";
            }
        });

    // Subir nueva imagen de perfil
    inputFoto.addEventListener("change", () => {
        const archivo = inputFoto.files[0];
        if (!archivo) return;

        // Prepara el archivo para enviar
        const formData = new FormData();
        formData.append("foto", archivo);

        // Envía la foto al servidor
        fetch("PHP/subir_foto.php", {
            method: "POST",
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                // Si la carga es exitosa, actualiza el avatar
                if (data.success) {
                    avatarImg.src = data.ruta;
                    avatarImg.style.display = "block";
                    avatarIniciales.style.display = "none";
                } else {
                    alert("❌ " + data.message);
                }
            })
            .catch(error => {
                console.error("Error subiendo imagen:", error);
            });
    });
});

/*cerrar sesion*/
// Implementa la funcionalidad de cierre de sesión
document.getElementById("cerrar_sesion").addEventListener("click", function(e) {
    e.preventDefault();
    localStorage.clear(); // limpia datos locales
    window.location.href = "/logout"; // llama al endpoint de Spring
});

/*
 * COMENTARIO GENERAL
 * 
 * ¿Qué hace el código?
 * Este código implementa el panel de control para conductores de un sistema de entregas con las siguientes funcionalidades:
 * 1. Verificación de sesión de usuario con validación de roles
 * 2. Gestión de pedidos asignados al conductor (visualización, actualización de estados)
 * 3. Sistema de estados de pedidos: ASIGNADO → EN_CAMINO → ENTREGADO
 * 4. Historial completo de entregas realizadas
 * 5. Filtros de búsqueda en tiempo real para pedidos y historial
 * 6. Sistema de avatar con foto de perfil o iniciales
 * 7. Toggle para menú lateral
 * 8. Integración con mapas para visualizar rutas de entrega
 * 9. Cierre de sesión con limpieza de datos locales
 * 
 * ERRORES ENCONTRADOS:
 * 1. Múltiples listeners DOMContentLoaded: Hay 5 diferentes que pueden causar
 *    ejecuciones duplicadas y conflictos entre funciones.
 * 
 * 2. innerHTML += en bucles: Se usa en las funciones de búsqueda, causando
 *    re-renderizado completo del DOM en cada iteración y pérdida de rendimiento.
 * 
 * 3. Función verRuta() duplicada: Hay dos definiciones de la misma función con
 *    diferentes implementaciones.
 * 
 * 4. Error de capitalización: Se llama a MostrarHistorial() (con mayúscula) pero
 *    la función se define como mostrarHistorial() (minúscula), causará error.
 * 
 * 5. mostrarHistorial() con DOMContentLoaded interno: La función define su propio
 *    listener DOMContentLoaded dentro, lo cual es incorrecto ya que se ejecuta
 *    después de que el DOM ya está cargado.
 * 
 * 6. Función cargarPedidosRecientes() no definida: Se invoca en la verificación
 *    de sesión para ADMIN pero no existe en el código.
 * 
 * 7. Inconsistencia en nombres de propiedades: Se usan tanto idPedidos como
 *    ID_PEDIDOS, estado como ESTADO, etc.
 * 
 * 8. rechazarPedido() no implementada: La función existe pero solo muestra un alert
 *    sin realizar ninguna acción real.
 * 
 * 9. Mezcla de tecnologías: Usa endpoints de Spring Boot (/api/pedido/) mezclados
 *    con scripts PHP (buscar_pedidos_conductor.php), creando inconsistencia.
 * 
 * 10. Vulnerabilidad XSS: Los datos se insertan directamente sin sanitización.
 * 
 * 11. Sin validación de elementos DOM: No verifica si btntoggle existe antes de
 *     agregar el event listener, causará error si el elemento no existe.
 * 
 * 12. Falta manejo de errores HTTP: No valida response.ok antes de parsear JSON.
 * 
 * MEJORAS SUGERIDAS:
 * 1. Consolidar todos los DOMContentLoaded en uno solo para evitar duplicaciones
 * 2. Usar createElement() o insertAdjacentHTML() en lugar de innerHTML +=
 * 3. Eliminar funciones duplicadas y mantener una sola versión
 * 4. Corregir nombres de funciones para que coincidan (case-sensitive)
 * 5. Eliminar el DOMContentLoaded interno de mostrarHistorial()
 * 6. Normalizar nombres de propiedades en todo el código (usar camelCase consistente)
 * 7. Implementar completamente la función rechazarPedido()
 * 8. Decidir entre Spring Boot o PHP y mantener consistencia en la arquitectura
 * 9. Sanitizar todos los datos antes de insertarlos en el DOM
 * 10. Agregar validación de existencia de elementos antes de usarlos
 * 11. Implementar debouncing en los filtros de búsqueda para mejorar rendimiento
 * 12. Agregar estados de carga (spinners) durante las peticiones
 * 13. Usar async/await en lugar de .then() para mejor legibilidad
 * 14. Implementar manejo de errores más robusto y mensajes amigables
 * 15. Crear funciones reutilizables para generación de filas HTML
 * 16. Agregar confirmación antes de cambiar estados de pedidos críticos
 * 17. Implementar sistema de notificaciones para nuevos pedidos asignados
 * 18. Validar formato y tamaño de imágenes antes de subirlas
 * 19. Agregar validación de response.ok en todas las peticiones fetch
 * 20. Separar la lógica en módulos más pequeños y reutilizables
 */