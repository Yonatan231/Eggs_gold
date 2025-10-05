fetch('/session', { credentials: 'same-origin' }) // envía la cookie JSESSIONID
    .then(res => res.json())
    .then(({ usuario_id, rol }) => {
        if (!usuario_id || !rol) {
            alert("❌ Sesión no iniciada. Redirigiendo al inicio...");
            window.location.href = '/login'; // endpoint Thymeleaf
            return;
        }

        console.log('ID de sesión:', usuario_id);
        console.log('Rol:', rol);

        if (rol === 'ADMIN') {
            cargarPedidosRecientes('PENDIENTE');
        }
    })
    .catch(error => {
        console.error("Error al obtener sesión:", error);
        window.location.href = '/login';
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

document.addEventListener("DOMContentLoaded", cargarPedidosRecientes);
// === FUNCIÓN: CARGAR PEDIDOS POR ESTADO ===
function cargarPedidosRecientes(estado = '') {
  fetch("http://localhost:8080/api/pedido/listar")
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            alert("No se pudieron cargar los pedidos.");
            return;
        }

        const pedidos = data.pedidos;
        const rol = data.rol;
      const tbody = document.querySelector('#tabla-pedidos tbody');
      tbody.innerHTML = "";


      if (pedidos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9">No hay pedidos para mostrar.</td></tr>';
        return;
      }

      pedidos.forEach(p => {
        const fila = document.createElement('tr');

        // Acción según el rol y estado
        const tdAccion = document.createElement('td');
        if (rol === "LOGISTICA" && p.estado === 'Aprobado') {
          tdAccion.innerHTML = `<button onclick="asignarPedido(${p.idPedidos})">Asignar</button>`;
        } else if (rol === "LOGISTICA" && p.estado === 'Asignado') {
          tdAccion.innerHTML = `<span style="color: green; font-weight: bold;">✔ ASIGNADO</span>`;
        } else if (rol === "LOGISTICA" && p.estado === 'En_camino') {
          tdAccion.innerHTML = `<span style="color: green; font-weight: bold;">✔ EN CAMINO</span>`;
        } else {
          tdAccion.innerHTML = "—";
        }

        // Fila con los datos del pedido
        fila.innerHTML = `
          <td>${p.idPedidos}</td>
          <td>${p.nombreUsuario}</td>
          <td colspan="2">${p.productos}</td> <!-- ✅ nombre + cantidad en un solo campo -->
          <td>${p.direccion}</td>
          <td>${p.total}</td>
          <td>${p.estado}</td>
          <td>${p.fechaCreacion}</td>
         
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



// === MOSTRAR INVENTARIO EN TABLA ===
function cargarInventario(busqueda = "") {
    fetch("http://localhost:8080/inventario/detalle")
        .then(res => res.json())
        .then(data => {
            const tabla = document.querySelector('#tabla-productos tbody');
            tabla.innerHTML = '';

            if (Array.isArray(data) && data.length > 0) {
                const inventarioFiltrado = busqueda
                    ? data.filter(item =>
                        Object.values(item).some(valor =>
                            String(valor).toLowerCase().includes(busqueda.toLowerCase())
                        )
                    )
                    : data;

                if (inventarioFiltrado.length === 0) {
                    tabla.innerHTML = `<tr><td colspan="13">❌ No se encontraron resultados</td></tr>`;
                    return;
                }

                inventarioFiltrado.forEach(producto => {
                    const fila = `
            <tr>
              <td>${producto.idInventario}</td>
              <td>${producto.nombre}</td>
              <td>${producto.precio}</td>
              <td>${producto.categoria}</td>
              <td>${producto.descripcion}</td>
              <td>${producto.estado}</td>
              <td>${producto.cantidadDisponible}</td>
              <td>${producto.ubicacion}</td>
              <td><img src="imagenes/${producto.imagen}" width="50"></td>
              <td>${producto.fechaCaducidad || ''}</td>
              <td>${producto.fechaActualizacion}</td>
              <td><button onclick="actualizarProducto(${producto.idInventario})">Actualizar</button></td>
              <td><button onclick="eliminarProducto(${producto.idInventario})">Eliminar</button></td>
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

  fetch('/entregados')
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById('select-conductor');
      select.innerHTML = '<option value="">Seleccione un conductor</option>';
      data.forEach(conductor => {
        select.innerHTML += `<option value="${conductor.idUsuarios}">${conductor.nombre} ${conductor.apellido}</option>`;
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

  fetch('/api/pedido/asignar', {
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
    if (!id) {
        console.error("❌ ID de inventario no proporcionado");
        return;
    }
  fetch(`/inventario/${id}`)
    .then(response => {
      if (!response.ok) throw new Error("No se pudo obtener el producto");
      return response.json();
    })
    .then(data => {
      document.getElementById('editar_id_inventario').value = data.idInventario;
      document.getElementById('editar_id_producto').value = data.producto.idProducto;
      document.getElementById('editar_nombre').value = data.producto.nombre;
      document.getElementById('editar_precio').value = data.producto.precio;
      document.getElementById('editar_categoria').value = data.producto.categoria;
      document.getElementById('editar_descripcion').value = data.producto.descripcion;
      document.getElementById('editar_estado').value = data.estado;
      document.getElementById('editar_cantidad').value = data.cantidadDisponible;
      document.getElementById('editar_ubicacion').value = data.ubicacion;
      document.getElementById('editar_fecha_caducidad').value = data.fechaCaducidad;

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

  fetch('/inventario/actualizar', {
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

    fetch("http://localhost:8080/inventario/eliminar", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: id })
    })
        .then(res => {
            if (!res.ok) throw new Error("Error en la respuesta del servidor");
            return res.json();
        })
        .then(data => {
            alert(data.message);
            if (data.success) {
                cargarInventario(); // ✅ refresca la tabla después de eliminar
            }
        })
        .catch(error => {
            console.error("❌ Error al eliminar:", error);
            alert("❌ No se pudo eliminar el producto.");
        });
}


/*mostrar clientes*/
function cargarCliente(){
fetch("http://localhost:8080/clientes/pedidos")
  .then(resultado => resultado.json())
  .then(datos => {
    const clientes = datos;
    const tabla = document.querySelector("#tabla-clientes tbody");

    tabla.innerHTML = "";

    clientes.forEach(cliente => {
      const fila = document.createElement("tr");

      const id = document.createElement("td");
      id.textContent = cliente.idUsuarios;

      const nombre = document.createElement("td");
      nombre.textContent = cliente.nombre;

      const apellido = document.createElement("td");
      apellido.textContent = cliente.apellido;

      const documento = document.createElement("td");
      documento.textContent = cliente.numDocumento;

      const direccion = document.createElement("td");
      direccion.textContent = cliente.direccionUsuario;

      const telefono = document.createElement("td");
      telefono.textContent = cliente.telefono;

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
fetch("http://localhost:8080/conductores/pedidos-entregados")
  .then(respuesta => respuesta.json())
  .then(datos => {
    const conductores = datos;
    const tabla = document.querySelector("#tabla-conductores tbody");

    tabla.innerHTML = "";

    conductores.forEach(conductor => {
      const fila = document.createElement("tr");

      const id = document.createElement("td");
      id.textContent = conductor.idConductor;

      const nombre = document.createElement("td");
      nombre.textContent = conductor.nombre;

      const apellido = document.createElement("td");
      apellido.textContent = conductor.apellido;

      const documento = document.createElement("td");
      documento.textContent = conductor.numDocumento;

       const direccion = document.createElement("td");
       direccion.textContent = conductor.direccionUsuario;

       const telefono = document.createElement("td");
       telefono.textContent = conductor.telefono;
       
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

        fetch("/api/pedidos/buscar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ buscar: texto })
        })
            .then(res => {
                if (!res.ok) throw new Error("Error en la respuesta del servidor");
                return res.json();
            })
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
              <td>${pedido.idPedido}</td>
              <td>${pedido.nombreUsuario}</td>
              <td>${pedido.nombreProducto}</td>
              <td>${pedido.cantidad}</td>
              <td>${pedido.direccion}</td>
              <td>${pedido.estado}</td>
              <td>${pedido.fechaCreacion}</td>
              <td>$${pedido.total}</td>
              <td><span style="color: green;">✔ EN CAMINO</span></td>
            </tr>`;
                    tbody.innerHTML += fila;
                });
            })
            .catch(error => {
                console.error("❌ Error:", error);
                tbody.innerHTML = `
          <tr>
            <td colspan="9" style="text-align: center; color: red;">Error al buscar pedidos</td>
          </tr>`;
            });
    }

    // 🟡 Buscar mientras escribe
    inputBuscar.addEventListener("keyup", () => {
        buscarPedidos(inputBuscar.value);
    });

    // 🔴 Evitar que el botón recargue y repetir la búsqueda si se presiona
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        buscarPedidos(inputBuscar.value);
    });
});


/* FILTROS DE BUSQUEDA INVENTARIO */
document.addEventListener("DOMContentLoaded", function () {
    const inputBuscar = document.getElementById("buscar-inventario");
    const form = document.getElementById("form-busqueda-inventario");
    const tbody = document.querySelector("#tabla-productos tbody");

    function buscarInventario(valor) {
        const texto = valor.trim();
        if (texto === "") {
            tbody.innerHTML = `
        <tr>
          <td colspan="13" style="text-align: center;">⚠️ Escriba algo para buscar</td>
        </tr>`;
            return;
        }

        fetch("/api/inventario/buscar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ buscar: texto })
        })
            .then(res => {
                if (!res.ok) throw new Error("Error en la respuesta del servidor");
                return res.json();
            })
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
              <td>${inventario.idInventario}</td>
              <td>${inventario.nombre}</td>
              <td>${inventario.precio}</td>
              <td>${inventario.categoria}</td>
              <td>${inventario.descripcion}</td>
              <td>${inventario.estado}</td>
              <td>${inventario.cantidadDisponible}</td>
              <td>${inventario.ubicacion}</td>
              <td><img src="/proyecto/imagenes/${inventario.imagen}" width="50" alt="imagen"></td>
              <td>${inventario.fechaCaducidad}</td>
              <td>${inventario.fechaActualizacion}</td>
              <td><button class="actualizar" data-id="${inventario.idInventario}">Actualizar</button></td>
              <td><button class="eliminar" data-id="${inventario.idInventario}">Eliminar</button></td>
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
        buscarInventario(inputBuscar.value);
    });

    // 🔴 Evitar que el botón recargue
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        buscarInventario(inputBuscar.value);
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

    const usuarioId = sessionStorage.getItem("usuarioId") || 1;

    // Mostrar imagen o iniciales
    fetch(`/usuarios/${usuarioId}/foto`)
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
        })
        .catch(error => {
            console.error("❌ Error obteniendo foto:", error);
        });

    // Subir imagen
    inputFoto.addEventListener("change", () => {
        const archivo = inputFoto.files[0];
        if (!archivo) return;

        const formData = new FormData();
        formData.append("foto", archivo);

        fetch(`/usuarios/${usuarioId}/foto`, {
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
                console.error("❌ Error subiendo imagen:", error);
            });
    });
});

/*cerrar sesion*/
document.getElementById("cerrar_sesion").addEventListener("click", function(e) {
    e.preventDefault();
    localStorage.clear(); // limpia datos locales
    window.location.href = "/logout"; // llama al endpoint de Spring
});
