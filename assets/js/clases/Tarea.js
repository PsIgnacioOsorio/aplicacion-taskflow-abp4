class Tarea {
    constructor(descripcion, estado = false, id = null, fechaCreacion = null, fechaLimite = null) {
        this.id = id ?? Tarea.generarId();
        this.descripcion = String(descripcion).trim();
        this.estado = Boolean(estado); // false = pendiente / true = finalizada
        this.fechaCreacion = fechaCreacion ?? Tarea.obtenerFechaActual();
        this.fechaLimite = fechaLimite || null;
        this.eliminada = false;
    }

    static generarId() {
        if (globalThis.crypto?.randomUUID) {
            return globalThis.crypto.randomUUID();
        }

        return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }

    static obtenerFechaActual() {
        return new Intl.DateTimeFormat("es-CL", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }).format(new Date());
    }

    static formatearFechaLimite(fechaISO) {
        if (!fechaISO) return "Sin fecha";

        const fecha = new Date(`${fechaISO}T00:00:00`);
        return new Intl.DateTimeFormat("es-CL", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }).format(fecha);
    }

    static desdeObjeto({ id, descripcion, estado = false, fechaCreacion = null, fechaLimite = null }) {
        return new Tarea(descripcion, estado, id, fechaCreacion, fechaLimite);
    }

    cambiarEstado() {
        this.estado = !this.estado;
        return this;
    }

    finalizar() {
        this.estado = true;
        return this;
    }

    editar(descripcion, fechaLimite = null) {
        this.descripcion = String(descripcion).trim();
        this.fechaLimite = fechaLimite || null;
        return this;
    }

    eliminar() {
        this.eliminada = true;
        return this;
    }

    estadoStr() {
        return this.estado ? "Finalizada" : "Pendiente";
    }

    fechaLimiteStr() {
        return Tarea.formatearFechaLimite(this.fechaLimite);
    }

    tiempoRestanteStr() {
        if (!this.fechaLimite) return "Sin fecha límite";
        if (this.estado) return "Tarea finalizada";

        const fechaFin = new Date(`${this.fechaLimite}T23:59:59`);
        const diferenciaMs = fechaFin.getTime() - Date.now();

        if (diferenciaMs <= 0) return "Fecha vencida";

        const segundosTotales = Math.floor(diferenciaMs / 1000);
        const dias = Math.floor(segundosTotales / 86400);
        const horas = Math.floor((segundosTotales % 86400) / 3600);
        const minutos = Math.floor((segundosTotales % 3600) / 60);
        const segundos = segundosTotales % 60;

        return `${dias}d ${horas}h ${minutos}m ${segundos}s`;
    }

    toJSON() {
        return {
            id: this.id,
            descripcion: this.descripcion,
            estado: this.estado,
            fechaCreacion: this.fechaCreacion,
            fechaLimite: this.fechaLimite,
        };
    }
}

export default Tarea;
