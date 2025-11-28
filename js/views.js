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

const aspirantesData = [];

// Instructores disponibles (pensado como futuro JSON/tabla Instructor)
const instructoresDummy = [
  { id: 1, nombre: "María Pérez" },
  { id: 2, nombre: "Juan Soto" },
  { id: 3, nombre: "Ana González" },
];

// Salas disponibles (pensado como futura tabla Sala)
const salasDummy = [
  { id: 1, nombre: "Sala 1" },
  { id: 2, nombre: "Sala 2" },
  { id: 3, nombre: "Sala 3" },
];

// Evaluaciones registradas (mock)
window.evaluacionesData = window.evaluacionesData || [];

// Relación RUT -> talleres inscritos (mock)
window.rutTalleresAsociados = window.rutTalleresAsociados || {
  "11.111.111-1": [1, 2],
  "22.222.222-2": [3]
};

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

  gestionTalleres: {
    title: "Gestión de talleres",
    subtitle: "CU-004 – Registrar talleres",
    render: () => `
      <section class="page-header">
        <div>
          <h1 class="page-title">Registrar nuevo taller</h1>
          <p class="page-subtitle">
            Flujo basado en el diagrama de actividad: registro de taller, validación,
            verificación de duplicados, disponibilidad de instructor y sala.
          </p>
        </div>
      </section>

      <section class="cards-grid cards-grid-column">
        <!-- Card: Formulario de registro de taller -->
        <article class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Formulario de registro de taller</div>
              <div class="card-subtitle">
                Complete los datos requeridos para registrar un nuevo taller.
              </div>
            </div>
          </div>

          <form id="formRegistrarTaller" class="inscripcion-form">
            <div class="form-row">
              <label class="form-label">
                Nombre del taller
                <input type="text" id="nombreTaller" class="form-input"
                       placeholder="Ej: Gimnasia funcional para adultos mayores" />
              </label>
            </div>

            <div class="form-row">
              <label class="form-label">
                Día
                <select id="diaTaller" class="form-input">
                  <option value="">Seleccione un día</option>
                  <option value="Lunes">Lunes</option>
                  <option value="Martes">Martes</option>
                  <option value="Miércoles">Miércoles</option>
                  <option value="Jueves">Jueves</option>
                  <option value="Viernes">Viernes</option>
                </select>
              </label>
              <label class="form-label">
                Hora (HH:MM)
                <input type="text" id="horaTaller" class="form-input"
                       placeholder="10:00" />
              </label>
            </div>

            <div class="form-row">
              <label class="form-label">
                Instructor
                <select id="instructorTaller" class="form-input">
                  <option value="">Seleccione un instructor</option>
                  ${instructoresDummy
                    .map((i) => `<option value="${i.id}">${i.nombre}</option>`)
                    .join("")}
                </select>
              </label>

              <label class="form-label">
                Sala
                <select id="salaTaller" class="form-input">
                  <option value="">Seleccione una sala</option>
                  ${salasDummy
                    .map((s) => `<option value="${s.id}">${s.nombre}</option>`)
                    .join("")}
                </select>
              </label>
            </div>

            <div class="form-row">
              <label class="form-label">
                Cupos totales
                <input type="number" id="cuposTaller" class="form-input"
                       min="1" placeholder="Ej: 15" />
              </label>
            </div>

            <button type="submit" class="btn-link">
              Registrar nuevo taller
            </button>
            <p id="mensajeRegistrarTaller" class="muted" style="margin-top:8px;"></p>
          </form>
        </article>

        <!-- Card: Listado de talleres disponibles -->
        <article class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Listado de talleres disponibles</div>
              <div class="card-subtitle">
                Se actualiza automáticamente cada vez que se registra un taller.
              </div>
            </div>
          </div>

          <ul class="list" id="listaTalleresRegistrados"></ul>
        </article>
      </section>
    `,
    init: function () {
      const form = document.getElementById("formRegistrarTaller");
      const mensaje = document.getElementById("mensajeRegistrarTaller");
      const lista = document.getElementById("listaTalleresRegistrados");

      if (!form || !lista) return;

      // Renderiza el listado de talleres existentes
      function renderListadoTalleres() {
        if (!talleresData.length) {
          lista.innerHTML = `
            <li class="list-item">
              <span>No hay talleres registrados.</span>
            </li>`;
          return;
        }

        lista.innerHTML = talleresData
          .map((t) => {
            const instructor = instructoresDummy.find((i) => i.id === t.instructorId);
            const sala = salasDummy.find((s) => s.id === t.salaId);
            return `
              <li class="list-item">
                <div>
                  <strong>${t.nombre}</strong>
                  <div class="muted">
                    ${t.dia} ${t.hora} · ${t.cupos} cupos ·
                    Instr.: ${instructor ? instructor.nombre : "N/D"} ·
                    Sala: ${sala ? sala.nombre : "N/D"}
                  </div>
                </div>
              </li>
            `;
          })
          .join("");
      }

      renderListadoTalleres();

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        mensaje.textContent = "";

        const nombre = document.getElementById("nombreTaller").value.trim();
        const dia = document.getElementById("diaTaller").value;
        const hora = document.getElementById("horaTaller").value.trim();
        const instructorId = parseInt(
          document.getElementById("instructorTaller").value,
          10
        );
        const salaId = parseInt(
          document.getElementById("salaTaller").value,
          10
        );
        const cuposStr = document.getElementById("cuposTaller").value.trim();
        const cupos = parseInt(cuposStr, 10);

        const horaValida = /^\d{2}:\d{2}$/.test(hora);

        // [¿Datos correctos?] -> validación
        if (
          !nombre ||
          !dia ||
          !horaValida ||
          !instructorId ||
          !salaId ||
          !cupos ||
          cupos <= 0
        ) {
          mensaje.textContent = "Datos incompletos o con formato incorrecto.";
          return;
        }

        const nombreKey = nombre.toLowerCase();

        // [¿Existe un taller duplicado?]
        const duplicado = talleresData.some(
          (t) =>
            t.nombre.toLowerCase() === nombreKey &&
            t.dia === dia &&
            t.hora === hora
        );

        if (duplicado) {
          mensaje.textContent =
            "Ya existe un taller con ese nombre y horario.";
          return;
        }

        // Revisar disponibilidad instructor
        const instructorOcupado = talleresData.some(
          (t) => t.instructorId === instructorId && t.dia === dia && t.hora === hora
        );

        if (instructorOcupado) {
          mensaje.textContent =
            "Instructor no disponible en esa franja horaria.";
          return;
        }

        // Verificar disponibilidad sala asignada
        const salaOcupada = talleresData.some(
          (t) => t.salaId === salaId && t.dia === dia && t.hora === hora
        );

        if (salaOcupada) {
          mensaje.textContent = "Sala ocupada en ese horario.";
          return;
        }

        // Registrar nuevo taller
        const nuevoId =
          talleresData.length > 0
            ? Math.max(...talleresData.map((t) => t.id)) + 1
            : 1;

        const nuevoTaller = {
          id: nuevoId,
          nombre,
          dia,
          hora,
          instructorId,
          salaId,
          cupos,
        };

        talleresData.push(nuevoTaller);

        // Actualizar listado
        renderListadoTalleres();

        // Mensaje final del diagrama
        mensaje.textContent = "Taller registrado correctamente.";

        // Limpiar formulario
        form.reset();
      });
    },
  },

  inscripciones: { title: "Inscripciones", subtitle: "...", render: () => `...` },

  postulaciones: {
    title: "Postular como instructor de talleres",
    subtitle: "Caso de Uso CU-003",
    render: () => `
        <section class="page-header">
        <div>
            <h1 class="page-title">Postular como instructor de talleres</h1>
            <p class="page-subtitle">
            Ingreso y validación de datos de postulación para aspirantes a instructor.
            </p>
        </div>
        </section>

        <section class="cards-grid cards-grid-column">
        <article class="card">
            <div class="card-header">
            <div>
                <div class="card-title">Datos de postulación</div>
                <div class="card-subtitle">
                Complete los campos para registrar su postulación como instructor.
                </div>
            </div>
            </div>

            <form id="formPostulacion" class="inscripcion-form">
            <div class="form-row">
                <label class="form-label">
                RUT
                <input type="text" id="postRut" class="form-input" placeholder="11.111.111-1" />
                </label>
                <label class="form-label">
                Nombre completo
                <input type="text" id="postNombre" class="form-input" placeholder="Nombre y apellido" />
                </label>
            </div>

            <div class="form-row">
                <label class="form-label">
                Correo electrónico
                <input type="email" id="postEmail" class="form-input" placeholder="instructor@correo.cl" />
                </label>
                <label class="form-label">
                Teléfono de contacto
                <input type="text" id="postTelefono" class="form-input" placeholder="+56 9 ..." />
                </label>
            </div>

            <div class="form-row">
                <label class="form-label">
                Experiencia / motivación
                <textarea id="postExperiencia" class="form-input" rows="3"
                    placeholder="Describa brevemente su experiencia y motivación para dictar talleres."></textarea>
                </label>
            </div>

            <button type="submit" class="btn-link">
                Enviar postulación
            </button>
            <p id="mensajePostulacion" class="muted" style="margin-top:8px;"></p>
            </form>
        </article>
        </section>
    `,
    init: function () {
        const form = document.getElementById("formPostulacion");
        const mensajePostulacion = document.getElementById("mensajePostulacion");
        const rutInput = document.getElementById("postRut");

        if (!form) return;

        // Formato visual de RUT (igual que en CU-002)
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

        form.addEventListener("submit", function (e) {
        e.preventDefault();

        const rutVisual = document.getElementById("postRut").value.trim();
        const nombre = document.getElementById("postNombre").value.trim();
        const email = document.getElementById("postEmail").value.trim();
        const telefono = document.getElementById("postTelefono").value.trim();
        const experiencia = document.getElementById("postExperiencia").value.trim();

        // Normalizamos RUT solo para futura lógica
        const rutNormalizado = rutVisual.replace(/[^0-9kK]/g, "").toUpperCase();

        // Validación básica (equivale a "¿Datos ingresados correctamente?")
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
            !rutNormalizado ||
            !nombre ||
            !email ||
            !telefono ||
            !experiencia ||
            !emailRegex.test(email)
        ) {
            mensajePostulacion.textContent = "Datos ingresados no son válidos.";
            return;
        }

        // Registrar datos del aspirante en el "sistema" (dummy)
        const entrevistaDate = new Date();
        entrevistaDate.setDate(entrevistaDate.getDate() + 3);
        entrevistaDate.setHours(10, 0, 0, 0);

        const dd = String(entrevistaDate.getDate()).padStart(2, "0");
        const mm = String(entrevistaDate.getMonth() + 1).padStart(2, "0");
        const hh = String(entrevistaDate.getHours()).padStart(2, "0");
        const min = String(entrevistaDate.getMinutes()).padStart(2, "0");
        const fechaEntrevista = `${dd}/${mm} ${hh}:${min}`;

        aspirantesData.push({
            rut: rutNormalizado,
            nombre,
            email,
            telefono,
            experiencia,
            fechaEntrevista,
        });

        // Mensaje final del diagrama:
        mensajePostulacion.textContent =
            "Postulación registrada correctamente, su entrevista queda agendada para " +
            fechaEntrevista +
            " Hrs.";

        // Opcional: limpiar el formulario después de registrar
        form.reset();
        });
    },
  },

  salas: {
    title: "Reservar salas para taller",
    subtitle: "CU-005 – Reservar salas para taller",
    render: () => `
      <section class="page-header">
        <div>
          <h1 class="page-title">Administrar salas - Reservar salas para taller</h1>
          <p class="page-subtitle">
            Flujo basado en el diagrama de actividad: selección de horario, listado de salas disponibles,
            validación de código de taller y asignación de sala.
          </p>
        </div>
      </section>

      <section class="cards-grid cards-grid-column">
        <!-- Card: Selección de horario y listado de salas -->
        <article class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Reservar sala</div>
              <div class="card-subtitle">
                Seleccione un horario para ver las salas disponibles y asignarlas a un taller.
              </div>
            </div>
          </div>

          <!-- Seleccionar horario -->
          <form id="formHorarioSala" class="inscripcion-form">
            <div class="form-row">
              <label class="form-label">
                Día
                <select id="diaSala" class="form-input">
                  <option value="">Seleccione un día</option>
                  <option value="Lunes">Lunes</option>
                  <option value="Martes">Martes</option>
                  <option value="Miércoles">Miércoles</option>
                  <option value="Jueves">Jueves</option>
                  <option value="Viernes">Viernes</option>
                </select>
              </label>
              <label class="form-label">
                Hora (HH:MM)
                <input type="text" id="horaSala" class="form-input" placeholder="10:00" />
              </label>
            </div>

            <button type="submit" class="btn-link">
              Buscar salas disponibles
            </button>
            <p id="mensajeHorarioSala" class="muted" style="margin-top:8px;"></p>
          </form>

          <!-- Listado de salas disponibles -->
          <p class="muted" id="textoSalasIntro" style="margin-top:8px;">
            Seleccione un horario para obtener el listado de salas disponibles.
          </p>
          <ul class="list" id="listaSalasDisponibles"></ul>

          <!-- Ingresar código de taller -->
          <form id="formAsignarSala" class="inscripcion-form" style="margin-top:14px;">
            <div class="form-row">
              <label class="form-label">
                Código de taller
                <input type="number" id="codigoTallerSala" class="form-input"
                      placeholder="Ej: 1" />
              </label>
            </div>
            <p id="infoTallerSala" class="muted" style="margin-top:4px;"></p>
            <button type="submit" class="btn-link">
              Asignar sala al taller
            </button>
            <p id="mensajeAsignarSala" class="muted" style="margin-top:8px;"></p>
          </form>
        </article>
      </section>
    `,
    init: function () {
      const formHorario = document.getElementById("formHorarioSala");
      const mensajeHorario = document.getElementById("mensajeHorarioSala");
      const textoIntro = document.getElementById("textoSalasIntro");
      const listaSalas = document.getElementById("listaSalasDisponibles");
      const horaInput = document.getElementById("horaSala");

      const formAsignarSala = document.getElementById("formAsignarSala");
      const mensajeAsignar = document.getElementById("mensajeAsignarSala");
      const codigoInput = document.getElementById("codigoTallerSala");
      const infoTaller = document.getElementById("infoTallerSala");

      if (!formHorario || !listaSalas || !formAsignarSala) return;

      let horarioSeleccionado = null; // { dia, hora }
      let salaSeleccionada = null;    // salaDummy seleccionada

      // ===== Formateo visual de hora: 930 -> 09:30 =====
      if (horaInput) {
        horaInput.addEventListener("input", () => {
          let val = horaInput.value.replace(/[^0-9]/g, "");

          if (val.length <= 2) {
            horaInput.value = val;
            return;
          }

          const hh = val.slice(0, 2);
          const mm = val.slice(2, 4);
          if (mm.length > 0) {
            horaInput.value = `${hh}:${mm}`;
          } else {
            horaInput.value = hh;
          }
        });
      }

      function obtenerSalasDisponibles(dia, hora) {
        const ocupadasIds = new Set(
          talleresData
            .filter(
              (t) =>
                t.dia === dia &&
                t.hora === hora &&
                typeof t.salaId !== "undefined" &&
                t.salaId !== null
            )
            .map((t) => t.salaId)
        );

        return salasDummy.filter((s) => !ocupadasIds.has(s.id));
      }

      function renderSalasDisponibles(salas) {
        if (!salas.length) {
          listaSalas.innerHTML = "";
          return;
        }

        listaSalas.innerHTML = salas
          .map(
            (s) => `
            <li class="list-item">
              <span>${s.nombre}</span>
              <span>
                <button type="button"
                        class="btn-sm btn-taller-select"
                        data-sala-id="${s.id}">
                  Seleccionar
                </button>
              </span>
            </li>
          `
          )
          .join("");
      }

      // ==== Seleccionar horario -> obtener salas ====
      formHorario.addEventListener("submit", function (e) {
        e.preventDefault();
        mensajeHorario.textContent = "";
        mensajeAsignar.textContent = "";
        infoTaller.textContent = "";
        salaSeleccionada = null;
        codigoInput.value = "";

        const dia = document.getElementById("diaSala").value;
        const hora = document.getElementById("horaSala").value.trim();

        const horaValida = /^\d{2}:\d{2}$/.test(hora);

        if (!dia || !horaValida) {
          mensajeHorario.textContent =
            "Datos incompletos o con formato incorrecto.";
          listaSalas.innerHTML = "";
          textoIntro.textContent = "";
          return;
        }

        horarioSeleccionado = { dia, hora };

        const disponibles = obtenerSalasDisponibles(dia, hora);

        if (!disponibles.length) {
          mensajeHorario.textContent = "No hay salas disponibles en ese horario.";
          listaSalas.innerHTML = "";
          textoIntro.textContent = "";
          return;
        }

        mensajeHorario.textContent = "";
        textoIntro.textContent = "Seleccione una sala disponible de la lista.";
        renderSalasDisponibles(disponibles);
      });

      // ==== Seleccionar una sala disponible (solo una vez) ====
      listaSalas.addEventListener("click", function (e) {
        const btn = e.target.closest("button[data-sala-id]");
        if (!btn) return;

        // si ya hay sala seleccionada, no permitir otra
        if (salaSeleccionada) {
          mensajeAsignar.textContent =
            "Ya ha seleccionado una sala. Solo puede asignar una sala por vez.";
          return;
        }

        if (!horarioSeleccionado) {
          mensajeHorario.textContent = "Primero seleccione un horario.";
          return;
        }

        const salaId = parseInt(btn.dataset.salaId, 10);
        const sala = salasDummy.find((s) => s.id === salaId);
        if (!sala) return;

        salaSeleccionada = sala;
        mensajeAsignar.textContent =
          "Sala seleccionada: " +
          sala.nombre +
          ". Ingrese el código de taller y confirme.";

        // Deshabilitar todas las salas para este horario
        listaSalas
          .querySelectorAll("button[data-sala-id]")
          .forEach((b) => {
            b.disabled = true;
          });

        btn.textContent = "Seleccionada";
      });

      // ===== Búsqueda previa del taller mientras escribe el código =====
      codigoInput.addEventListener("input", () => {
        mensajeAsignar.textContent = "";
        const value = codigoInput.value.trim();

        if (!value) {
          infoTaller.textContent = "";
          return;
        }

        const codigo = parseInt(value, 10);
        if (!codigo) {
          infoTaller.textContent = "Código de taller ingresado es incorrecto.";
          return;
        }

        const taller = talleresData.find((t) => t.id === codigo);
        if (!taller) {
          infoTaller.textContent = "Código de taller ingresado es incorrecto.";
          return;
        }

        const diaInfo = taller.dia ? taller.dia : "sin día asignado";
        const horaInfo = taller.hora ? taller.hora : "";
        infoTaller.textContent =
          `Taller encontrado: [${taller.id}] ${taller.nombre}` +
          ` (${diaInfo}${horaInfo ? " " + horaInfo : ""}).`;
      });

      // ==== Asignar sala al taller ====
      formAsignarSala.addEventListener("submit", function (e) {
        e.preventDefault();
        mensajeAsignar.textContent = "";

        if (!horarioSeleccionado) {
          mensajeAsignar.textContent =
            "Primero debe seleccionar un horario y una sala disponible.";
          return;
        }

        if (!salaSeleccionada) {
          mensajeAsignar.textContent =
            "Primero debe seleccionar una sala disponible.";
          return;
        }

        const codigoValor = codigoInput.value.trim();
        const codigo = parseInt(codigoValor, 10);

        if (!codigo) {
          mensajeAsignar.textContent =
            "Código de taller ingresado es incorrecto.";
          return;
        }

        const taller = talleresData.find((t) => t.id === codigo);

        // [¿Código existe?]
        if (!taller) {
          mensajeAsignar.textContent =
            "Código de taller ingresado es incorrecto.";
          infoTaller.textContent = "Código de taller ingresado es incorrecto.";
          return;
        }

        // Asignar sala al taller + actualizar horario del taller según selección
        taller.salaId = salaSeleccionada.id;
        taller.dia = horarioSeleccionado.dia;
        taller.hora = horarioSeleccionado.hora;

        // Actualizar información del taller mostrado
        const diaInfo = taller.dia ? taller.dia : "sin día asignado";
        const horaInfo = taller.hora ? taller.hora : "";
        infoTaller.textContent =
          `Taller encontrado: [${taller.id}] ${taller.nombre}` +
          ` (${diaInfo}${horaInfo ? " " + horaInfo : ""}).`;

        // Limpiar listado de salas después de asignar
        listaSalas.innerHTML = "";
        textoIntro.textContent =
          "Sala asignada. Si desea reservar otra sala, seleccione nuevamente un horario.";

        // Mensaje final del diagrama
        mensajeAsignar.textContent = "Sala asignada exitosamente.";

        // Reset lógico para un nuevo proceso
        horarioSeleccionado = null;
        salaSeleccionada = null;
        codigoInput.value = "";

      });
    },
  },

  evaluarTaller: {
    title: "Evaluar taller",
    subtitle: "CU-007 – Registrar evaluación de taller",
    render: () => `
      <section class="page-header">
        <div>
          <h1 class="page-title">Evaluar taller</h1>
          <p class="page-subtitle">
            Flujo basado en el diagrama: validación de RUT, selección de taller y evaluación.
          </p>
        </div>
      </section>

      <section class="cards-grid cards-grid-column">

        <!-- Card: ingresar RUT -->
        <article class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Identificación</div>
              <div class="card-subtitle">
                Ingrese su RUT para ver los talleres en los que está registrado.
              </div>
            </div>
          </div>

          <form id="formRutEval" class="inscripcion-form">
            <div class="form-row">
              <label class="form-label">
                RUT participante
                <input type="text" id="rutEval" class="form-input" placeholder="11.111.111-1" />
              </label>
            </div>

            <button type="submit" class="btn-link">Buscar talleres</button>
            <p id="mensajeRutEval" class="muted" style="margin-top:8px;"></p>
          </form>

          <ul class="list" id="listadoTalleresEval"></ul>
        </article>

        <!-- Card: formulario de evaluación -->
        <article class="card" id="cardFormularioEval" style="display:none;">
          <div class="card-header">
            <div>
              <div class="card-title">Formulario de evaluación</div>
              <div class="card-subtitle">
                Complete la evaluación del taller seleccionado.
              </div>
            </div>
          </div>

          <form id="formEvalTaller" class="inscripcion-form">
            <div class="form-row">
              <label class="form-label">
                Puntaje (1 a 7)
                <input type="number" id="puntajeEval" class="form-input" min="1" max="7" />
              </label>
            </div>

            <div class="form-row">
              <label class="form-label">
                Comentarios
                <textarea id="comentarioEval" class="form-input" rows="3"
                placeholder="Comentarios opcionales"></textarea>
              </label>
            </div>

            <button type="submit" class="btn-link">Enviar evaluación</button>
            <p id="mensajeEval" class="muted" style="margin-top:8px;"></p>
          </form>
        </article>

        <!-- Card: listado actualizado -->
        <article class="card" id="cardEvaluaciones" style="display:none;">
          <div class="card-header">
            <div>
              <div class="card-title">Evaluaciones realizadas</div>
              <div class="card-subtitle">
                Este listado se actualiza cada vez que se envía una evaluación.
              </div>
            </div>
          </div>

          <ul class="list" id="listadoEvaluaciones"></ul>
        </article>

      </section>
    `,
    init: function () {
      const formRut = document.getElementById("formRutEval");
      const rutInput = document.getElementById("rutEval");
      const mensajeRut = document.getElementById("mensajeRutEval");
      const listadoTalleresEval = document.getElementById("listadoTalleresEval");

      const cardFormularioEval = document.getElementById("cardFormularioEval");
      const formEval = document.getElementById("formEvalTaller");
      const puntajeInput = document.getElementById("puntajeEval");
      const comentarioInput = document.getElementById("comentarioEval");
      const mensajeEval = document.getElementById("mensajeEval");

      const cardEvaluaciones = document.getElementById("cardEvaluaciones");
      const listadoEvaluaciones = document.getElementById("listadoEvaluaciones");

      let tallerSeleccionado = null;

      // ====== formateo de RUT visual ======
      rutInput.addEventListener("input", () => {
        let val = rutInput.value.replace(/[^0-9kK]/g, "");
        if (val.length <= 1) {
          rutInput.value = val;
          return;
        }
        let cuerpo = val.slice(0, -1);
        let dv = val.slice(-1);
        cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        rutInput.value = `${cuerpo}-${dv}`;
      });

      // ====== Buscar talleres asociados ======
      formRut.addEventListener("submit", function (e) {
        e.preventDefault();
        mensajeRut.textContent = "";
        listadoTalleresEval.innerHTML = "";
        cardFormularioEval.style.display = "none";

        const rut = rutInput.value.trim();

        if (!/^[0-9.]+-[0-9kK]$/.test(rut)) {
          mensajeRut.textContent = "RUT ingresado no es correcto.";
          return;
        }

        const talleresAsociados = window.rutTalleresAsociados[rut];

        if (!talleresAsociados || talleresAsociados.length === 0) {
          mensajeRut.textContent = "No existen talleres asociados al RUT.";
          return;
        }

        // Render listado de talleres
        listadoTalleresEval.innerHTML = talleresAsociados
          .map((id) => {
            const t = talleresData.find((x) => x.id === id);
            return `
              <li class="list-item">
                <span>${t.nombre} (${t.dia} ${t.hora})</span>
                <button class="btn-link-sm" data-id="${t.id}">Evaluar</button>
              </li>
            `;
          })
          .join("");
      });

      // ====== Seleccionar taller ======
      listadoTalleresEval.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-id]");
        if (!btn) return;

        const id = parseInt(btn.dataset.id, 10);
        tallerSeleccionado = talleresData.find((t) => t.id === id);

        if (!tallerSeleccionado) return;

        cardFormularioEval.style.display = "block";
        mensajeEval.textContent = "";
        puntajeInput.value = "";
        comentarioInput.value = "";
      });

      // ====== Enviar evaluación ======
      formEval.addEventListener("submit", function (e) {
        e.preventDefault();
        mensajeEval.textContent = "";

        const puntaje = parseInt(puntajeInput.value, 10);

        if (!puntaje || puntaje < 1 || puntaje > 7) {
          mensajeEval.textContent = "Datos ingresados son incorrectos.";
          return;
        }

        window.evaluacionesData.push({
          tallerId: tallerSeleccionado.id,
          puntaje,
          comentario: comentarioInput.value.trim()
        });

        mensajeEval.textContent = "Evaluación enviada exitosamente.";
        cardEvaluaciones.style.display = "block";

        listadoEvaluaciones.innerHTML = window.evaluacionesData
          .map((ev) => {
            const t = talleresData.find((x) => x.id === ev.tallerId);
            return `
              <li class="list-item">
                <strong>${t.nombre}</strong> — Puntaje: ${ev.puntaje}
                <div class="muted">${ev.comentario || "(Sin comentario)"}</div>
              </li>`;
          })
          .join("");
      });
    }
  },

  pagos: { title: "Pagos y bonos", subtitle: "...", render: () => `...` },
  reportes: { title: "Reportes", subtitle: "...", render: () => `...` },
  ayuda: { title: "Ayuda", subtitle: "...", render: () => `...` },
  configuracion: { title: "Configuración", subtitle: "...", render: () => `...` },
};
