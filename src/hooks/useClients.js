import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClients, getClientsByZone, createClient, updateClient, deleteClient } from "../services/apiClients";
import toast from "react-hot-toast";

/** Todos los clientes activos (con info de zona) */
export function useClients() {
    const { data: clients = [], isLoading, error } = useQuery({
        queryKey: ["clients"],
        queryFn: () => getClients({ withZone: true }),
    });
    return { clients, isLoading, error };
}

/** Clientes filtrados por zona (para formulario Camal) */
export function useClientsByZone(zoneId) {
    const { data: clients = [], isLoading } = useQuery({
        queryKey: ["clients", "zone", zoneId],
        queryFn: () => getClientsByZone(zoneId),
        enabled: !!zoneId,
    });
    return { clients, isLoading };
}

export function useCreateClient() {
    const queryClient = useQueryClient();
    const { mutate: addClient, isLoading } = useMutation({
        mutationFn: createClient,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            toast.success("Cliente creado exitosamente");
        },
        onError: (err) => toast.error(err.message),
    });
    return { addClient, isLoading };
}

export function useUpdateClient() {
    const queryClient = useQueryClient();
    const { mutate: editClient, isLoading } = useMutation({
        mutationFn: updateClient,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            toast.success("Cliente actualizado");
        },
        onError: (err) => toast.error(err.message),
    });
    return { editClient, isLoading };
}

export function useDeleteClient() {
    const queryClient = useQueryClient();
    const { mutate: removeClient, isLoading } = useMutation({
        mutationFn: deleteClient,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            toast.success("Cliente eliminado");
        },
        onError: (err) => toast.error(err.message),
    });
    return { removeClient, isLoading };
}
