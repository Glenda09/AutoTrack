import { confirmDialog, ConfirmDialogProps } from "primereact/confirmdialog";
import { useCallback } from "react";

type ConfirmOptions = Pick<ConfirmDialogProps, "message" | "header" | "accept" | "reject">;

export const useConfirm = () => {
  return useCallback(
    (options: ConfirmOptions) => {
      confirmDialog({
        header: options.header ?? "Confirmar",
        message: options.message ?? "¿Deseas continuar?",
        acceptLabel: "Aceptar",
        rejectLabel: "Cancelar",
        ...options,
      });
    },
    []
  );
};
