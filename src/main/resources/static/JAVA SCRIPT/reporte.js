// Event listener que se ejecuta cuando el DOM está completamente cargado
document.addEventListener("DOMContentLoaded", () => {
    // Realiza una petición fetch al archivo PHP que obtiene los reportes
    fetch("PHP/ver_reportes.php")
        .then(res => res.json()) // Convierte la respuesta a formato JSON
        .then(data => {
            // Obtiene el contenedor donde se mostrarán los reportes
            const contenedor = document.getElementById("reportes");
            contenedor.innerHTML = ""; // Limpia el contenido previo del contenedor

            // Verifica si la respuesta no fue exitosa
            if (!data.success) {
                // Muestra un mensaje de error en rojo
                contenedor.innerHTML = `<p style="color:red;">❌ ${data.message}</p>`;
                return;
            }

            // Desestructura la respuesta para obtener destinatario y reportes
            const { destinatario, reportes } = data;

            // Crea un título con el nombre del destinatario
            const titulo = document.createElement("h2");
            titulo.textContent = `🔥 Mensajes para: ${destinatario}`;
            contenedor.appendChild(titulo);

            // Verifica si no hay reportes disponibles
            if (reportes.length === 0) {
                contenedor.innerHTML += "<p>No hay reportes.</p>";
                return;
            }

            // Obtiene el nombre y apellido del usuario desde localStorage
            const nombre = localStorage.getItem("nombre");
            const apellido = localStorage.getItem("apellido");

            // Itera sobre cada reporte para crear las tarjetas visuales
            reportes.forEach(reporte => {
                const card = document.createElement("div");
                card.classList.add("reporte-card"); // Añade clase CSS para estilizar

                // Construye el HTML interno de la tarjeta con los datos del reporte
                card.innerHTML = `
          <img src="imagenes/LOGO.jpg" class="logo" width="50" height="50" style="border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.2);">
          <p><strong>De:</strong> ${reporte.remitente} ${nombre} ${apellido}</p>
          <p><strong>Título:</strong> ${reporte.titulo}</p>
          <p><strong>Mensaje:</strong> ${reporte.descripcion.replace(/\n/g, "<br>")}</p>
          ${reporte.archivo ? `<p><strong>Archivo:</strong></p><img src="imagenes/${reporte.archivo}" style="max-width:100%;">` : ''}
          <p><strong>Fecha:</strong> ${reporte.fecha}</p>
          <hr>
        `;

                // Añade la tarjeta al contenedor principal
                contenedor.appendChild(card);
            });
        })
        .catch(err => {
            // Maneja errores en la petición fetch
            console.error("❌ Error al cargar reportes:", err);
            document.getElementById("reportes").innerHTML = "Error al cargar los reportes.";
        });
});


// Event listener para configurar el botón de regreso según el rol del usuario
document.addEventListener("DOMContentLoaded", () => {
    const btnAtras = document.getElementById("btn-atras");
    const rol = localStorage.getItem("rol_id"); // Obtiene el ID del rol desde localStorage

    // Redirige a diferentes páginas según el rol del usuario
    if (rol == "1") {
        btnAtras.href = "administrador/administrador.htm"; // Administrador
    } else if (rol == "2") {
        btnAtras.href = "conductor.htm"; // Conductor
    } else if (rol == "3") {
        btnAtras.href = "logistica.htm"; // Logística
    } else {
        btnAtras.href = "inicio/inicio.htm"; // Página por defecto si el rol no coincide
    }
});


// Event listener para establecer el remitente del reporte según el rol
document.addEventListener("DOMContentLoaded", () => {
    const remitente = localStorage.getItem("rol_id"); // Obtiene el rol del usuario

    // Mapeo de IDs de rol a nombres legibles
    const nombreRol = {
        1: "administrador",
        2: "conductor",
        3: "logistica"
    };

    // Establece el valor del input oculto con el nombre del rol
    if (remitente && document.getElementById("remitente")) {
        const rolNombre = nombreRol[remitente] || "desconocido";
        document.getElementById("remitente").value = rolNombre;

        // Actualiza el título del formulario mostrando quién está creando el reporte
        const titulo = document.getElementById("titulo-formulario");
        if (titulo) {
            titulo.textContent = `Crea reporte señor:  ${rolNombre}`;
        }
    }
});


/*
================================================================================
                          COMENTARIO GENERAL DEL CÓDIGO
================================================================================

¿QUÉ HACE EL CÓDIGO?
---------------------
Este código JavaScript gestiona un sistema de reportes con tres funcionalidades
principales:

1. VISUALIZACIÓN DE REPORTES: Obtiene reportes desde el servidor mediante fetch,
   los muestra en tarjetas con información del remitente, título, mensaje,
   archivo adjunto y fecha.

2. NAVEGACIÓN BASADA EN ROLES: Configura un botón de retroceso que redirige a
   diferentes páginas según el rol del usuario (administrador, conductor o
   logística).

3. IDENTIFICACIÓN DEL REMITENTE: Establece automáticamente el remitente del
   reporte en un formulario basándose en el rol almacenado en localStorage.


MEJORAS SUGERIDAS:
------------------
1. Consolidar eventos DOMContentLoaded: Hay tres listeners separados que podrían
   unificarse en uno solo para mejorar la eficiencia y legibilidad.

2. Validación de datos: No valida si `nombre` y `apellido` existen en
   localStorage antes de usarlos, lo que podría mostrar "undefined" en la
   interfaz.

3. Uso de comparación estricta: Usar `===` en lugar de `==` para comparar el
   rol_id (actualmente compara string con número).

4. Sanitización de HTML: El código inserta directamente `reporte.descripcion`
   sin sanitizar, lo que podría ser un riesgo de seguridad XSS si el contenido
   viene de usuarios.

5. Separación de responsabilidades: Mezcla lógica de visualización con lógica
   de formulario. Sería mejor dividirlo en funciones reutilizables.

6. Manejo de imágenes rotas: No hay validación si el archivo de imagen existe
   o se carga correctamente.

7. Internacionalización: Los textos están hardcodeados en español. Considerar
   un sistema de i18n.


ERRORES IDENTIFICADOS:
----------------------
1. Concatenación incorrecta en "De:": En la línea
   `${reporte.remitente} ${nombre} ${apellido}`, está concatenando el remitente
   del servidor CON el nombre/apellido del localStorage, lo que probablemente
   genere un nombre duplicado o incoherente.

2. localStorage en múltiples lugares: Accede a localStorage tres veces por
   separado, lo que es ineficiente. Debería obtener los valores una sola vez.

3. Falta de manejo de errores específicos: Si `rol_id` no existe en
   localStorage, el código podría fallar silenciosamente.

4. Dependencia de elementos DOM: No verifica si los elementos existen antes de
   manipularlos (ej: `document.getElementById("reportes")` podría ser null).

5. Reemplazo inseguro de saltos de línea: `.replace(/\n/g, "<br>")` sin
   sanitizar puede permitir inyección de código HTML.

6. Inconsistencia en el manejo de archivos: Asume que todos los archivos son
   imágenes (`<img src="imagenes/${reporte.archivo}">`) sin validar el tipo
   de archivo.

================================================================================
*/