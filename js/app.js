// Este archivo orquesta el cambio de vistas y la navegacion de login/logout.
(function () {
  const viewContainer = document.getElementById("viewContainer");
  const appContainer = document.getElementById("appContainer");
  const loginContainer = document.getElementById("loginContainer");

  const btnLogout = document.getElementById("btnLogout");
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");

  function renderView(viewName) {
    if (!viewContainer) return;

    const key = views[viewName] ? viewName : "inicio";
    const viewDef = views[key];

    viewContainer.innerHTML = viewDef.render();

    if (typeof viewDef.init === "function") {
      // Damos un microtiempo por si la vista necesita que el DOM ya esté pintado
      setTimeout(() => viewDef.init(), 0);
    }

    // Marcar opción activa en sidebar
    document.querySelectorAll(".sidebar-link").forEach((link) => {
      const v = link.getAttribute("data-view");
      link.classList.toggle("active", v === key);
    });
  }

  function handleAuthChanged(user) {
    if (user) {
      if (loginContainer) loginContainer.style.display = "none";
      if (appContainer) appContainer.style.display = "block";

      // Actualizar botón de perfil con nombre + rol
      const profileBtn = document.querySelector(
        ".topbar-right .btn-ghost"
      );
      if (profileBtn) {
        profileBtn.innerHTML = `<span class="btn-icon">👤</span>${user.nombre} · ${
          user.rolLabel || user.rol
        }`;
      }

      // Aplicar permisos de menú
      if (typeof window.applySidebarPermissions === "function") {
        window.applySidebarPermissions(user.rol);
      }

      // Ir a Inicio
      renderView("inicio");
    } else {
      // Logout
      if (appContainer) appContainer.style.display = "none";

      if (loginContainer) loginContainer.style.display = "flex";

      if (typeof window.applySidebarPermissions === "function") {
        window.applySidebarPermissions(null);
      }
    }
  }

  function initNavigation() {
    document.addEventListener("click", (e) => {
      const link = e.target.closest(".sidebar-link");
      if (!link) return;

      e.preventDefault();
      const viewName = link.getAttribute("data-view");
      const role = window.getCurrentUserRole
        ? window.getCurrentUserRole()
        : null;

      if (
        role &&
        typeof window.isViewAllowedForRole === "function" &&
        !window.isViewAllowedForRole(viewName, role)
      ) {
        alert(
          "Este perfil no tiene acceso a este módulo (prototipo de perfilamiento)."
        );
        return;
      }

      renderView(viewName);
    });

    // Toggle de sidebar (modo móvil)
    if (menuToggle && sidebar) {
      menuToggle.addEventListener("click", () => {
        sidebar.classList.toggle("sidebar-open");
      });
    }

    // Logout
    if (btnLogout) {
      btnLogout.addEventListener("click", () => {
        if (window.logout) {
          window.logout();
        }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (window.initAuth) {
      window.initAuth();
    }
    initNavigation();

    // Escuchar cambios de sesión
    window.addEventListener("auth:changed", (ev) =>
      handleAuthChanged(ev.detail)
    );
  });
})();
