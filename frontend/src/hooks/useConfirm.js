import { confirmDialog } from "primereact/confirmdialog";
import { useCallback } from "react";
export const useConfirm = () => {
    return useCallback((options) => {
        confirmDialog({
            header: options.header ?? "Confirmar",
            message: options.message ?? "¿Deseas continuar?",
            acceptLabel: "Aceptar",
            rejectLabel: "Cancelar",
            ...options,
        });
    }, []);
};
