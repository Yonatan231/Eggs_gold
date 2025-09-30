// === OBTENER USUARIO DE LA SESIÓN ===
fetch('PHP/obtener_usuario_sesión.php')
  .then(res => res.json())
  .then(({ usuario_id, rol_id }) => {
    console.log('ID de sesión:', usuario_id);
    console.log('Rol:', rol_id);

    if (rol_id == 1) {
      cargarPedidosRecientes('PENDIENTE');
    } else if (rol_id == 3) {
      cargarPedidosRecientes('APROBADO');
    }
  });

// === TOGGLE DEL MENÚ LATERAL ===
const btntoggle = document.querySelector('.toggle-btn');
btntoggle.addEventListener('click', function () {
  document.getElementById('sidebar').classList.toggle('active');
});

// === AGREGAR AL CARRITO ===
const cartItems = document.querySelector('.cart-items');
const totalElement = document.querySelector('.total');
let total = 0;

document.querySelectorAll('.add-to-cart').forEach(button => {
  button.addEventListener('click', () => {
    const productName = button.dataset.product;
    const productPrice = parseFloat(button.dataset.price);

    const li = document.createElement('li');
    li.textContent = `${productName} - $${productPrice}`;
    cartItems.appendChild(li);

    total += productPrice;
    totalElement.textContent = `Total: $${total}`;
  });
});

// === FUNCIÓN: CARGAR PEDIDOS POR ESTADO ===
function cargarPedidosRecientes(estado = '') {
  fetch('PHP/mostrar_pedido.php', {
    method: 'POST',
    body: new URLSearchParams({ estado })
  })
    .then(response => response.json())
    .then(data => {
      const tbody = document.querySelector('#tabla-pedidos tbody');
      tbody.innerHTML = "";

      const pedidos = data.pedidos;
      const rol = data.rol;

      if (pedidos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9">No hay pedidos para mostrar.</td></tr>';
        return;
      }

      pedidos.forEach(p => {
        const fila = document.createElement('tr');

        // Acción según el rol y estado
        const tdAccion = document.createElement('td');
        if (rol == 3 && p.ESTADO === 'APROBADO') {
          tdAccion.innerHTML = `<button onclick="asignarPedido(${p.ID_PEDIDOS})">Asignar</button>`;
        } else if (rol == 3 && p.ESTADO === 'ASIGNADO') {
          tdAccion.innerHTML = `<span style="color: green; font-weight: bold;">✔ ASIGNADO</span>`;
        } else if (rol == 3 && p.ESTADO === 'EN CAMINO') {
          tdAccion.innerHTML = `<span style="color: green; font-weight: bold;">✔ EN CAMINO</span>`;
        } else {
          tdAccion.innerHTML = "—";
        }

        // Fila con los datos del pedido
        fila.innerHTML = `
          <td>${p.ID_PEDIDOS}</td>
          <td>${p.nombre_usuario}</td>
          <td colspan="2">${p.productos}</td> <!-- ✅ nombre + cantidad en un solo campo -->
          <td>${p.DIRECCION}</td>
          <td>${p.ESTADO}</td>
          <td>${p.FECHA_CREACION}</td>
          <td>$${p.TOTAL}</td>
        `;

        fila.appendChild(tdAccion);
        tbody.appendChild(fila);
      });
    })
    .catch(error => {
      console.error('❌ Error al cargar pedidos:', error);
      document.querySelector('#tabla-pedidos tbody').innerHTML = '<tr><td colspan="9">Error al cargar los pedidos.</td></tr>';
    });
}


// === MOSTRAR PRODUCTOS EN TABLA ===
function cargarInventario(busqueda = "") {
  fetch("http://localhost:8080/inventario/mostrarProducto")
    .then(res => res.json())
    .then(data => {
      const tabla = document.querySelector('#tabla-productos tbody');
      tabla.innerHTML = '';

      if (data.success && data.data.length > 0) {
        // Si hay búsqueda, filtramos
        const inventarioFiltrado = busqueda
          ? data.data.filter(item =>
              Object.values(item).some(valor =>
                String(valor).toLowerCase().includes(busqueda.toLowerCase())
              )
            )
          : data.data;

        if (inventarioFiltrado.length === 0) {
          tabla.innerHTML = `<tr><td colspan="13">❌ No se encontraron resultados</td></tr>`;
          return;
        }

        inventarioFiltrado.forEach(producto => {
          const fila = `
            <tr>
              <td>${producto.ID_INVENTARIO}</td>
              <td>${producto.NOMBRE}</td>
              <td>${producto.PRECIO}</td>
              <td>${producto.CATEGORIA}</td>
              <td>${producto.DESCRIPCION}</td>
              <td>${producto.ESTADO}</td>
              <td>${producto.CANTIDAD_DISPONIBLE}</td>
              <td>${producto.UBICACION}</td>
              <td><img src="imagenes/${producto.IMAGEN}" width="50"></td>
              <td>${producto.FECHA_CADUCIDAD || ''}</td>
              <td>${producto.FECHA_ACTUALIZACION}</td>
              <td><button onclick="actualizarProducto(${producto.ID_INVENTARIO})">Actualizar</button></td>
              <td><button onclick="eliminarProducto(${producto.ID_INVENTARIO})">Eliminar</button></td>
            </tr>`;
          tabla.innerHTML += fila;
        });
      } else {
        tabla.innerHTML = `<tr><td colspan="13">❌ No hay productos en el inventario</td></tr>`;
      }
    })
    .catch(err => {
      console.error("❌ Error cargando inventario:", err);
    });
}

document.addEventListener('DOMContentLoaded', () => {
  cargarInventario();


 
});



// === ABRIR MODAL DE ASIGNACIÓN ===
function asignarPedido(idPedido) {
  document.getElementById('modal-asignar').style.display = 'flex';
  document.getElementById('asignar_id_pedido').value = idPedido;

  fetch('PHP/obtener_conductores.php')
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById('select-conductor');
      select.innerHTML = '<option value="">Seleccione un conductor</option>';
      data.forEach(conductor => {
        select.innerHTML += `<option value="${conductor.ID_USUARIOS}">${conductor.NOMBRE} ${conductor.APELLIDO}</option>`;
      });
    });
}

// === CERRAR MODAL DE ASIGNACIÓN ===
function cerrarModalAsignar() {
  document.getElementById('modal-asignar').style.display = 'none';
  document.getElementById('form-asignar').reset();
}

// === ENVIAR FORMULARIO DE ASIGNACIÓN ===
document.getElementById('form-asignar').addEventListener('submit', function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  console.log("ID Pedido:", formData.get("pedido_id"));
  console.log("ID Conductor:", formData.get("conductor_id"));

  fetch('PHP/asignar_pedido.php', {
    method: 'POST',
    body: formData
  })
    .then(res => res.text())
    .then(text => {
      console.log("Respuesta cruda:", text);
      return JSON.parse(text);
    })
    .then(data => {
      if (data.success) {
        alert("✅ Pedido asignado correctamente");
        cerrarModalAsignar();
        cargarPedidosRecientes(); // recargar pedidos
      } else {
        alert("❌ Error: " + data.message);
      }
    })
    .catch(err => {
      console.error("❌ Error al procesar JSON:", err);
    });
});

// === EDITAR INVENTARIO ===
function actualizarProducto(id) {
  fetch(`PHP/actualizar_producto_logi.php?id=${id}`)
    .then(response => {
      if (!response.ok) throw new Error("No se pudo obtener el producto");
      return response.json();
    })
    .then(data => {
      document.getElementById('editar_id_inventario').value = data.ID_INVENTARIO;
      document.getElementById('editar_nombre').value = data.NOMBRE;
      document.getElementById('editar_precio').value = data.PRECIO;
      document.getElementById('editar_categoria').value = data.CATEGORIA;
      document.getElementById('editar_descripcion').value = data.DESCRIPCION;
      document.getElementById('editar_estado').value = data.ESTADO;
      document.getElementById('editar_cantidad').value = data.CANTIDAD_DISPONIBLE;
      document.getElementById('editar_ubicacion').value = data.UBICACION;
      document.getElementById('editar_fecha_caducidad').value = data.FECHA_CADUCIDAD;

      const modal = document.getElementById('modal-editar-producto');
      if (modal) {
        modal.style.display = 'flex';
      } else {
        console.error("No se encontró el modal con ID 'modal-editar-producto'");
      }
    })
    .catch(error => {
      console.error('Error al obtener el producto:', error);
    });
}



// === GUARDAR EDICIÓN DE INVENTARIO ===
document.getElementById('form-editar-producto').addEventListener('submit', function (e) {
  e.preventDefault();

  const formData = new FormData(this);

  fetch('PHP/actualizar_producto_logi.php', {
    method: 'POST',
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("Producto actualizado correctamente");
        document.getElementById('modal-editar-producto').style.display = 'none';

          cargarInventario();

      } else {
        alert("Error al actualizar: " + (data.message || "Error desconocido"));
      }
    })
    .catch(error => {
      console.error("Error al enviar los datos:", error);
    });
});

//funcion cerrar modal de inventario
function cerrarModal() {
  const modal = document.getElementById("modal-editar-producto");
  if (modal) {
    modal.style.display = "none";
    document.getElementById('form-editar-producto').reset();
  }
}

// === ELIMINAR PRODUCTO DE INVENTARIO ===
function eliminarProducto(id) {
  if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) return;

  fetch('PHP/eliminar_inventario.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({ id: id })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      if (data.success) {
        fetch('PHP/mostrar_producto_pagina.php')
          cargarInventario();
      }
    })
    .catch(error => {
      console.error("❌ Error al eliminar:", error);
      alert("❌ No se pudo eliminar el producto.");
    });
}

/*mostrar clientes*/
function cargarCliente(){
fetch("PHP/mostrar_clientes.php")
  .then(resultado => resultado.json())
  .then(datos => {
    const clientes = datos;
    const tabla = document.querySelector("#tabla-clientes tbody");

    tabla.innerHTML = "";

    clientes.forEach(cliente => {
      const fila = document.createElement("tr");

      const id = document.createElement("td");
      id.textContent = cliente.ID_USUARIOS;

      const nombre = document.createElement("td");
      nombre.textContent = cliente.NOMBRE;

      const apellido = document.createElement("td");
      apellido.textContent = cliente.APELLIDO;

      const documento = document.createElement("td");
      documento.textContent = cliente.NUM_DOCUMENTO;

      const direccion = document.createElement("td");
      direccion.textContent = cliente.DIRECCION_USUARIO;

      const telefono = document.createElement("td");
      telefono.textContent = cliente.TELEFONO;

      const pedidos = document.createElement("td");
      pedidos.textContent = cliente.pedidos_realizados ?? 0;

      fila.appendChild(id);
      fila.appendChild(nombre);
      fila.appendChild(apellido);
      fila.appendChild(documento);
      fila.appendChild(direccion);
      fila.appendChild(telefono);
      fila.appendChild(pedidos);
      tabla.appendChild(fila);
    });
  })
  .catch(error => {
    console.error("✖️error al cargar los clientes", error);
    alert("✖️Error al cargar los clientes");
  });
}
cargarCliente();



/*mostrar conductores*/
function cargarConductores(){
fetch("PHP/obtener_conductores.php")
  .then(respuesta => respuesta.json())
  .then(datos => {
    const conductores = datos;
    const tabla = document.querySelector("#tabla-conductores tbody");

    tabla.innerHTML = "";

    conductores.forEach(conductor => {
      const fila = document.createElement("tr");

      const id = document.createElement("td");
      id.textContent = conductor.ID_USUARIOS;

      const nombre = document.createElement("td");
      nombre.textContent = conductor.NOMBRE;

      const apellido = document.createElement("td");
      apellido.textContent = conductor.APELLIDO;

      const documento = document.createElement("td");
      documento.textContent = conductor.NUM_DOCUMENTO;

       const direccion = document.createElement("td");
       direccion.textContent = conductor.DIRECCION_USUARIO;

       const telefono = document.createElement("td");
       telefono.textContent = conductor.TELEFONO; 
       
       const pedidosEntregados = document.createElement("td");
       pedidosEntregados.textContent = conductor.pedidos_entregados ?? 0;

      fila.appendChild(id);
      fila.appendChild(nombre);
      fila.appendChild(apellido);
      fila.appendChild(documento);
      fila.appendChild(direccion);
      fila.appendChild(telefono);
      fila.appendChild(pedidosEntregados);
      tabla.appendChild(fila);
    });
  })
  .catch(error => {
    console.error("✖️Error al cargar los cconductores", error);
    alert("✖️Error al cargar los conductores");
  });

}
cargarConductores();

/*FILTROS DE BUSQUEDA PEDIDOS*/

document.addEventListener("DOMContentLoaded", function () {
  const inputBuscar = document.getElementById("buscar");
  const form = document.getElementById("form-busqueda");
  const tbody = document.querySelector("#tabla-pedidos tbody");

  function buscarPedidos(valor) {
    const texto = valor.trim();
    if (texto === "") {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center;">⚠️ Escriba algo para buscar</td>
        </tr>`;
      return;
    }

    const formData = new FormData();
    formData.append("buscar", texto);

    fetch("PHP/buscar_pedido_logis.php", {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        tbody.innerHTML = "";

        if (data.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="9" style="text-align: center;">❌ No se encontraron resultados</td>
            </tr>`;
          return;
        }

        data.forEach(pedido => {
          const fila = `
            <tr>
              <td>${pedido.ID_PEDIDOS}</td>
              <td>${pedido.nombre_usuario}</td>
              <td>${pedido.nombre_producto}</td>
              <td>${pedido.CANTIDAD}</td>
              <td>${pedido.DIRECCION}</td>
              <td>${pedido.ESTADO}</td>
              <td>${pedido.FECHA_CREACION}</td>
              <td>$${pedido.TOTAL}</td>
              <td><span style="color: green;">✔ EN CAMINO</span></td>
            </tr>`;
          tbody.innerHTML += fila;
        });
      })
      .catch(error => {
        console.error("❌ Error:", error);
      });
  }

  // 🟡 Buscar mientras escribe
  inputBuscar.addEventListener("keyup", () => {
    buscarPedidos(inputBuscar.value);
  });

  // 🔴 Evitar que el botón recargue y repetir la búsqueda si se presiona
  form.addEventListener("submit", (e) => {
    e.preventDefault(); // 🔒 Bloquea el envío del formulario
    buscarPedidos(inputBuscar.value); // 👉 Solo vuelve a buscar lo mismo
  });
});


/*FILTROS DE BUSQUEDA INVENTARIO*/

document.addEventListener("DOMContentLoaded", function () {
  const inputBuscar = document.getElementById("buscar-inventario");
  const form = document.getElementById("form-busqueda-inventario");
  const tbody = document.querySelector("#tabla-productos tbody"); // ✅ CORREGIDO

  function buscarPedidos(valor) {
    const texto = valor.trim();
    if (texto === "") {
      tbody.innerHTML = `
        <tr>
          <td colspan="13" style="text-align: center;">⚠️ Escriba algo para buscar</td>
        </tr>`;
      return;
    }

    const formData = new FormData();
    formData.append("buscar", texto);

    fetch("PHP/buscar_inventario_logis.php", {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        tbody.innerHTML = "";

        if (data.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="13" style="text-align: center;">❌ No se encontraron resultados</td>
            </tr>`;
          return;
        }

        data.forEach(inventario => {
          const fila = `
            <tr>
              <td>${inventario.ID_INVENTARIO}</td>
              <td>${inventario.NOMBRE}</td>
              <td>${inventario.PRECIO}</td>
              <td>${inventario.CATEGORIA}</td>
              <td>${inventario.DESCRIPCION}</td>
              <td>${inventario.ESTADO}</td>
              <td>${inventario.CANTIDAD_DISPONIBLE}</td>
              <td>${inventario.UBICACION}</td>
              <td><img src="/proyecto/imagenes/${inventario.IMAGEN}" width="50" alt="imagen"></td>
              <td>${inventario.FECHA_CADUCIDAD}</td>
              <td>${inventario.FECHA_ACTUALIZACION}</td>
              <td><button class="actualizar" data-id="${inventario.ID_INVENTARIO}">Actualizar</button></td>
              <td><button class="eliminar" data-id="${inventario.ID_INVENTARIO}">Eliminar</button></td>
            </tr>`;
          tbody.innerHTML += fila;
        });
      })
      .catch(error => {
        console.error("❌ Error:", error);
        tbody.innerHTML = `
          <tr>
            <td colspan="13" style="text-align: center; color: red;">⚠️ Error al buscar</td>
          </tr>`;
      });
  }

  // 🟡 Buscar mientras escribe
  inputBuscar.addEventListener("keyup", () => {
    buscarPedidos(inputBuscar.value);
  });

  // 🔴 Evitar que el botón recargue
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    buscarPedidos(inputBuscar.value);
  });
});


/*FILTROS DE BUSQUEDA CLIENTES LOGISTICA*/
document.addEventListener("DOMContentLoaded", function () {
  const inputBuscar = document.getElementById("buscar-clientes");
  const form = document.getElementById("form-busqueda-clientes");
  const tbody = document.querySelector("#tabla-clientes tbody");

  function buscarProductos(valor) {
    const texto = valor.trim();
    if (texto === "") {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center;">⚠️ Escriba algo para buscar</td>
        </tr>`;
      return;
    }

    const formData = new FormData();
    formData.append("buscar", texto);

    fetch("PHP/buscar_cliente_admin.php", {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        tbody.innerHTML = "";

        if (data.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="8" style="text-align: center;">❌ No se encontraron resultados</td>
            </tr>`;
          return;
        }

        data.forEach(cliente => {
          const fila = `
            <tr>
              <td>${cliente.ID_USUARIOS}</td>
              <td>${cliente.NOMBRE}</td>
              <td>${cliente.APELLIDO}</td>
              <td>${cliente.NUM_DOCUMENTO}</td>
              <td>${cliente.DIRECCION_USUARIO}</td>
              <td>${cliente.TELEFONO}</td>
            </tr>`;
          tbody.innerHTML += fila;
        });
      })
      .catch(error => {
        console.error("❌ Error:", error);
      });
  }

  // 🟡 Buscar mientras escribe
  inputBuscar.addEventListener("keyup", () => {
    buscarProductos(inputBuscar.value);
  });

  // 🔴 Evitar que el botón recargue
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    buscarProductos(inputBuscar.value);
  });
});


/*BUSCAR CONDUCTOR LOGISTICA*/
document.addEventListener("DOMContentLoaded", function () {
  const inputBuscar = document.getElementById("buscar_conductor");
  const form = document.getElementById("form-busqueda_conductor");
  const tbody = document.querySelector("#tabla-conductores tbody");

  function buscarProductos(valor) {
    const texto = valor.trim();
    if (texto === "") {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center;">⚠️ Escriba algo para buscar</td>
        </tr>`;
      return;
    }

    const formData = new FormData();
    formData.append("buscar", texto);

    fetch("PHP/buscar_conductor_admin.php", {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        tbody.innerHTML = "";

        if (data.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="8" style="text-align: center;">❌ No se encontraron resultados</td>
            </tr>`;
          return;
        }

        data.forEach(conductor => {
          const fila = `
            <tr>
              <td>${conductor.ID_USUARIOS}</td>
              <td>${conductor.NOMBRE}</td>
              <td>${conductor.APELLIDO}</td>
              <td>${conductor.NUM_DOCUMENTO}</td>
              <td>${conductor.DIRECCION_USUARIO}</td>
              <td>${conductor.TELEFONO}</td>
            </tr>`;
          tbody.innerHTML += fila;
        });
      })
      .catch(error => {
        console.error("❌ Error:", error);
      });
  }

  // 🟡 Buscar mientras escribe
  inputBuscar.addEventListener("keyup", () => {
    buscarProductos(inputBuscar.value);
  });

  // 🔴 Evitar que el botón recargue
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    buscarProductos(inputBuscar.value);
  });
});

/*panel de logistica foto*/


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
