// Event listener que se ejecuta cuando el DOM está completamente cargado
document.addEventListener("DOMContentLoaded", () => {
    // Obtiene los elementos del DOM necesarios para el slider
    const slider = document.getElementById("productos-container"); // Contenedor de productos que se desplazará
    const prevBtn = document.getElementById("prevBtn"); // Botón para ir hacia atrás
    const nextBtn = document.getElementById("nextBtn"); // Botón para ir hacia adelante

    const scrollAmount = 200; // Define la cantidad de píxeles que se desplazará el slider en cada clic

    // Event listener para el botón "anterior"
    prevBtn.addEventListener("click", () => {
        // Desplaza el slider hacia la izquierda
        slider.scrollBy({
            left: -scrollAmount, // Valor negativo para desplazar a la izquierda
            behavior: "smooth" // Animación suave del desplazamiento
        });
    });

    // Event listener para el botón "siguiente"
    nextBtn.addEventListener("click", () => {
        // Desplaza el slider hacia la derecha
        slider.scrollBy({
            left: scrollAmount, // Valor positivo para desplazar a la derecha
            behavior: "smooth" // Animación suave del desplazamiento
        });
    });
});

/*carrito*/ // Comentario que sugiere funcionalidad futura o pendiente relacionada con carrito


/*
================================================================================
                          COMENTARIO GENERAL DEL CÓDIGO
================================================================================

¿QUÉ HACE EL CÓDIGO?
---------------------
Este código JavaScript implementa un slider/carrusel horizontal simple para
desplazar productos. Tiene dos botones de navegación (anterior/siguiente) que
permiten al usuario desplazarse 200 píxeles a la izquierda o derecha con una
animación suave a través del contenedor de productos.


MEJORAS SUGERIDAS:
------------------
1. Validación de elementos DOM: No verifica si los elementos existen antes de
   añadir event listeners. Si algún ID no existe, el código fallará.

2. Desplazamiento adaptativo: El scrollAmount es fijo (200px). Sería mejor
   calcular dinámicamente el desplazamiento basándose en el ancho de los
   productos o del contenedor visible.

3. Deshabilitar botones en límites: No hay lógica para deshabilitar los botones
   cuando se alcanza el inicio o final del slider, lo que puede confundir al
   usuario.

4. Desplazamiento responsive: 200px puede ser demasiado o poco dependiendo del
   tamaño de pantalla. Considerar usar porcentajes o calcular según el viewport.

5. Indicadores visuales: Añadir puntos o barras de progreso para mostrar la
   posición actual en el slider.

6. Soporte táctil: No implementa gestos de swipe para dispositivos móviles,
   limitando la experiencia en touch screens.

7. Accesibilidad: Falta soporte para navegación con teclado (flechas) y
   atributos ARIA para lectores de pantalla.

8. Desplazamiento por card completa: Sería mejor desplazar exactamente una card
   o elemento de producto completo en lugar de un valor fijo.


ERRORES IDENTIFICADOS:
----------------------
1. Sin manejo de errores: Si los elementos del DOM no existen, el código
   generará errores "Cannot read property 'addEventListener' of null" y el
   script se detendrá completamente.

2. Comentario incompleto: El comentario "/*carrito/" sugiere funcionalidad
pendiente o código eliminado, lo que indica que el archivo está incompleto
o mal documentado.

3. Falta de prevención de clics rápidos: Si el usuario hace clic rápidamente
varias veces en los botones, se acumularán múltiples animaciones, causando
un comportamiento errático.

4. Sin límites de desplazamiento: El código permitirá desplazarse más allá del
contenido disponible, dejando espacios vacíos.

5. Dependencia de IDs específicos: El código está muy acoplado a IDs específicos,
    haciéndolo poco reutilizable. Una implementación con clases o data-attributes
sería más flexible.

6. Sin fallback para navegadores antiguos: scrollBy() con behavior: "smooth"
no es compatible con todos los navegadores. Debería haber un polyfill o
fallback.

================================================================================
*/