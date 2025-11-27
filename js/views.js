// Datos dummy de talleres para el CU-002
const talleresData = [
  {
    id: 1,
    nombre: "Gimnasia suave para adultos mayores",
    cupos: 0, // para disparar el mensaje "Taller sin cupos"
  },
  {
    id: 2,
    nombre: "Taller de memoria y estimulación cognitiva",
    cupos: 5,
  },
  {
    id: 3,
    nombre: "Manualidades y arte terapéutico",
    cupos: 2,
  },
];

// Vistas
const views = {
  inicio: { title: "Inicio", subtitle: "...", render: () => `...` },
  usuarios: { title: "Gestión de usuarios", subtitle: "...", render: () => `...` },

  // 👉 CU-002 – Inscribir adulto mayor en taller
  talleres: {
    title: "Inscribir adulto mayor en taller",
    subtitle: "Caso de Uso CU-002",
    render: () => `
      <section class="page-header">
        <div>
          <h1 class="page-title">Inscribir adulto mayor en taller</h1>
          <p class="page-subtitle">
            Flujo basado en el diagrama de actividad: registro del participante,
            validación y selección de taller.
          </p>
        </div>
      </section>

      <section class="cards-grid cards-grid-column">
        <!-- Card: Registrar participante -->
        <article class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Registrar participante</div>
              <div class="card-subtitle">
                Ingresar datos del nuevo participante adulto mayor.
              </div>
            </div>
          </div>

          <form id="formInscripcion" class="inscripcion-form">
            <div class="form-row">
              <label class="form-label">
                RUT adulto mayor
                <input type="text" id="rut" class="form-input" placeholder="11.111.111-1" />
              </label>
              <label class="form-label">
                Nombre completo
                <input type="text" id="nombre" class="form-input" placeholder="Nombre y apellido" />
              </label>
            </div>
            <div class="form-row">
              <label class="form-label">
                Teléfono de contacto
                <input type="text" id="telefono" class="form-input" placeholder="+56 9 ..." />
              </label>
              <label class="form-label">
                Dirección
                <input type="text" id="direccion" class="form-input" placeholder="Calle, número, villa" />
              </label>
            </div>

            <button type="submit" class="btn-link">
              Registrar participante
            </button>
            <p id="mensajeFormulario" class="muted" style="margin-top:8px;"></p>
          </form>
        </article>

        <!-- Card: Talleres disponibles -->
        <article class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Talleres disponibles</div>
              <div class="card-subtitle">
                Seleccionar un taller con cupos para registrar la inscripción.
              </div>
            </div>
          </div>

          <p class="muted" id="textoTalleresIntro">
            Primero ingrese y valide los datos del participante para mostrar los
            talleres disponibles.
          </p>

          <ul class="list" id="listaTalleres"></ul>
          <p id="mensajeTaller" class="muted" style="margin-top:8px;"></p>
        </article>
      </section>
    `,
    init: function () {
      const form = document.getElementById("formInscripcion");
      const mensajeFormulario = document.getElementById("mensajeFormulario");
      const listaTalleres = document.getElementById("listaTalleres");
      const textoIntro = document.getElementById("textoTalleresIntro");
      const mensajeTaller = document.getElementById("mensajeTaller");
      const rutInput = document.getElementById("rut");

      if (!form) return;

      let datosValidados = false;
      // Futuro AdultoMayor.talleres: lista de IDs de talleres inscritos
      let talleresInscritosIds = [];

      // ==== Formateo visual del RUT: 111111111 -> 11.111.111-1 ====
      if (rutInput) {
        rutInput.addEventListener("input", () => {
          let value = rutInput.value.replace(/[^0-9kK]/g, "").toUpperCase();

          if (value.length <= 1) {
            rutInput.value = value;
            return;
          }

          const cuerpo = value.slice(0, -1);
          const dv = value.slice(-1);
          let cuerpoFormateado = "";
          const reversed = cuerpo.split("").reverse().join("");

          for (let i = 0; i < reversed.length; i++) {
            if (i > 0 && i % 3 === 0) {
              cuerpoFormateado = "." + cuerpoFormateado;
            }
            cuerpoFormateado = reversed[i] + cuerpoFormateado;
          }

          rutInput.value = cuerpoFormateado + "-" + dv;
        });
      }

      // ==== Envío del formulario ====
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        mensajeTaller.textContent = "";

        const rutVisual = document.getElementById("rut").value.trim();
        const nombre = document.getElementById("nombre").value.trim();
        const telefono = document.getElementById("telefono").value.trim();
        const direccion = document.getElementById("direccion").value.trim();

        // Normalizamos RUT para la lógica
        const rutNormalizado = rutVisual.replace(/[^0-9kK]/g, "").toUpperCase();

        // [¿Está registrado en otro taller?] → dummy 111111111
        if (rutNormalizado === "111111111") {
          mensajeFormulario.textContent = "Usuario ya está registrado en un taller.";
          listaTalleres.innerHTML = "";
          textoIntro.textContent =
            "No es posible inscribir nuevamente al participante.";
          datosValidados = false;
          return;
        }

        // Validación básica
        if (!rutNormalizado || !nombre || !telefono || !direccion) {
          mensajeFormulario.textContent = "Datos ingresados no son correctos.";
          listaTalleres.innerHTML = "";
          textoIntro.textContent =
            "Complete correctamente los datos para continuar.";
          datosValidados = false;
          return;
        }

        // Datos correctos -> mostramos talleres
        mensajeFormulario.textContent =
          "Datos validados correctamente. Seleccione un taller del listado.";
        datosValidados = true;
        textoIntro.textContent = "";

        // Nuevo participante validado -> reiniciamos sus talleres inscritos
        talleresInscritosIds = [];

        listaTalleres.innerHTML = talleresData
            .map((t) => {
                const yaInscrito = talleresInscritosIds.includes(t.id);
                const sinCupos = t.cupos <= 0;

                let disabled = "";
                let label = "Seleccionar";

                if (sinCupos) {
                disabled = "disabled";
                label = "Taller Sin Cupos";
                } else if (yaInscrito) {
                disabled = "disabled";
                label = "Inscrito";
                }

                return `
                <li class="list-item">
                    <span>${t.nombre}</span>
                    <span>
                    <span class="chip">${t.cupos} cupos</span>
                    <button type="button"
                            class="btn-taller-select ${yaInscrito ? "btn-taller-inscrito" : ""}"
                            data-taller-id="${t.id}"
                            ${disabled}>
                        ${label}
                    </button>
                    </span>
                </li>
                `;
            })
            .join("");
      });

      // ==== Seleccionar taller de la lista ====
      listaTalleres.addEventListener("click", function (e) {
        const button = e.target.closest("button[data-taller-id]");
        if (!button) return;

        if (!datosValidados) {
            mensajeTaller.textContent =
            "Primero debe validar los datos del participante.";
            return;
        }

        const id = parseInt(button.dataset.tallerId, 10);
        const taller = talleresData.find((t) => t.id === id);
        if (!taller) return;

        // ¿Ya está inscrito en este taller?
        if (talleresInscritosIds.includes(id)) {
            mensajeTaller.textContent =
            "El participante ya está inscrito en este taller.";
            return;
        }

        // ¿Taller sin cupos?
        if (taller.cupos <= 0) {
            mensajeTaller.textContent = "Taller sin cupos.";
            return;
        }

        // Registrar inscripción en este taller (AdultoMayor.talleres.push(id))
        taller.cupos -= 1;
        talleresInscritosIds.push(id);

        // Actualizar chip y botón
        const chip = button.parentElement.querySelector(".chip");
        if (chip) {
            chip.textContent = `${taller.cupos} cupos`;
        }

        button.disabled = true;
        button.textContent = "Inscrito";
        button.classList.add("btn-taller-inscrito");

        // Mensaje final del diagrama
        mensajeTaller.textContent = "Inscripción registrada exitosamente.";
        });
    },
  },

  inscripciones: { title: "Inscripciones", subtitle: "...", render: () => `...` },
  postulaciones: { title: "Postulaciones", subtitle: "...", render: () => `...` },
  salas: { title: "Reservas de salas", subtitle: "...", render: () => `...` },
  pagos: { title: "Pagos y bonos", subtitle: "...", render: () => `...` },
  reportes: { title: "Reportes", subtitle: "...", render: () => `...` },
  ayuda: { title: "Ayuda", subtitle: "...", render: () => `...` },
  configuracion: { title: "Configuración", subtitle: "...", render: () => `...` },
};
