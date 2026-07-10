export const mostrarConfirmacionBootstrap = ({ mensaje, onConfirm }) => {
    const modalElement = document.getElementById("modal-confirmacion");
    const cuerpoModal = document.getElementById("modal-confirmacion-body");
    const btnConfirmar = document.getElementById("btn-confirmar-modal");

    if (!modalElement || !cuerpoModal || !btnConfirmar) return false;

    cuerpoModal.textContent = mensaje;

    const modal = window.bootstrap?.Modal?.getOrCreateInstance(modalElement);

    const manejarConfirmacion = () => {
        btnConfirmar.removeEventListener("click", manejarConfirmacion);
        modal?.hide();
        onConfirm?.();
    };

    btnConfirmar.addEventListener("click", manejarConfirmacion);
    modal?.show();

    return true;
};
