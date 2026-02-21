import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getConfiguracion, updateConfiguracion } from "../../services/apiConfiguracion";
import toast from "react-hot-toast";

export function useConfiguracion() {
    const { data: configuracion, isLoading } = useQuery({
        queryKey: ["configuracion"],
        queryFn: getConfiguracion,
    });

    return { configuracion, isLoading };
}

export function useUpdateConfiguracion() {
    const queryClient = useQueryClient();

    const { mutate: actualizar, isLoading } = useMutation({
        mutationFn: updateConfiguracion,
        onSuccess: () => {
            toast.success("Configuracion actualizada");
            queryClient.invalidateQueries({ queryKey: ["configuracion"] });
        },
        onError: (err) => toast.error(err.message),
    });

    return { actualizar, isLoading };
}
