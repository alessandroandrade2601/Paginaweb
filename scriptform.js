// Obtener parámetro curso de la URL
const params = new URLSearchParams(window.location.search);
const curso = params.get("curso");

if (curso) {
  document.getElementById("tituloCurso").textContent = `Reservar Clase – ${curso}`;
  document.getElementById("curso").value = curso;
}

// Manejar envío del formulario
const formReserva = document.getElementById("formReserva");
const modal = document.getElementById("modalConfirmacion");
const closeModal = document.getElementById("closeModal");
const okButton = document.getElementById("okButton");

formReserva.addEventListener("submit", (e) => {
  e.preventDefault();

  // Aquí podrías enviar los datos por fetch a un backend (Python/Flask, etc.)
  // De momento solo mostramos el modal
  modal.style.display = "flex";
});

// Cerrar modal con X o botón
closeModal.addEventListener("click", () => modal.style.display = "none");
okButton.addEventListener("click", () => modal.style.display = "none");

// Cerrar modal si se hace clic fuera del contenido
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});
// Validar formulario (HTML5 se encarga en gran parte)
// Puedes agregar validaciones adicionales aquí si es necesario
