const loginContainer = document.getElementById("loginContainer");
const appContainer = document.getElementById("appContainer");

const DUMMY_USER = {
  email: "user1@email.com",
  password: "12345",
  role: "administrador",
};

const MAX_ATTEMPTS = 3;
const BLOCK_TIME = 48 * 60 * 60 * 1000; // 48 horas

function renderLogin() {
  loginContainer.innerHTML = `
    <div class="login-box">
      <div class="login-header">
          <h1 class="login-title">Talleres Adulto Mayor</h1>
      </div>
      <div class="login-form">
        <label class="login-label">
          Correo electrónico
          <input type="email" id="email" class="login-input" placeholder="usuario@correo.cl" />
        </label>
        <label class="login-label">
          Contraseña
          <input type="password" id="password" class="login-input" placeholder="********" />
        </label>
        <button id="btnLogin" class="login-button">Ingresar</button>
        <p id="loginMessage" class="login-message"></p>
        <p class="login-hint muted">
          Usuario demo: <strong>user1@email.com</strong> · Contraseña: <strong>12345</strong>
        </p>
      </div>
    </div>
  `;

  document.getElementById("btnLogin").onclick = handleLogin;
}

function checkBlocked() {
  const blockDataRaw = localStorage.getItem("blockData");
  if (!blockDataRaw) return false;

  try {
    const blockData = JSON.parse(blockDataRaw);
    const now = Date.now();
    if (now < blockData.expires) {
      return true;
    }
  } catch (e) {
    // Si algo falló, limpiamos bloqueo corrupto
    localStorage.removeItem("blockData");
  }

  localStorage.removeItem("blockData");
  localStorage.removeItem("loginAttempts");
  return false;
}

function handleLogin() {
  const messageEl = document.getElementById("loginMessage");

  if (checkBlocked()) {
    messageEl.innerHTML =
      "Cuenta bloqueada por 48 horas.<br/><strong>Contactar admin</strong>";
    return;
  }

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    messageEl.textContent = "Ingrese correo y contraseña.";
    return;
  }

  if (email === DUMMY_USER.email && password === DUMMY_USER.password) {
    localStorage.setItem("session", JSON.stringify(DUMMY_USER));
    loginContainer.style.display = "none";
    appContainer.style.display = "flex"; // ocupa toda la pantalla
    messageEl.textContent = "";
    return;
  }

  let attempts = Number(localStorage.getItem("loginAttempts") || 0);
  attempts++;
  localStorage.setItem("loginAttempts", attempts);

  if (attempts >= MAX_ATTEMPTS) {
    const expires = Date.now() + BLOCK_TIME;
    localStorage.setItem("blockData", JSON.stringify({ expires }));
    messageEl.innerHTML =
      "❌ Cuenta bloqueada por intentos fallidos.<br/>Bloqueo: 48 horas.<br/><strong>Contactar admin</strong>";
    return;
  }

  const remaining = MAX_ATTEMPTS - attempts;
  messageEl.textContent =
    "Credenciales no válidas. Intentos restantes: " + remaining + ".";
}

function initAuth() {
  const session = localStorage.getItem("session");

  if (session && !checkBlocked()) {
    loginContainer.style.display = "none";
    appContainer.style.display = "flex";
  } else {
    appContainer.style.display = "none";
    loginContainer.style.display = "flex";
    renderLogin();
  }
}

function logout() {
  localStorage.removeItem("session");
  loginContainer.style.display = "flex";
  appContainer.style.display = "none";
  renderLogin();
}

// Botón "Cerrar sesión" del topbar (tiene clase .btn-primary)
document.addEventListener("click", (e) => {
  const logoutButton = e.target.closest(".btn-primary");
  if (logoutButton && appContainer.style.display !== "none") {
    logout();
  }
});

initAuth();
