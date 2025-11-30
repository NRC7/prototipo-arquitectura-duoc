// Encargado de aplicar permisos por rol en el menú lateral prototipo.
(function () {
  const ROLE_PERMISSIONS = {
    administrador: [
      "inicio",
      "usuarios",
      "talleres",
      "gestionTalleres",
      "inscripciones",
      "postulaciones",
      "salas",
      "pagos",
      "reportes",
    ],
    funcionario: [
      "inicio",
      "talleres",
      "gestionTalleres",
      "inscripciones",
      "salas",
      "pagos",
      "reportes",
    ],
    adultoMayor: ["inicio", "talleres", "evaluarTaller"],
    aspirante: ["inicio", "postulaciones"],
    instructor: ["inicio", "talleres", "pagos", "reportes"],
  };

  // Función global para verificar acceso
  window.isViewAllowedForRole = function (view, role) {
    if (!role) return false;

    if (view === "inicio" || view === "ayuda" || view === "configuracion") {
      return true;
    }

    const allowed = ROLE_PERMISSIONS[role] || [];
    return allowed.includes(view);
  };

  // Aplica visibilidad según el rol
  window.applySidebarPermissions = function (role) {
    const links = document.querySelectorAll(
      ".sidebar .sidebar-link[data-view]"
    );

    links.forEach((link) => {
      const view = link.getAttribute("data-view");
      const li = link.closest("li");
      if (!li) return;

      // Siempre visibles
      if (view === "inicio" || view === "ayuda" || view === "configuracion") {
        li.style.display = "";
        return;
      }

      if (!role) {
        li.style.display = "none";
        return;
      }

      li.style.display = window.isViewAllowedForRole(view, role)
        ? ""
        : "none";
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    window.applySidebarPermissions(null);
  });
})();
