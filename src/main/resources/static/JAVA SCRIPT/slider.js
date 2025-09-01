document.addEventListener("DOMContentLoaded", () => {
    const slider = document.getElementById("productos-container");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    
    const scrollAmount = 200; // Ajusta la cantidad de píxeles que quieres desplazar
  
    prevBtn.addEventListener("click", () => {
      slider.scrollBy({
        left: -scrollAmount,
        behavior: "smooth"
      });
    });
  
    nextBtn.addEventListener("click", () => {
      slider.scrollBy({
        left: scrollAmount,
        behavior: "smooth"
      });
    });
  });
  /*carrito*/
  