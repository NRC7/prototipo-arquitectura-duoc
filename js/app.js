const viewContainer = document.getElementById("viewContainer");

// Render inicial
function renderView(viewKey) {
  const view = views[viewKey] || views.inicio;
  viewContainer.innerHTML = view.render();

  // Si la vista define lógica propia, la ejecutamos
  if (typeof view.init === "function") {
    view.init();
  }
}


renderView("inicio");

// Navegación del sidebar
document.querySelectorAll(".sidebar-link").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".sidebar-link").forEach((l) =>
      l.classList.remove("active")
    );
    link.classList.add("active");
    renderView(link.dataset.view);

    if (window.innerWidth <= 900) {
      sidebar.classList.remove("open");
    }
  });
});
