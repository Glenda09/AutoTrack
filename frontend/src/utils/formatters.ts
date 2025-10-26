import { format } from "date-fns";
import { es } from "date-fns/locale";

export const formatCurrency = (value: number | string) =>
  new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" }).format(Number(value ?? 0));

export const formatDate = (value: string | Date) => {
  try {
    return format(new Date(value), "dd/MM/yyyy", { locale: es });
  } catch {
    return "-";
  }
};
