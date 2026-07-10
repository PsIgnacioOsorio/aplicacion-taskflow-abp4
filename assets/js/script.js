import GestorTareas from "./clases/GestionTareas.js";
import { mostrarConfirmacionBootstrap } from "./confirmaciones.js";

const gestorTareas = new GestorTareas();
let tareaEnEdicionId = null;
let intervaloContador = null;

// Selectores del DOM.
const formAddTarea = document.getElementById("form-add-tarea");
const inputDescripcion = document.getElementById("descripcion");
const inputFechaLimite = document.getElementById("fecha-limite");
const inputBusqueda = document.getElementById("busqueda");
const cuerpoTablaTareas = document.getElementById("cuerpo-tabla-tareas");
const tablaTareas = document.getElementById("tabla-tareas");
const textoSinTareas = document.getElementById("texto-sin-tareas");
const alertas = document.getElementById("alertas");
const estadoAPI = document.getElementById("estado-api");
const tituloFormulario = document.getElementById("titulo-formulario");
const contadorCaracteres = document.getElementById("contador-caracteres");
const contadorTotal = document.getElementById("contador-total");
const contadorPendientes = document.getElementById("contador-pendientes");
const contadorFinalizadas = document.getElementById("contador-finalizadas");
const btnCrearTarea = document.getElementById("btn-crear-tarea");
const btnSpinnerTarea = document.getElementById("btn-spinner-tarea");
const btnCancelarEdicion = document.getElementById("btn-cancelar-edicion");
const btnCargarAPI = document.getElementById("btn-cargar-api");
const btnRestablecer = document.getElementById("btn-restablecer");

const esperar = (milisegundos = 1000) => new Promise((resolve) => setTimeout(resolve, milisegundos));

const mostrarMensaje = (mensaje, tipo = "danger") => {
    alertas.textContent = mensaje;
    alertas.className = `alert alert-${tipo}`;

    setTimeout(() => {
        alertas.textContent = "";
        alertas.className = "d-none";
    }, 3500);
};

const mostrarNotificacionDiferida = (mensaje, tipo = "success") => {
    setTimeout(() => {
        mostrarMensaje(mensaje, tipo);
    }, 2000);
};

const actualizarEstadoAPI = (mensaje, tipo = "muted") => {
    estadoAPI.textContent = `API: ${mensaje}`;
    estadoAPI.className = `small text-${tipo} mb-0 align-self-lg-center`;
};

const mostrarProcesando = (procesando) => {
    btnCrearTarea.classList.toggle("d-none", procesando);
    btnSpinnerTarea.classList.toggle("d-none", !procesando);
    inputDescripcion.disabled = procesando;
    inputFechaLimite.disabled = procesando;
};

const actualizarContadorCaracteres = () => {
    const total = inputDescripcion.value.length;
    contadorCaracteres.textContent = `${total} caracteres`;
};

const limpiarFormulario = () => {
    formAddTarea.reset();
    formAddTarea.classList.remove("was-validated");
    tareaEnEdicionId = null;
    tituloFormulario.textContent = "Agregar nueva tarea";
    btnCrearTarea.textContent = "Agregar";
    btnCancelarEdicion.classList.add("d-none");
    actualizarContadorCaracteres();
};

const iniciarModoEdicion = (tarea) => {
    tareaEnEdicionId = tarea.id;
    tituloFormulario.textContent = "Editar tarea";
    inputDescripcion.value = tarea.descripcion;
    inputFechaLimite.value = tarea.fechaLimite ?? "";
    btnCrearTarea.textContent = "Guardar cambios";
    btnCancelarEdicion.classList.remove("d-none");
    actualizarContadorCaracteres();
    inputDescripcion.focus();
};

const actualizarResumen = () => {
    const tareas = gestorTareas.obtenerTareas();
    const finalizadas = tareas.filter((tarea) => tarea.estado).length;
    const pendientes = tareas.length - finalizadas;

    contadorTotal.textContent = tareas.length;
    contadorPendientes.textContent = pendientes;
    contadorFinalizadas.textContent = finalizadas;
};

// Rest parameters: permite agregar varias clases Bootstrap a cada botón.
const crearBotonAccion = (texto, id, accion, deshabilitado = false, ...clases) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.textContent = texto;
    boton.className = `btn btn-sm ${clases.join(" ")} me-2 mb-1`;
    boton.dataset.id = id;
    boton.dataset.accion = accion;
    boton.disabled = deshabilitado;

    return boton;
};

const crearCelda = (texto, etiqueta) => {
    const celda = document.createElement("td");
    celda.textContent = texto;
    celda.dataset.label = etiqueta;
    return celda;
};

const crearFilaTabla = (tarea) => {
    const fila = document.createElement("tr");
    fila.dataset.id = tarea.id;

    if (tarea.estado) {
        fila.classList.add("table-success");
    }

    const celdaId = document.createElement("th");
    celdaId.scope = "row";
    celdaId.textContent = tarea.id;
    celdaId.dataset.label = "ID";

    const celdaDescripcion = crearCelda(tarea.descripcion, "Descripción");

    const celdaEstado = document.createElement("td");
    celdaEstado.dataset.label = "Estado";
    const estado = document.createElement("span");
    estado.className = tarea.estado ? "badge text-bg-success" : "badge text-bg-secondary";
    estado.textContent = tarea.estadoStr();
    celdaEstado.appendChild(estado);

    const celdaFechaCreacion = crearCelda(tarea.fechaCreacion, "Fecha creación");
    const celdaFechaLimite = crearCelda(tarea.fechaLimiteStr(), "Fecha límite");

    const celdaTiempoRestante = document.createElement("td");
    celdaTiempoRestante.dataset.label = "Tiempo restante";
    celdaTiempoRestante.dataset.tiempoRestante = "true";
    celdaTiempoRestante.dataset.id = tarea.id;
    celdaTiempoRestante.textContent = tarea.tiempoRestanteStr();

    const celdaAcciones = document.createElement("td");
    celdaAcciones.dataset.label = "Acciones";
    celdaAcciones.append(
        crearBotonAccion("Editar", tarea.id, "editar", false, "btn-outline-primary"),
        crearBotonAccion("Cambiar estado", tarea.id, "cambiar-estado", false, "btn-warning"),
        crearBotonAccion("Eliminar", tarea.id, "eliminar", false, "btn-danger")
    );

    fila.append(
        celdaId,
        celdaDescripcion,
        celdaEstado,
        celdaFechaCreacion,
        celdaFechaLimite,
        celdaTiempoRestante,
        celdaAcciones
    );

    return fila;
};

const cargarTareas = (tareas = gestorTareas.obtenerTareas()) => {
    cuerpoTablaTareas.replaceChildren();
    actualizarResumen();

    if (tareas.length === 0) {
        textoSinTareas.classList.remove("d-none");
        tablaTareas.classList.add("d-none");
        return;
    }

    textoSinTareas.classList.add("d-none");
    tablaTareas.classList.remove("d-none");

    const fragmento = document.createDocumentFragment();

    tareas.forEach((tarea) => fragmento.appendChild(crearFilaTabla(tarea)));
    cuerpoTablaTareas.appendChild(fragmento);
};

const aplicarFiltro = () => {
    const tareasFiltradas = gestorTareas.buscarTareas(inputBusqueda.value);
    cargarTareas(tareasFiltradas);
};

const iniciarContadorRegresivo = () => {
    if (intervaloContador) clearInterval(intervaloContador);

    intervaloContador = setInterval(() => {
        document.querySelectorAll("[data-tiempo-restante]").forEach((elemento) => {
            const tarea = gestorTareas.obtenerTareaPorId(elemento.dataset.id);
            elemento.textContent = tarea?.tiempoRestanteStr() ?? "No disponible";
        });
    }, 1000);
};

const main = async () => {
    try {
        await gestorTareas.cargarDesdeLocalStorage();
        cargarTareas();
        iniciarContadorRegresivo();
    } catch (error) {
        mostrarMensaje(error.message);
        cargarTareas([]);
    }
};

main();

// EVENTOS DEL DOM: submit, click, keyup, mouseover y mouseout.
formAddTarea.addEventListener("submit", async (event) => {
    event.preventDefault();
    formAddTarea.classList.add("was-validated");

    if (!formAddTarea.checkValidity()) {
        mostrarMensaje("Completa la descripción antes de guardar la tarea.", "warning");
        return;
    }

    mostrarProcesando(true);

    try {
        // Simulación de retardo asíncrono al agregar o editar una tarea.
        await esperar(800);

        const descripcion = inputDescripcion.value;
        const fechaLimite = inputFechaLimite.value || null;

        if (tareaEnEdicionId) {
            gestorTareas.editarTarea(tareaEnEdicionId, { descripcion, fechaLimite });
            mostrarNotificacionDiferida("Notificación: tarea editada correctamente tras 2 segundos.", "success");
        } else {
            const nuevaTarea = gestorTareas.crearTarea(descripcion, fechaLimite);
            mostrarNotificacionDiferida("Notificación: tarea agregada correctamente tras 2 segundos.", "success");

            try {
                await gestorTareas.guardarTareaEnAPI(nuevaTarea);
                actualizarEstadoAPI("tarea enviada a JSONPlaceholder.", "success");
            } catch (errorAPI) {
                actualizarEstadoAPI(errorAPI.message, "warning");
            }
        }

        limpiarFormulario();
        aplicarFiltro();
        inputDescripcion.focus();
    } catch (error) {
        mostrarMensaje(error.message);
        inputDescripcion.focus();
    } finally {
        mostrarProcesando(false);
    }
});

cuerpoTablaTareas.addEventListener("click", (event) => {
    const boton = event.target.closest("button[data-accion]");
    if (!boton) return;

    const { id, accion } = boton.dataset;

    if (accion === "editar") {
        const tarea = gestorTareas.obtenerTareaPorId(id);
        if (tarea) iniciarModoEdicion(tarea);
        return;
    }

    if (accion === "cambiar-estado") {
        const tarea = gestorTareas.obtenerTareaPorId(id);
        const descripcion = tarea?.descripcion ?? "esta tarea";

        mostrarConfirmacionBootstrap({
            mensaje: `¿Está seguro que desea finalizar la tarea "${descripcion}" con ID: ${id}?`,
            onConfirm: () => {
                const respuesta = gestorTareas.finalizarTarea(id);

                if (respuesta) {
                    mostrarMensaje("Tarea finalizada correctamente.", "success");
                } else {
                    mostrarMensaje("No se pudo finalizar la tarea. Inténtalo nuevamente.", "danger");
                }

                aplicarFiltro();
            },
        });
        return;
    }

    if (accion === "eliminar") {
        const tarea = gestorTareas.obtenerTareaPorId(id);
        const descripcion = tarea?.descripcion ?? "esta tarea";

        mostrarConfirmacionBootstrap({
            mensaje: `¿Está seguro que desea eliminar la tarea "${descripcion}" con ID: ${id}?`,
            onConfirm: () => {
                const respuesta = gestorTareas.eliminarTarea(id);

                if (respuesta) {
                    mostrarMensaje("Tarea eliminada correctamente.", "warning");
                } else {
                    mostrarMensaje("No se pudo eliminar la tarea. Inténtalo nuevamente.", "danger");
                }

                aplicarFiltro();
            },
        });
        return;
    }

    aplicarFiltro();
});

cuerpoTablaTareas.addEventListener("mouseover", (event) => {
    const fila = event.target.closest("tr");
    if (fila) fila.classList.add("fila-activa");
});

cuerpoTablaTareas.addEventListener("mouseout", (event) => {
    const fila = event.target.closest("tr");
    if (fila) fila.classList.remove("fila-activa");
});

inputDescripcion.addEventListener("keyup", actualizarContadorCaracteres);
inputBusqueda.addEventListener("keyup", aplicarFiltro);

btnCancelarEdicion.addEventListener("click", () => {
    limpiarFormulario();
    inputDescripcion.focus();
});

btnCargarAPI.addEventListener("click", async () => {
    try {
        btnCargarAPI.disabled = true;
        actualizarEstadoAPI("recuperando tareas desde JSONPlaceholder...", "muted");

        const tareasNuevas = await gestorTareas.recuperarTareasDesdeAPI(5);
        aplicarFiltro();
        mostrarMensaje(`Se cargaron ${tareasNuevas.length} tareas nuevas desde la API.`, "success");
        actualizarEstadoAPI("tareas recuperadas correctamente.", "success");
    } catch (error) {
        mostrarMensaje(error.message);
        actualizarEstadoAPI(error.message, "danger");
    } finally {
        btnCargarAPI.disabled = false;
    }
});

btnRestablecer.addEventListener("click", async () => {
    try {
        await gestorTareas.restablecerTareasIniciales();
        limpiarFormulario();
        inputBusqueda.value = "";
        cargarTareas();
        actualizarEstadoAPI("datos iniciales cargados desde tareasJson.json.", "muted");
        mostrarMensaje("Datos iniciales restablecidos correctamente.", "success");
    } catch (error) {
        mostrarMensaje(error.message);
    }
});
