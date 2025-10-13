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




// Mostrar/ocultar menú lateral
const btntoggle = document.querySelector('.toggle-btn');
btntoggle.addEventListener('click', function(){
    document.getElementById('sidebar').classList.toggle('active');
});


// Cargar pedidos 
document.addEventListener("DOMContentLoaded", cargarPedidosRecientes);

function cargarPedidosRecientes() {
  fetch("http://localhost:8080/api/pedido/listar")
    .then(response => response.json())
    .then(data => {
      if (!data.success) {
        alert("No se pudieron cargar los pedidos.");
        return;
      }

      const rol = data.rol;
      const pedidos = data.pedidos;
      const tbody = document.querySelector("#tabla-pedidos tbody");
      tbody.innerHTML = "";

      if (pedidos.length === 0) {
        const fila = document.createElement("tr");
        fila.innerHTML = `<td colspan="9">No hay pedidos para mostrar.</td>`;
        tbody.appendChild(fila);
        return;
      }

      pedidos.forEach(p => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${p.idPedidos}</td>
          <td>${p.nombreUsuario}</td>
          <td colspan="2">${p.productos.join(", ")}</td> <!-- ✅ Aquí unimos nombre y cantidad -->
          <td>${p.direccion}</td>
          <td>${p.estado}</td>
           <td>${new Date(p.fechaCreacion).toLocaleString()}</td>
          <td>$${p.total}</td>
        `;

        const tdAccion = document.createElement("td");

        if (rol === 'ADMIN' && p.estado === 'Pendiente') {
          tdAccion.innerHTML = `
            <button onclick="actualizarEstado(${p.idPedidos}, 'APROBADO')">Aceptar</button>
            <button onclick="actualizarEstado(${p.idPedidos}, 'RECHAZADO')">Denegar</button>
          `;
        } else if (rol == "LOGISTICA" && p.estado === 'Aprobado') {
          tdAccion.innerHTML = `<button onclick="asignarPedido(${p.idPedidos})">Asignar</button>`;
        } else if (rol == "ADMIN" && p.estado === 'Aprobado') {
          tdAccion.innerHTML = `<span style="color: green; font-weight: bold;">✔ Aprobado</span>`;
        } else if (rol == "ADMIN" && p.estado === 'Rechazado') {
          tdAccion.innerHTML = `<span style="color: red; font-weight: bold;">✖ Rechazado</span>`;
        } else if (rol == "ADMIN" && p.estado === 'En_camino') {
          tdAccion.innerHTML = `<span style="color: green; font-weight: bold;">✔ En camino</span>`;
        } else if (rol == "ADMIN" && p.estado === 'Asignado') {
            tdAccion.innerHTML = `<span style="color: green; font-weight: bold;">✔ Asignado</span>`;
        } else {
          tdAccion.innerHTML = "—";
        }

        fila.appendChild(tdAccion);
        tbody.appendChild(fila);
      });
    })
    .catch(err => {
      console.error("Error al cargar pedidos:", err);
    });
}


// Actualizar estado de pedido
function actualizarEstado(idPedido, nuevoEstado) {
    const formData = new FormData();
    formData.append('id_pedido', idPedido);
    formData.append('estado', nuevoEstado);

    fetch('/api/pedido/actualizar-estado', {
        method: 'POST',
        body: formData
    })
    .then(resp => resp.json()) // CAMBIO AQUÍ
    .then(data => {
        if (data.success) {
            alert("✅ Pedido actualizado correctamente");
            cargarPedidosRecientes();
        } else {
            alert("❌ Error al actualizar: " + (data.error || "desconocido"));
        }
    })
    .catch(error => {
        console.error('❌ Error al actualizar estado:', error);
        alert("❌ Error técnico. Ver consola.");
    });
}


// Ejecutar al cargar
document.addEventListener('DOMContentLoaded', cargarPedidosRecientes);




/*mostrar productos*/
function cargarProductos() {
    fetch("http://localhost:8080/inventario/producto")
        .then(response => response.json())
        .then(productos => {
            const tabla = document.querySelector("#tabla-productos tbody");
            tabla.innerHTML = "";

            productos.forEach(producto => {
                const fila = document.createElement("tr");

                // 🔹 Celdas de datos
                const id = document.createElement("td");
                id.textContent = producto.idProducto;

                const nombre = document.createElement("td");
                nombre.textContent = producto.nombre;

                const precio = document.createElement("td");
                precio.textContent = `$${parseInt(producto.precio).toLocaleString("es-CO")}`;

                const categoria = document.createElement("td");
                categoria.textContent = producto.categoria;

                const cantidad = document.createElement("td");
                cantidad.textContent = producto.cantidad;

                const descripcion = document.createElement("td");
                descripcion.textContent = producto.descripcion;


                const estado = document.createElement("td");
                estado.textContent = producto.estado;

                const imagen = document.createElement("td");
                const imgTag = document.createElement("img");
                imgTag.src = `imagenes/${producto.imagen.trim()}`;
                imgTag.alt = producto.nombre;
                imgTag.width = 50;
                imgTag.height = 50;
                imagen.appendChild(imgTag);

                // 🔵 Botón Actualizar
                const tdActualizar = document.createElement("td");
                const btnActualizar = document.createElement("button");
                btnActualizar.textContent = "✏️ Actualizar";
                btnActualizar.className = "btn btn-primary btn-sm";
                btnActualizar.onclick = () => abrirModalActualizar(producto);
                tdActualizar.appendChild(btnActualizar);

                // 🔴 Botón Eliminar
                const tdEliminar = document.createElement("td");
                const btnEliminar = document.createElement("button");
                btnEliminar.textContent = "🗑️ Eliminar";
                btnEliminar.className = "btn btn-danger btn-sm";
                btnEliminar.onclick = () => eliminarProducto(producto.idProducto);
                tdEliminar.appendChild(btnEliminar);

                // 🧩 Agregar todas las celdas a la fila
                fila.appendChild(id);
                fila.appendChild(nombre);
                fila.appendChild(precio);
                fila.appendChild(categoria);
                fila.appendChild(cantidad)
                fila.appendChild(descripcion);
                fila.appendChild(estado);
                fila.appendChild(imagen);
                fila.appendChild(tdActualizar);
                fila.appendChild(tdEliminar);

                // 📥 Agregar fila a la tabla
                tabla.appendChild(fila);
            });
        })
        .catch(error => {
            console.error("❌ Error al cargar productos:", error);
            alert("❌ No se pudieron cargar los productos.");
        });
}

cargarProductos();

/*mostrar clientes*/
function cargarProductosCliente(){
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

       const actualizar = document.createElement("td");

      const btnActualizar = document.createElement("button");
        btnActualizar.textContent = "✏️ Actualizar";
        btnActualizar.className = "btn btn-primary btn-sm";
     
       btnActualizar.onclick = () => abrirModalActualizarCliente(cliente);
       actualizar.appendChild(btnActualizar)
       //boton eliminar clientes //
       const eliminarBtn = document.createElement("button");
        eliminarBtn.textContent = "🗑️ Eliminar";
        eliminarBtn.className = "btn btn-danger btn-sm";
eliminarBtn.addEventListener("click", () => eliminarProductoCliente(cliente.idUsuarios));

const tdEliminar = document.createElement("td");
tdEliminar.appendChild(eliminarBtn);


      fila.appendChild(id);
      fila.appendChild(nombre);
      fila.appendChild(apellido);
      fila.appendChild(documento);
      fila.appendChild(direccion);
      fila.appendChild(telefono);
      fila.appendChild(actualizar);
      fila.appendChild(tdEliminar);
      tabla.appendChild(fila);
    });
  })
  .catch(error => {
    console.error("✖️error al cargar los clientes", error);
    alert("✖️Error al cargar los clientes");
  });
}
cargarProductosCliente();
/*mostrar conductores*/
function cargarProductosConductores(){
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

        const actualizar = document.createElement("td");

      const btnActualizar = document.createElement("button");
        btnActualizar.textContent = "✏️ Actualizar";
        btnActualizar.className = "btn btn-primary btn-sm";
     
       btnActualizar.onclick = () => abrirModalActualizarConductores(conductor);
       actualizar.appendChild(btnActualizar)

        //boton eliminar conductores //
       const eliminarBtn = document.createElement("button");
        eliminarBtn.textContent = "🗑️ Eliminar";
        eliminarBtn.className = "btn btn-danger btn-sm";
eliminarBtn.addEventListener("click", () => eliminarProductoConductores(conductor.idUsuarios || conductor.idConductor));

const tdEliminar = document.createElement("td");
tdEliminar.appendChild(eliminarBtn);


      
      

      fila.appendChild(id);
      fila.appendChild(nombre);
      fila.appendChild(apellido);
      fila.appendChild(documento);
      fila.appendChild(direccion);
      fila.appendChild(telefono);
      fila.appendChild(actualizar);
      fila.appendChild(tdEliminar);
      tabla.appendChild(fila);
    });
  })
  .catch(error => {
    console.error("✖️Error al cargar los cconductores", error);
    alert("✖️Error al cargar los conductores");
  });

}
cargarProductosConductores();

/*mostrar logistica*/
function cargarProductosLogistica(){
fetch("http://localhost:8080/logistica/ver")
  .then(respuesta => respuesta.json())
  .then(datos => {
    const logistica = datos;
    const tabla = document.querySelector("#tabla-Logistica tbody");

    tabla.innerHTML = "";

    logistica.forEach(logistica => {
      const fila = document.createElement("tr");

      const id = document.createElement("td");
      id.textContent = logistica.idUsuarios;

      const nombre = document.createElement("td");
      nombre.textContent = logistica.nombre;

      const apellido = document.createElement("td");
      apellido.textContent = logistica.apellido;

      const documento = document.createElement("td");
      documento.textContent = logistica.numDocumento;

       const direccion = document.createElement("td");
       direccion.textContent = logistica.direccionUsuario;

       const telefono = document.createElement("td");
       telefono.textContent = logistica.telefono;

        const actualizar = document.createElement("td");

      const btnActualizar = document.createElement("button");
        btnActualizar.textContent = "✏️ Actualizar";
        btnActualizar.className = "btn btn-primary btn-sm";
     
       btnActualizar.onclick = () => abrirModalActualizarLogistica(logistica);
       actualizar.appendChild(btnActualizar)

        //boton eliminar conductores //
       const eliminarBtn = document.createElement("button");
        eliminarBtn.textContent = "🗑️ Eliminar";
        eliminarBtn.className = "btn btn-danger btn-sm";
eliminarBtn.addEventListener("click", () => eliminarLogistica(logistica.idUsuarios));

const tdEliminar = document.createElement("td");
tdEliminar.appendChild(eliminarBtn);


      
      

      fila.appendChild(id);
      fila.appendChild(nombre);
      fila.appendChild(apellido);
      fila.appendChild(documento);
      fila.appendChild(direccion);
      fila.appendChild(telefono);
      fila.appendChild(actualizar);
      fila.appendChild(tdEliminar);
      tabla.appendChild(fila);
    });
  })
  .catch(error => {
    console.error("✖️Error al cargar logistica", error);
    alert("✖️Error al cargar logistica");
  });

}
cargarProductosLogistica();

// Función abrir modal actualizar productos
function abrirModalActualizar(producto) {
  document.getElementById("update-id").value = producto.idProducto; // ojo: idProductos en tu entidad
  document.getElementById("update-nombre").value = producto.nombre;
  document.getElementById("update-precio").value = producto.precio;
  document.getElementById("update-categoria").value = producto.categoria;
  document.getElementById("update-cantidad").value = producto.cantidad;
  document.getElementById("update-descripcion").value = producto.descripcion;
  document.getElementById("update-estado").value = producto.estado;


  document.getElementById("modalActualizar").style.display = "block";
}

// Función cerrar modal
function cerrarModal() {
  document.getElementById("modalActualizar").style.display = "none";
}

document.getElementById("formActualizarProducto").addEventListener("submit", function(e) {
  e.preventDefault();

  const id = document.getElementById("update-id").value;

  // Construir objeto producto
  const producto = {
    nombre: document.getElementById("update-nombre").value,
    precio: parseFloat(document.getElementById("update-precio").value),
    categoria: document.getElementById("update-categoria").value,
    cantidad: document.getElementById("update-cantidad").value,
    descripcion: document.getElementById("update-descripcion").value,
    estado: document.getElementById("update-estado").value,

  };

  console.log("📦 Enviando producto:", producto);

  fetch("http://localhost:8080/actualizar/" + id, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(producto)
  })
  .then(resp => resp.json())
  .then(data => {
    if (data.success) {
      alert("✅ Producto actualizado correctamente.");
      cerrarModal();
      cargarProductos(); // Recargar la tabla
    } else {
      alert("❌ Error al actualizar: " + (data.error || "desconocido"));
    }
  })
  .catch(error => {
    console.error("❌ Error en la solicitud:", error);
    alert("❌ Fallo en la conexión.");
  });
});



 //funcion para eliminar un producto en admin//
function eliminarProducto(id) {
  if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
    fetch(`/descontinuar?id=${id}`, {
      method: "PUT"
    })
    .then(response => response.text())
    .then(data => {
      alert(data); //
        cargarProductos()
        /*
      fetch("http://localhost:8080/inventario/producto") // Vuelve a cargar la tabla
        .then(response => response.text())
        .then(html => {
          document.getElementById('tabla-productos').innerHTML = html;
        });*/
    })
    .catch(error => {
      console.error("❌ Error al eliminar el producto:", error);
      alert("❌ No se pudo eliminar el producto.");
    });
  }
}


//funcion abrir modal actualizar cliente//
  function abrirModalActualizarCliente(cliente) {

      document.getElementById("updatec-id").value = cliente.idUsuarios ;
    console.log("🆔 ID asignado al input:", document.getElementById("updatec-id").value);

    console.log("🔍 Cliente recibido:", cliente);

  document.getElementById("updatec-nombre").value = cliente.nombre;
  document.getElementById("updatec-apellido").value = cliente.apellido;
  document.getElementById("updatec-documento").value = cliente.numDocumento;
  document.getElementById("updatec-direccion").value = cliente.direccionUsuario;
  document.getElementById("updatec-telefono").value = cliente.telefono;



  // Mostrar el modal
  document.getElementById("modalActualizarClientes").style.display = "block";
}
//funcion cerrar modal//
function cerrarModalCliente() {
  document.getElementById("modalActualizarClientes").style.display = "none";
}

document.getElementById("formActualizarClientes").addEventListener("submit", function(e) {
  e.preventDefault();

    const usuario = {
        nombre: document.getElementById("updatec-nombre").value,
        apellido: document.getElementById("updatec-apellido").value,
        numDocumento: document.getElementById("updatec-documento").value,
        direccionUsuario: document.getElementById("updatec-direccion").value,
        telefono: document.getElementById("updatec-telefono").value
    };

    const id = document.getElementById("updatec-id").value;

    fetch(`http://localhost:8080/usuarios/${id}`, {
    method: "PUT",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify(usuario)
  })
  .then(resp => resp.json())
  .then(data => {
    if (data.success) {
      alert("✅ Cliente actualizado correctamente.");
      cerrarModalCliente();
      // Recargar la tabla
      cargarProductosCliente(); // Asegúrate de tener esta función
    } else {
      alert("❌ Error al actualizar: " + (data.error || "desconocido"));
    }
  })
  .catch(error => {
    console.error("❌ Error en la solicitud:", error);
    alert("❌ Fallo en la conexión.");
  });
});

// función de eliminar clientes //
function eliminarProductoCliente(id) {
    if (confirm("¿Estás seguro de que quieres eliminar este cliente?")) {
        fetch(`/eliminar/${id}`, {
            method: "PUT"
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Error en la petición al backend");
                }
                return response.text(); // el backend devuelve un mensaje plano
            })
            .then(data => {
                alert(data); // ✅ Muestra el mensaje del backend
                location.reload(); // Recarga la tabla para que ya no aparezca
            })
            .catch(error => {
                console.error("❌ Error al eliminar el cliente:", error);
                alert("❌ No se pudo eliminar el cliente.");
            });
    }
}


//funcion abrir modal actualizar conductores//
  function abrirModalActualizarConductores(conductor) {
    
  document.getElementById("updateco-id").value = conductor.idUsuarios || conductor.idConductor;
    console.log("🆔 ID asignado al input:", document.getElementById("updateco-id").value);

    console.log("🔍 Conductor recibido:", conductor);

  document.getElementById("updateco-nombre").value = conductor.nombre;
  document.getElementById("updateco-apellido").value = conductor.apellido;
  document.getElementById("updateco-documento").value = conductor.numDocumento;
  document.getElementById("updateco-direccion").value = conductor.direccionUsuario;
  document.getElementById("updateco-telefono").value = conductor.telefono;
  


  // Mostrar el modal
  document.getElementById("modalActualizarConductores").style.display = "block";
}
//funcion cerrar modal//
function cerrarModalConductores() {
  document.getElementById("modalActualizarConductores").style.display = "none";
}

document.getElementById("formActualizarConductores").addEventListener("submit", function(e) {
  e.preventDefault();

  const usuario = {
      nombre: document.getElementById("updateco-nombre").value,
      apellido: document.getElementById("updateco-apellido").value,
      numDocumento: document.getElementById("updateco-documento").value,
      direccionUsuario: document.getElementById("updateco-direccion").value,
      telefono: document.getElementById("updateco-telefono").value
  };

    const id = document.getElementById("updateco-id").value;


  fetch(`http://localhost:8080/usuarios/${id}`, {
    method: "PUT",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify(usuario)
  })
  .then(resp => resp.json())
  .then(data => {
    if (data.success) {
      alert("✅ Conductor actualizado correctamente.");
      cerrarModalConductores();
      // Recargar la tabla
      cargarProductosConductores(); // Asegúrate de tener esta función
    } else {
      alert("❌ Error al actualizar: " + (data.error || "desconocido"));
    }
  })
  .catch(error => {
    console.error("❌ Error en la solicitud:", error);
    alert("❌ Fallo en la conexión.");
  });
});


//funcion de eliminar  conductores//
 function eliminarProductoConductores(id) {
     if (confirm("¿Estás seguro de que quieres eliminar este conductor?")) {
         fetch(`/eliminar/${id}`, {
             method: "PUT"
         })
             .then(response => {
                 if (!response.ok) {
                     throw new Error("Error en la petición al backend");
                 }
                 return response.text(); // el backend devuelve un mensaje plano
             })
             .then(data => {
                 alert(data); // ✅ Muestra el mensaje del backend
                 location.reload(); // Recarga la tabla para que ya no aparezca
             })
             .catch(error => {
                 console.error("❌ Error al eliminar el conductor:", error);
                 alert("❌ No se pudo eliminar el conductor.");
             });
     }
}

//funcion abrir modal actualizar Logistica//
  function abrirModalActualizarLogistica(logistica) {
    
  document.getElementById("updateL-id").value = logistica.idUsuarios;
    console.log("🆔 ID asignado al input:", document.getElementById("updateL-id").value);

    console.log("🔍 Producto recibido:", logistica);

  document.getElementById("updateL-nombre").value = logistica.nombre;
  document.getElementById("updateL-apellido").value = logistica.apellido;
  document.getElementById("updateL-documento").value = logistica.numDocumento;
  document.getElementById("updateL-direccion").value = logistica.direccionUsuario;
  document.getElementById("updateL-telefono").value = logistica.telefono;
  


  // Mostrar el modal
  document.getElementById("modalActualizarLogistica").style.display = "block";
}
//funcion cerrar modal//
function cerrarModalLogistica() {
  document.getElementById("modalActualizarLogistica").style.display = "none";
}

document.getElementById("formActualizarLogistica").addEventListener("submit", function(e) {
  e.preventDefault();

    const usuario = {
        nombre: document.getElementById("updateL-nombre").value,
        apellido: document.getElementById("updateL-apellido").value,
        numDocumento: document.getElementById("updateL-documento").value,
        direccionUsuario: document.getElementById("updateL-direccion").value,
        telefono: document.getElementById("updateL-telefono").value
    };

  const id = document.getElementById("updateL-id").value;



  fetch(`http://localhost:8080/usuarios/${id}`, {
    method: "PUT",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify(usuario)
  })
  .then(resp => resp.json())
  .then(data => {
    if (data.success) {
      alert("✅ Logistica actualizado correctamente.");
      cerrarModalLogistica();
      // Recargar la tabla
      cargarProductosLogistica(); // Asegúrate de tener esta función
    } else {
      alert("❌ Error al actualizar: " + (data.error || "desconocido"));
    }
  })
  .catch(error => {
    console.error("❌ Error en la solicitud:", error);
    alert("❌ Fallo en la conexión.");
  });
});


//funcion de eliminar  conductores//
 function eliminarLogistica(id) {
     if (confirm("¿Estás seguro de que quieres eliminar logistica?")) {
         fetch(`/eliminar/${id}`, {
             method: "PUT"
         })
             .then(response => {
                 if (!response.ok) {
                     throw new Error("Error en la petición al backend");
                 }
                 return response.text(); // el backend devuelve un mensaje plano
             })
             .then(data => {
                 alert(data); // ✅ Muestra el mensaje del backend
                 location.reload(); // Recarga la tabla para que ya no aparezca
             })
             .catch(error => {
                 console.error("❌ Error al eliminar logistica:", error);
                 alert("❌ No se pudo eliminar logistica");
             });
     }
}

/*buscar pedidos administrador*/
function renderEstadoPedido(estado) {
    switch (estado) {
        case 'DISPONIBLE':
            return `<span style="color: green;">✔ DISPONIBLE</span>`;
        case 'EN CAMINO':
            return `<span style="color: orange;">🚚 EN CAMINO</span>`;
        case 'ENTREGADO':
            return `<span style="color: blue;">📦 ENTREGADO</span>`;
        case 'ASIGNADO':
            return `<span style="color: teal;">📝 ASIGNADO</span>`;
        case 'PENDIENTE':
            return `<span style="color: gray;">⏳ PENDIENTE</span>`;
        case 'APROBADO':
            return `<span style="color: darkgreen;">✅ APROBADO</span>`;
        case 'RECHAZADO':
            return `<span style="color: red;">❌ RECHAZADO</span>`;
        default:
            return `<span>${estado}</span>`;
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const inputBuscar = document.getElementById("buscar");
    const form = document.getElementById("form-busqueda");
    const tbody = document.querySelector("#tabla-pedidos tbody");

    function buscarPedidos(valor) {
        const texto = valor.trim();
        if (texto === "") {
            cargarPedidosRecientes();
            return;

        }

        fetch("/api/pedidos/buscar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ buscar: texto })
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
              <td>${pedido.idPedidos}</td>
              <td>${pedido.nombreUsuario}</td>
              <td>${pedido.nombreProducto}</td>
              <td>${pedido.cantidad}</td>
              <td>${pedido.direccion}</td>
              <td>${pedido.estado}</td>
              <td>${pedido.fechaCreacion}</td>
              <td>$${pedido.total}</td>           
             <td>${renderEstadoPedido(pedido.estado)}</td>
              
              </tr>`;
                    tbody.innerHTML += fila;
                });
            })
            .catch(error => {
                console.error("❌ Error:", error);
                tbody.innerHTML = `
          <tr>
            <td colspan="9" style="text-align: center;">❌ Error al buscar pedidos</td>
          </tr>`;
            });
    }

    inputBuscar.addEventListener("keyup", () => {
        buscarPedidos(inputBuscar.value);
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        buscarPedidos(inputBuscar.value);
    });
});



document.addEventListener("DOMContentLoaded", function () {
    const inputBuscar = document.getElementById("buscar_producto");
    const form = document.getElementById("form-busqueda");
    const tbody = document.querySelector("#tabla-productos tbody");

    function buscarProductos(valor) {
        const texto = valor.trim();
        if (texto === "") {
            cargarProductos();
            return;

        }

        fetch("/api/productos/buscar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ buscar: texto })
        })
            .then(res => res.json())
            .then(data => {
                tbody.innerHTML = "";

                if (data.length === 0) {
                    tbody.innerHTML = `
            <tr>
              <td colspan="10" style="text-align: center;">❌ No se encontraron resultados</td>
            </tr>`;
                    return;
                }

                data.forEach(producto => {
                    const fila = document.createElement("tr");

                    // Celdas normales
                    const tdId = document.createElement("td");
                    tdId.textContent = producto.idProducto;

                    const tdNombre = document.createElement("td");
                    tdNombre.textContent = producto.nombre;

                    const tdPrecio = document.createElement("td");
                    tdPrecio.textContent = `$${parseInt(producto.precio).toLocaleString("es-CO")}`;

                    const tdCategoria = document.createElement("td");
                    tdCategoria.textContent = producto.categoria;

                    const tdCantidad = document.createElement("td");
                    tdCantidad.textContent = producto.cantidad;

                    const tdDescripcion = document.createElement("td");
                    tdDescripcion.textContent = producto.descripcion;

                    const tdEstado = document.createElement("td");
                    tdEstado.textContent = producto.estado;

                    const tdImagen = document.createElement("td");
                    const img = document.createElement("img");
                    img.src = `imagenes/${producto.imagen}`;
                    img.width = 50;
                    img.alt = "Producto";
                    tdImagen.appendChild(img);

                    // ✅ Botón Actualizar
                    const tdActualizar = document.createElement("td");
                    const btnActualizar = document.createElement("button");
                    btnActualizar.textContent = "✏️ Actualizar";
                    btnActualizar.className = "btn btn-primary btn-sm";
                    btnActualizar.onclick = () => abrirModalActualizar(producto);
                    tdActualizar.appendChild(btnActualizar);

                    // ✅ Botón Eliminar
                    const tdEliminar = document.createElement("td");
                    const btnEliminar = document.createElement("button");
                    btnEliminar.textContent = "🗑️ Eliminar";
                    btnEliminar.className = "btn btn-danger btn-sm";
                    btnEliminar.onclick = () => eliminarProducto(producto.idProducto);
                    tdEliminar.appendChild(btnEliminar);

                    // Agregar todas las celdas a la fila
                    fila.appendChild(tdId);
                    fila.appendChild(tdNombre);
                    fila.appendChild(tdPrecio);
                    fila.appendChild(tdCategoria);
                    fila.appendChild(tdCantidad)
                    fila.appendChild(tdDescripcion);
                    fila.appendChild(tdEstado);
                    fila.appendChild(tdImagen);
                    fila.appendChild(tdActualizar);
                    fila.appendChild(tdEliminar);

                    tbody.appendChild(fila);
                });
            })
            .catch(error => {
                console.error("❌ Error:", error);
                tbody.innerHTML = `
          <tr>
            <td colspan="10" style="text-align: center;">❌ Error al buscar productos</td>
          </tr>`;
            });
    }

    inputBuscar.addEventListener("keyup", () => {
        buscarProductos(inputBuscar.value);
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        buscarProductos(inputBuscar.value);
    });
});


/*buscar Clientes administrador*/
document.addEventListener("DOMContentLoaded", function () {
    const inputBuscar = document.getElementById("buscar_cliente");
    const form = document.getElementById("form-busqueda_cliente");
    const tbody = document.querySelector("#tabla-clientes tbody");

    function buscarClientes(valor) {
        const texto = valor.trim();
        if (texto === "") {
         cargarProductosCliente()
            return;
        }

        // 🔹 Llamada al endpoint de Spring Boot (GET con query param)
        fetch(`http://localhost:8080/clientes/activos?buscar=${encodeURIComponent(texto)}`)
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
                    const tr = document.createElement("tr");

            tr.innerHTML=`
              <td>${cliente.idUsuarios}</td>
              <td>${cliente.nombre}</td>
              <td>${cliente.apellido}</td>
              <td>${cliente.numDocumento}</td>
              <td>${cliente.direccionUsuario}</td>
              <td>${cliente.telefono}</td>
            `;
                   // 🔹 Botón Actualizar
                    const tdActualizar = document.createElement("td");
                    const btnActualizar = document.createElement("button");
                    btnActualizar.textContent = "✏️ Actualizar";
                    btnActualizar.className = "btn btn-primary btn-sm";
                    btnActualizar.onclick = () => abrirModalActualizarCliente(cliente);
                    tdActualizar.appendChild(btnActualizar);

                    // 🔹 Botón Eliminar
                    const tdEliminar = document.createElement("td");
                    const btnEliminar = document.createElement("button");
                    btnEliminar.textContent = "🗑️ Eliminar";
                    btnEliminar.className = "btn btn-danger btn-sm";
                    btnEliminar.addEventListener("click", () => eliminarProductoCliente(cliente.id));
                    tdEliminar.appendChild(btnEliminar);
                    // Agregar botones a la fila
                    tr.appendChild(tdActualizar);
                    tr.appendChild(tdEliminar);

                    // Agregar fila completa
                    tbody.appendChild(tr);

                });
            })
            .catch(error => {
                console.error("❌ Error:", error);
                tbody.innerHTML = `
          <tr>
            <td colspan="8" style="text-align: center; color: red;">⚠️ Error al conectar con el servidor</td>
          </tr>`;
            });
    }

    // 🟡 Buscar mientras escribe
    inputBuscar.addEventListener("keyup", () => {
        buscarClientes(inputBuscar.value);
    });

    // 🔴 Evitar que el botón recargue
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        buscarClientes(inputBuscar.value);
    });
});

/* Buscar Conductor (Administrador) */
document.addEventListener("DOMContentLoaded", function () {
    const inputBuscar = document.getElementById("buscar_conductor");
    const form = document.getElementById("form-busqueda_conductor");
    const tbody = document.querySelector("#tabla-conductores tbody");

    // Función principal
    function buscarConductores(valor) {
        const texto = valor.trim();

        if (texto === "") {
            cargarProductosConductores()
            return
        }

        fetch(`http://localhost:8080/conductores/activos?buscar=${encodeURIComponent(texto)}`)
            .then(res => res.json())
            .then(data => {
                tbody.innerHTML = "";

                if (!Array.isArray(data) || data.length === 0) {
                    tbody.innerHTML = `
            <tr>
              <td colspan="8" style="text-align: center;">❌ No se encontraron resultados</td>
            </tr>`;
                    return;
                }

                data.forEach(conductor => {
                    const tr = document.createElement("tr");

                    tr.innerHTML=`
              <td>${conductor.idUsuarios}</td>
              <td>${conductor.nombre}</td>
              <td>${conductor.apellido}</td>
              <td>${conductor.numDocumento}</td>
              <td>${conductor.direccionUsuario}</td>
              <td>${conductor.telefono}</td>
            `;
                    // 🔹 Botón Actualizar
                    const tdActualizar = document.createElement("td");
                    const btnActualizar = document.createElement("button");
                    btnActualizar.textContent = "✏️ Actualizar";
                    btnActualizar.className = "btn btn-primary btn-sm";
                    btnActualizar.onclick = () => abrirModalActualizarConductores(conductor);
                    tdActualizar.appendChild(btnActualizar);

                    // 🔹 Botón Eliminar
                    const tdEliminar = document.createElement("td");
                    const btnEliminar = document.createElement("button");
                    btnEliminar.textContent = "🗑️ Eliminar";
                    btnEliminar.className = "btn btn-danger btn-sm";
                    btnEliminar.addEventListener("click", () => eliminarProductoConductores(conductor.idUsuarios || conductor.idConductor));
                    tdEliminar.appendChild(btnEliminar);
                    // Agregar botones a la fila
                    tr.appendChild(tdActualizar);
                    tr.appendChild(tdEliminar);

                    // Agregar fila completa
                    tbody.appendChild(tr);
                });
            })
            .catch(error => {
                console.error("❌ Error al buscar conductores:", error);
                tbody.innerHTML = `
          <tr>
            <td colspan="8" style="text-align: center; color: red;">⚠️ Error al conectar con el servidor</td>
          </tr>`;
            });
    }

    // Evento: al escribir en el campo
    inputBuscar.addEventListener("input", function () {
        const valor = this.value;
        buscarConductores(valor);
    });

    // Evento: al enviar el formulario (por si presiona Enter)
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        buscarConductores(inputBuscar.value);
    });
});

/*buscar Logistica administrador*/
document.addEventListener("DOMContentLoaded", function () {
  const inputBuscar = document.getElementById("buscar_logistica");
  const form = document.getElementById("form-busqueda_logistica");
  const tbody = document.querySelector("#tabla-Logistica tbody");

  function buscarLogistica(valor) {
    const texto = valor.trim();
    if (texto === "") {
      cargarProductosLogistica()
      return;
    }


    fetch(`http://localhost:8080/logistica/activos?buscar=${encodeURIComponent(texto)}`)
        .then(res => res.json())
        .then(data => {
            tbody.innerHTML = "";

            if (!Array.isArray(data) || data.length === 0) {
                tbody.innerHTML = `
            <tr>
              <td colspan="8" style="text-align: center;">❌ No se encontraron resultados</td>
            </tr>`;
                return;
            }

        data.forEach(logistica => {
            const tr = document.createElement("tr");

            tr.innerHTML=`
              <td>${logistica.idUsuarios}</td>
              <td>${logistica.nombre}</td>
              <td>${logistica.apellido}</td>
              <td>${logistica.numDocumento}</td>
              <td>${logistica.direccionUsuario}</td>
              <td>${logistica.telefono}</td>
            `;
            // 🔹 Botón Actualizar
            const tdActualizar = document.createElement("td");
            const btnActualizar = document.createElement("button");
            btnActualizar.textContent = "✏️ Actualizar";
            btnActualizar.className = "btn btn-primary btn-sm";
            btnActualizar.onclick = () => abrirModalActualizarLogistica(logistica);
            tdActualizar.appendChild(btnActualizar);

            // 🔹 Botón Eliminar
            const tdEliminar = document.createElement("td");
            const btnEliminar = document.createElement("button");
            btnEliminar.textContent = "🗑️ Eliminar";
            btnEliminar.className = "btn btn-danger btn-sm";
            btnEliminar.addEventListener("click", () => eliminarLogistica(logistica.idUsuarios));
            tdEliminar.appendChild(btnEliminar);
            // Agregar botones a la fila
            tr.appendChild(tdActualizar);
            tr.appendChild(tdEliminar);

            // Agregar fila completa
            tbody.appendChild(tr);
        });
      })
        .catch(error => {
            console.error("❌ Error al buscar conductores:", error);
            tbody.innerHTML = `
          <tr>
            <td colspan="8" style="text-align: center; color: red;">⚠️ Error al conectar con el servidor</td>
          </tr>`;
        });
  }

    // Evento: al escribir en el campo
    inputBuscar.addEventListener("input", function () {
        const valor = this.value;
        buscarLogistica(valor)
    });

    // Evento: al enviar el formulario (por si presiona Enter)
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        buscarLogistica(inputBuscar.value);
    });
});



/* panel de administrador foto */

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



//aqui muestra el codigo para que las tarjetas funcionen//
document.addEventListener("DOMContentLoaded", () => {
  fetch("/api/dashboard")
    .then(response => response.json())
    .then(data => {
      document.getElementById("totalUsuarios").textContent = data.usuarios;
      document.getElementById("totalVentas").textContent = `${data.ventas}`;
      document.getElementById("totalProductos").textContent = data.productos;
    })
    .catch(error => {
      console.error("❌ Error cargando resumen:", error);
    });
});


document.getElementById("btn-ver-pdf").addEventListener("click", function() {
    window.open("/admin/reportes/pedidos-usuarios", "_blank");
});

/*cerrar sesion*/
document.getElementById("cerrar_sesion").addEventListener("click", function(e) {
    e.preventDefault();
    localStorage.clear(); // limpia datos locales
    window.location.href = "/logout"; // llama al endpoint de Spring
});


