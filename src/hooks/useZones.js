import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getZones, createZone, updateZone, deleteZone } from "../services/apiZones";
import toast from "react-hot-toast";

export function useZones() {
    const { data: zones = [], isLoading, error } = useQuery({
        queryKey: ["zones"],
        queryFn: getZones,
    });
    return { zones, isLoading, error };
}

export function useCreateZone() {
    const queryClient = useQueryClient();
    const { mutate: addZone, isLoading } = useMutation({
        mutationFn: createZone,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["zones"] });
            toast.success("Zona creada exitosamente");
        },
        onError: (err) => toast.error(err.message),
    });
    return { addZone, isLoading };
}

export function useUpdateZone() {
    const queryClient = useQueryClient();
    const { mutate: editZone, isLoading } = useMutation({
        mutationFn: updateZone,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["zones"] });
            toast.success("Zona actualizada");
        },
        onError: (err) => toast.error(err.message),
    });
    return { editZone, isLoading };
}

export function useDeleteZone() {
    const queryClient = useQueryClient();
    const { mutate: removeZone, isLoading } = useMutation({
        mutationFn: deleteZone,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["zones"] });
            toast.success("Zona eliminada");
        },
        onError: (err) => toast.error(err.message),
    });
    return { removeZone, isLoading };
}
