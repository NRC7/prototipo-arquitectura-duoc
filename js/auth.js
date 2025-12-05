// Usuario demo
const DUMMY_USER = {
  email: "demo@email.com",
  password: "arquitectura",
  nombre: "Usuario demo",
};

// Configuración de bloqueo
const LOGIN_MAX_ATTEMPTS = 3;
const LOGIN_BLOCK_HOURS = 48;

// Claves en localStorage
const SESSION_KEY = "session";
const ATTEMPTS_KEY = "loginFailedAttempts";
const BLOCKED_KEY = "loginBlockedUntil";

// Utilidades de estado de login
function getLoginState() {
  const attempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || "0", 10);
  const blockedUntilRaw = localStorage.getItem(BLOCKED_KEY);
  const now = Date.now();

  let blockedUntil = null;
  let isBlocked = false;

  if (blockedUntilRaw) {
    blockedUntil = parseInt(blockedUntilRaw, 10);
    if (!Number.isNaN(blockedUntil) && blockedUntil > now) {
      isBlocked = true;
    } else {
      // ya expiró el bloqueo
      localStorage.removeItem(BLOCKED_KEY);
    }
  }

  return { attempts, blockedUntil, isBlocked };
}

function setLoginFailed() {
  const state = getLoginState();
  const newAttempts = state.attempts + 1;
  localStorage.setItem(ATTEMPTS_KEY, String(newAttempts));

  if (newAttempts >= LOGIN_MAX_ATTEMPTS && !state.isBlocked) {
    const blockedUntil = Date.now() + LOGIN_BLOCK_HOURS * 60 * 60 * 1000;
    localStorage.setItem(BLOCKED_KEY, String(blockedUntil));
  }
}

function resetLoginState() {
  localStorage.removeItem(ATTEMPTS_KEY);
  localStorage.removeItem(BLOCKED_KEY);
}

// Notificar al resto de la app
function notifyAuthChanged(user) {
  window.dispatchEvent(
    new CustomEvent("auth:changed", { detail: user || null })
  );
}

// Helpers DOM
function getContainers() {
  return {
    loginContainer: document.getElementById("loginContainer"),
    appContainer: document.getElementById("appContainer"),
  };
}

// Render del formulario de login
function renderLogin() {
  const { loginContainer } = getContainers();
  if (!loginContainer) return;
  
  // Template HTML Login UI
  loginContainer.innerHTML = `
    <div class="login-box">
      <div class="login-header">
          <h1 class="login-title">Talleres Adulto Mayor</h1>
      </div>

      <form id="loginForm" class="login-form">

        <!-- SELECT DE PERFIL -->
        <label class="login-label">
          Perfil
          <select id="loginProfile" class="login-input login-select">
            <option value="">Seleccione un perfil</option>
            <option value="administrador">Administrador</option>
            <option value="funcionario">Funcionario municipal</option>
            <option value="adultoMayor">Adulto mayor</option>
            <option value="aspirante">Aspirante a instructor</option>
            <option value="instructor">Instructor</option>
          </select>
        </label>

        <label class="login-label">
          Correo electrónico
          <input type="email" id="loginEmail" class="login-input" placeholder="usuario@correo.cl" />
        </label>

        <label class="login-label">
          Contraseña
          <div class="login-password-wrapper">
            <input
              type="password"
              id="loginPassword"
              class="login-input"
              placeholder="********"
            />
            <button
              type="button"
              id="togglePassword"
              class="login-password-toggle"
              aria-label="Mostrar u ocultar contraseña"
            >
              👁
            </button>
          </div>
        </label>

        <button id="btnLogin" type="submit" class="login-button">Ingresar</button>

        <p id="loginError" class="login-message"></p>

        <p class="login-hint muted">
          Para más información ver archivo: <strong>Avance Prototipo Entrega 3.xlsx</strong>
        </p>
      </form>
    </div>
  `;

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  // Ojo para mostrar/ocultar contraseña
  const passwordInput = document.getElementById("loginPassword");
  const togglePassword = document.getElementById("togglePassword");

  if (passwordInput && togglePassword) {
    togglePassword.addEventListener("click", () => {
      const isHidden = passwordInput.type === "password";
      passwordInput.type = isHidden ? "text" : "password";
      // Cambiamos el ícono para que se note el estado
      togglePassword.textContent = isHidden ? "🙈" : "👁";
    });
  }

  // Si está bloqueado, deshabilitar inputs y mostrar mensaje
  const state = getLoginState();
  if (state.isBlocked && loginForm) {
    const errorEl = document.getElementById("loginError");
    if (errorEl) {
      errorEl.textContent =
        "Cuenta bloqueada por intentos fallidos. Intente nuevamente más tarde.";
    }
    Array.from(loginForm.elements).forEach((el) => (el.disabled = true));
  }
}

// Manejar submit del login
function handleLogin(event) {
  event.preventDefault();

  const { loginContainer, appContainer } = getContainers();
  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");
  const profileSelect = document.getElementById("loginProfile");
  const errorEl = document.getElementById("loginError");

  if (!emailInput || !passwordInput || !profileSelect) return;

  const state = getLoginState();
  if (state.isBlocked) {
    if (errorEl) {
      errorEl.textContent =
        "Cuenta bloqueada por intentos fallidos. Intente nuevamente más tarde.";
    }
    return;
  }

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const perfil = profileSelect.value;

  if (!perfil) {
    if (errorEl) {
      errorEl.textContent = "Seleccione un perfil para continuar.";
    }
    return;
  }

  if (email !== DUMMY_USER.email || password !== DUMMY_USER.password) {
    setLoginFailed();
    if (errorEl) {
      const { attempts, isBlocked } = getLoginState();
      if (isBlocked) {
        errorEl.textContent =
          "Cuenta bloqueada por intentos fallidos. Intente nuevamente más tarde.";
      } else {
        const restantes = Math.max(
          LOGIN_MAX_ATTEMPTS - attempts,
          0
        );
        errorEl.textContent =
          "Credenciales incorrectas. Intentos restantes: " + restantes + ".";
      }
    }
    return;
  }

  // Login correcto
  resetLoginState();
  if (errorEl) errorEl.textContent = "";

  const sessionUser = {
    email: DUMMY_USER.email,
    nombre: DUMMY_USER.nombre,
    rol: perfil,
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));

  if (loginContainer) loginContainer.style.display = "none";
  if (appContainer) appContainer.style.display = "flex";

  // Notificar al resto de la app
  notifyAuthChanged(sessionUser);
}

// Inicializar autenticación al cargar la página
function initAuth() {
  const { loginContainer, appContainer } = getContainers();
  if (!loginContainer || !appContainer) return;

  // Al refrescar la página siempre volvemos al login
  localStorage.removeItem(SESSION_KEY);

  appContainer.style.display = "none";
  loginContainer.style.display = "flex";

  renderLogin();
  notifyAuthChanged(null);
}

// Cerrar sesión
function logout() {
  const { loginContainer, appContainer } = getContainers();

  localStorage.removeItem(SESSION_KEY);
  resetLoginState();

  if (appContainer) appContainer.style.display = "none";
  if (loginContainer) loginContainer.style.display = "flex";

  renderLogin();
  notifyAuthChanged(null);
}

window.initAuth = initAuth;
window.logout = logout;
window.getCurrentUserRole = function () {
  const sessionRaw = localStorage.getItem(SESSION_KEY);
  if (!sessionRaw) return null;
  try {
    const user = JSON.parse(sessionRaw);
    return user.rol || null;
  } catch {
    return null;
  }
};
