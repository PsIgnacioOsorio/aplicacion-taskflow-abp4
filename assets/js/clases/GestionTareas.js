import Tarea from "./Tarea.js";

const STORAGE_KEY = "taskflow_abp_tareas";
const API_TAREAS_URL = "https://jsonplaceholder.typicode.com/todos";

const cargarTareasLocales = async () => {
    try {
        const response = await fetch("./tareasJson.json");

        if (!response.ok) {
            throw new Error("No se pudieron cargar las tareas iniciales del proyecto.");
        }

        const data = await response.json();
        const tareas = Array.isArray(data.tareas) ? data.tareas : [];

        return tareas.map((tarea) => Tarea.desdeObjeto(tarea));
    } catch (error) {
        throw new Error(`Error al cargar tareas locales: ${error.message}`);
    }
};

class GestorTareas {
    constructor() {
        this.tareas = [];
    }

    crearTarea(descripcion, fechaLimite = null) {
        if (!descripcion || descripcion.trim() === "") {
            throw new Error("La descripción no puede estar vacía.");
        }

        const nuevaTarea = new Tarea(descripcion, false, null, null, fechaLimite);

        // Spread operator: crea un nuevo arreglo manteniendo la lista original intacta.
        this.tareas = [...this.tareas, nuevaTarea];
        this.guardarEnLocalStorage();

        return nuevaTarea;
    }

    obtenerTareas() {
        return this.tareas;
    }

    obtenerTareaPorId(id) {
        return this.tareas.find((tarea) => tarea.id === id) || null;
    }

    buscarTareas(texto = "") {
        const busqueda = texto.toLowerCase().trim();

        if (!busqueda) return this.tareas;

        return this.tareas.filter((tarea) => {
            const contenido = `${tarea.descripcion} ${tarea.estadoStr()} ${tarea.fechaCreacion}`.toLowerCase();
            return contenido.includes(busqueda);
        });
    }

    editarTarea(id, datosActualizados = {}) {
        const tarea = this.obtenerTareaPorId(id);
        if (!tarea) return null;

        // Destructuring con valores por defecto.
        const {
            descripcion = tarea.descripcion,
            fechaLimite = tarea.fechaLimite,
        } = datosActualizados;

        if (!descripcion || descripcion.trim() === "") {
            throw new Error("La descripción no puede estar vacía.");
        }

        tarea.editar(descripcion, fechaLimite);
        this.guardarEnLocalStorage();

        return tarea;
    }

    cambiarEstadoTarea(id) {
        const tarea = this.obtenerTareaPorId(id);
        if (!tarea) return null;

        tarea.cambiarEstado();
        this.guardarEnLocalStorage();

        return tarea;
    }

    finalizarTarea(id) {
        const tarea = this.obtenerTareaPorId(id);
        if (!tarea) return null;

        tarea.finalizar();
        this.guardarEnLocalStorage();

        return tarea;
    }

    eliminarTarea(id) {
        const tarea = this.obtenerTareaPorId(id);
        if (!tarea) return false;

        tarea.eliminar();
        this.tareas = this.tareas.filter((item) => item.id !== id);
        this.guardarEnLocalStorage();

        return true;
    }

    guardarEnLocalStorage() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tareas));
    }

    async cargarDesdeLocalStorage() {
        try {
            const datos = localStorage.getItem(STORAGE_KEY);

            if (datos) {
                const tareasGuardadas = JSON.parse(datos);
                this.tareas = tareasGuardadas.map((tarea) => Tarea.desdeObjeto(tarea));
            } else {
                this.tareas = await cargarTareasLocales();
                this.guardarEnLocalStorage();
            }

            return this.tareas;
        } catch (error) {
            localStorage.removeItem(STORAGE_KEY);
            throw new Error(`Error al recuperar tareas guardadas: ${error.message}`);
        }
    }

    async restablecerTareasIniciales() {
        try {
            localStorage.removeItem(STORAGE_KEY);
            this.tareas = await cargarTareasLocales();
            this.guardarEnLocalStorage();

            return this.tareas;
        } catch (error) {
            throw new Error(`Error al restablecer tareas iniciales: ${error.message}`);
        }
    }

    async recuperarTareasDesdeAPI(limite = 5) {
        try {
            const response = await fetch(`${API_TAREAS_URL}?_limit=${limite}`);

            if (!response.ok) {
                throw new Error("La API externa no respondió correctamente.");
            }

            const tareasAPI = await response.json();

            const tareasConvertidas = tareasAPI.map(({ id, title, completed }) => {
                const fechaLimite = new Date(Date.now() + id * 86400000).toISOString().split("T")[0];
                return new Tarea(title, completed, `api-${id}`, null, fechaLimite);
            });

            const idsActuales = new Set(this.tareas.map((tarea) => tarea.id));
            const tareasNuevas = tareasConvertidas.filter((tarea) => !idsActuales.has(tarea.id));

            this.tareas = [...this.tareas, ...tareasNuevas];
            this.guardarEnLocalStorage();

            return tareasNuevas;
        } catch (error) {
            throw new Error(`Error al recuperar tareas desde la API: ${error.message}`);
        }
    }

    async guardarTareaEnAPI(tarea) {
        try {
            const payload = {
                ...tarea.toJSON(),
                title: tarea.descripcion,
                completed: tarea.estado,
                userId: 1,
            };

            const response = await fetch(API_TAREAS_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("La API no permitió guardar la tarea.");
            }

            return await response.json();
        } catch (error) {
            throw new Error(`Error al guardar en API: ${error.message}`);
        }
    }
}

export default GestorTareas;
