// === TOGGLE DEL MENÚ LATERAL ===
const btntoggle = document.querySelector('.toggle-btn');
btntoggle.addEventListener('click', function () {
  document.getElementById('sidebar').classList.toggle('active');
});


document.addEventListener("DOMContentLoaded", () => {
  cargarPedidosAsignados();
});

function cargarPedidosAsignados() {
  fetch("PHP/conductor_panel.php")
    .then(response => response.json())
    .then(data => {
      const tbody = document.querySelector("#tabla-pedidos_asignados tbody");
      tbody.innerHTML = "";

      if (data.success && data.data.length > 0) {
        data.data.forEach(pedido => {
          const fila = document.createElement("tr");

          // Determinar los botones según estado
          let botones = "";

          if (pedido.ESTADO === 'ASIGNADO') {
            botones = `
              <button onclick="marcarEnCamino(${pedido.ID_PEDIDOS})">Entregar</button>
              <button onclick="rechazarPedido(${pedido.ID_PEDIDOS})">Rechazar</button>
            `;
          } else if (pedido.ESTADO === 'EN CAMINO') {
            const direccion = encodeURIComponent(pedido.DIRECCION);
            botones = `
              <button onclick="window.open('mapa_conductor.html?direccion=${direccion}', '_blank')">Ver ruta</button>
              <button onclick="marcarEntregado(${pedido.ID_PEDIDOS})">Entregado</button>
            `;
          } else if (pedido.ESTADO === 'ENTREGADO') {
            botones = `<span style="color: green; font-weight: bold;">✔ Entregado</span>`;
          }
           
            // 🔹 Estado con estilo
          let estadoHTML = '';
          switch (pedido.ESTADO) {
            case 'ASIGNADO':
              estadoHTML = '<span style="color: blue; font-weight: bold;">📦 ASIGNADO</span>';
              break;
            case 'EN CAMINO':
              estadoHTML = '<span style="color: orange; font-weight: bold;">🚚 EN CAMINO</span>';
              break;
            case 'ENTREGADO':
              estadoHTML = '<span style="color: green; font-weight: bold;">✔ ENTREGADO</span>';
              break;
            default:
              estadoHTML = pedido.ESTADO;
          }


          fila.innerHTML = `
            <td>${pedido.ID_PEDIDOS}</td>
            <td>${pedido.nombre_cliente} ${pedido.apellido_cliente}</td>
            <td>${pedido.TELEFONO}</td>
            <td>${pedido.DIRECCION}</td>
            <td>${pedido.productos}</td>
            <td>${estadoHTML}</td>
            <td>${botones}</td>
          `;
          tbody.appendChild(fila);
        });
      } else {
        const fila = document.createElement("tr");
        fila.innerHTML = `<td colspan="7">No hay pedidos asignados.</td>`;
        tbody.appendChild(fila);
      }
    })
    .catch(error => {
      console.error("❌ Error al cargar pedidos:", error);
    });
}

// Actualizar estado del pedido a EN CAMINO
function marcarEnCamino(idPedido) {
  fetch('PHP/actualizar_estado_pedido.php', {
    method: 'POST',
    body: new URLSearchParams({
      id_pedido: idPedido,
      estado: 'EN CAMINO'
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        // Vuelve a cargar la tabla actualizada
        cargarPedidosAsignados();
      } else {
        alert("❌ Error al actualizar el estado");
      }
    })
    .catch(err => {
      console.error("❌ Error:", err);
    });
}

// Simulación de función rechazar
function rechazarPedido(idPedido) {
  // AQUI podés hacer algo similar a marcarEnCamino pero con estado RECHAZADO si lo necesitás
  alert("🔴 Función rechazar aún no implementada");
}

// Simulación de función ver ruta
function verRuta(idPedido) {
  alert(`🗺️ Mostrando ruta para el pedido #${idPedido}`);
}

     /*actualizar el estado a entregado*/
function marcarEntregado(idPedido) {
  fetch('PHP/actualizar_estado_pedido.php', {
    method: 'POST',
    body: new URLSearchParams({
      id_pedido: idPedido,
      estado: 'ENTREGADO'
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("✅ Pedido marcado como ENTREGADO.");
        cargarPedidosAsignados();
      } else {
        alert("❌ Error al actualizar a ENTREGADO");
      }
    })
    .catch(err => {
      console.error("❌ Error:", err);
    });
}



    // Mostrar historial de pedidos
 function MostrarHistorial() {
  document.addEventListener("DOMContentLoaded", () => {
    fetch("PHP/historial_pedidos_conductor.php")
      .then(response => response.json())
      .then(data => {
        const tbody = document.querySelector("#tabla-pedidos tbody");
        tbody.innerHTML = "";

        if (data.success && data.data.length > 0) {
          data.data.forEach(pedido => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
              <tr>
                <td>${pedido.ID_PEDIDOS}</td>
                <td>${pedido.nombre_usuario}</td>
                <td>${pedido.productos}</td>
                <td>${pedido.DIRECCION}</td>
                <td>$${pedido.TOTAL}</td>
                <td>${pedido.ESTADO}</td>
                <td>${pedido.FECHA_CREACION}</td>
              </tr>
            `;
            tbody.appendChild(fila);
          });
        } else {
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

MostrarHistorial();

function verRuta(pedidoId) {
    alert("Aquí se mostraría la ruta del pedido " + pedidoId); // Puedes reemplazarlo por una ventana modal con mapa si deseas.
}

  

  MostrarHistorial();
/*FILTROS DE BUSQUEDA PEDIDOS CONDUCTOR*/
document.addEventListener("DOMContentLoaded", function () {
  const inputBuscar = document.getElementById("buscar-conductor");
  const form = document.getElementById("form-busqueda-conductor");
  const tbody = document.querySelector("#tabla-pedidos_asignados tbody");

  function buscarPedidos(valor) {
    const texto = valor.trim();
    if (texto === "") {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center;">⚠️ Escriba algo para buscar</td>
        </tr>`;
      return;
    }

    const formData = new FormData();
    formData.append("buscar", texto);

    fetch("PHP/buscar_pedidos_conductor.php", {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(response => {
        const data = response.data || [];
        tbody.innerHTML = "";

        if (data.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="7" style="text-align: center;">❌ No se encontraron resultados</td>
            </tr>`;
          return;
        }

        data.forEach(pedido => {
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
            botones = `<span style="color: green;">✔ Entregado</span>`;
          }

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
          tbody.innerHTML += fila;
        });
      })
      .catch(error => {
        console.error("❌ Error al buscar pedidos:", error);
        tbody.innerHTML = `<tr><td colspan="7">❌ Error al buscar los pedidos.</td></tr>`;
      });
  }

  // Buscar mientras escribe
  inputBuscar.addEventListener("keyup", () => {
    buscarPedidos(inputBuscar.value);
  });

  // Evitar envío de formulario
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    buscarPedidos(inputBuscar.value);
  });
});



/*FILTROS DE BUSQUEDA HISTORIAL DE PEDIDOS*/
document.addEventListener("DOMContentLoaded", function () {
  const inputBuscar = document.getElementById("buscar-historial");
  const form = document.getElementById("form-busqueda-historial");
  const tbody = document.querySelector("#tabla-pedidos tbody");

  function buscarHistorial(valor) {
    const texto = valor.trim();
    if (texto === "") {
      MostrarHistorial(); // Recargar toda la tabla si no se escribe nada
      return;
    }

    const formData = new FormData();
    formData.append("buscar", texto);

    fetch("PHP/buscar_historial_pedido.php", {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(res => {
        const { success, data } = res;
        tbody.innerHTML = "";

        if (!success || data.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="7" style="text-align: center;">❌ No se encontraron resultados</td>
            </tr>`;
          return;
        }

        data.forEach(pedido => {
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

  inputBuscar.addEventListener("keyup", () => {
    buscarHistorial(inputBuscar.value);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    buscarHistorial(inputBuscar.value);
  });
});

/*panel de conductor foto*/


document.addEventListener("DOMContentLoaded", () => {
  const avatarImg = document.getElementById("avatar-imagen");
  const avatarIniciales = document.getElementById("avatar-iniciales");
  const inputFoto = document.getElementById("input-foto");

  // Mostrar imagen o iniciales
  fetch("PHP/obtener_foto.php")
    .then(res => res.json())
    .then(data => {
      if (data.success && data.ruta) {
        avatarImg.src = data.ruta;
        avatarImg.style.display = "block";
        avatarIniciales.style.display = "none";
      } else {
        const iniciales = data.iniciales || "AD";
        avatarIniciales.textContent = iniciales;
        avatarImg.style.display = "none";
        avatarIniciales.style.display = "flex";
      }
    });

  // Subir imagen
  inputFoto.addEventListener("change", () => {
    const archivo = inputFoto.files[0];
    if (!archivo) return;

    const formData = new FormData();
    formData.append("foto", archivo);

    fetch("PHP/subir_foto.php", {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(data => {
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

document.getElementById("cerrar-sesion").addEventListener("click", function (e) {
  e.preventDefault();

  // 🔴 Limpiar localStorage
  localStorage.removeItem("usuario_id");
  localStorage.removeItem("nombre");
  localStorage.removeItem("apellido");
  localStorage.removeItem("rol_id");

  // 🔴 También puedes limpiar todo si prefieres
  // localStorage.clear();

  // 🔁 Redirige al login
  window.location.href = "inicio_secion.html";
});