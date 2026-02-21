import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getVentas,
    getVentasHoy,
    getVentasSemana,
    getVentasRecientes,
    createVenta,
    deleteVenta,
} from "../../services/apiVentas";
import toast from "react-hot-toast";

export function useVentas() {
    const { data: ventas = [], isLoading } = useQuery({
        queryKey: ["ventas"],
        queryFn: getVentas,
    });

    return { ventas, isLoading };
}

export function useVentasHoy() {
    const { data = [], isLoading } = useQuery({
        queryKey: ["ventas-hoy"],
        queryFn: getVentasHoy,
    });

    const totalHoy = data.reduce((sum, v) => sum + Number(v.monto_total || 0), 0);
    const kgHoy = data.reduce((sum, v) => sum + Number(v.total_kg || 0), 0);

    return { totalHoy, kgHoy, isLoading };
}

export function useVentasSemana() {
    const { data = [], isLoading } = useQuery({
        queryKey: ["ventas-semana"],
        queryFn: getVentasSemana,
    });

    const totalSemana = data.reduce((sum, v) => sum + Number(v.monto_total || 0), 0);

    return { totalSemana, isLoading };
}

export function useVentasRecientes() {
    const { data: ventasRecientes = [], isLoading } = useQuery({
        queryKey: ["ventas-recientes"],
        queryFn: () => getVentasRecientes(5),
    });

    return { ventasRecientes, isLoading };
}

export function useCreateVenta() {
    const queryClient = useQueryClient();

    const { mutate: crear, isLoading } = useMutation({
        mutationFn: createVenta,
        onSuccess: () => {
            toast.success("Venta registrada correctamente");
            queryClient.invalidateQueries({ queryKey: ["ventas"] });
            queryClient.invalidateQueries({ queryKey: ["ventas-hoy"] });
            queryClient.invalidateQueries({ queryKey: ["ventas-semana"] });
            queryClient.invalidateQueries({ queryKey: ["ventas-recientes"] });
        },
        onError: (err) => toast.error(err.message),
    });

    return { crear, isLoading };
}

export function useDeleteVenta() {
    const queryClient = useQueryClient();

    const { mutate: eliminar, isLoading } = useMutation({
        mutationFn: deleteVenta,
        onSuccess: () => {
            toast.success("Venta eliminada");
            queryClient.invalidateQueries({ queryKey: ["ventas"] });
            queryClient.invalidateQueries({ queryKey: ["ventas-hoy"] });
            queryClient.invalidateQueries({ queryKey: ["ventas-semana"] });
        },
        onError: (err) => toast.error(err.message),
    });

    return { eliminar, isLoading };
}
