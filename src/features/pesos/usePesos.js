import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getPesosLotes,
    getStockActual,
    createPesoLote,
    deletePesoLote,
} from "../../services/apiPesos";
import toast from "react-hot-toast";

export function usePesosLotes() {
    const { data: lotes = [], isLoading } = useQuery({
        queryKey: ["pesos-lotes"],
        queryFn: getPesosLotes,
    });

    return { lotes, isLoading };
}

export function useStockActual() {
    const { data: stockKg = 0, isLoading } = useQuery({
        queryKey: ["stock-actual"],
        queryFn: getStockActual,
    });

    return { stockKg: Number(stockKg), isLoading };
}

export function useCreatePesoLote() {
    const queryClient = useQueryClient();

    const { mutate: crear, isLoading } = useMutation({
        mutationFn: createPesoLote,
        onSuccess: () => {
            toast.success("Registro de peso guardado correctamente");
            queryClient.invalidateQueries({ queryKey: ["pesos-lotes"] });
            queryClient.invalidateQueries({ queryKey: ["stock-actual"] });
        },
        onError: (err) => toast.error(err.message),
    });

    return { crear, isLoading };
}

export function useDeletePesoLote() {
    const queryClient = useQueryClient();

    const { mutate: eliminar, isLoading } = useMutation({
        mutationFn: deletePesoLote,
        onSuccess: () => {
            toast.success("Registro eliminado");
            queryClient.invalidateQueries({ queryKey: ["pesos-lotes"] });
            queryClient.invalidateQueries({ queryKey: ["stock-actual"] });
        },
        onError: (err) => toast.error(err.message),
    });

    return { eliminar, isLoading };
}
