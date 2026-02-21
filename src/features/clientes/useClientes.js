import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClientes, createCliente, updateCliente, deleteCliente } from "../../services/apiClientes";
import toast from "react-hot-toast";

export function useClientes() {
    const { data: clientes = [], isLoading } = useQuery({
        queryKey: ["clientes"],
        queryFn: getClientes,
    });

    return { clientes, isLoading };
}

export function useCreateCliente() {
    const queryClient = useQueryClient();

    const { mutate: crear, isLoading } = useMutation({
        mutationFn: createCliente,
        onSuccess: () => {
            toast.success("Cliente registrado correctamente");
            queryClient.invalidateQueries({ queryKey: ["clientes"] });
        },
        onError: (err) => toast.error(err.message),
    });

    return { crear, isLoading };
}

export function useUpdateCliente() {
    const queryClient = useQueryClient();

    const { mutate: actualizar, isLoading } = useMutation({
        mutationFn: ({ id, updates }) => updateCliente(id, updates),
        onSuccess: () => {
            toast.success("Cliente actualizado correctamente");
            queryClient.invalidateQueries({ queryKey: ["clientes"] });
        },
        onError: (err) => toast.error(err.message),
    });

    return { actualizar, isLoading };
}

export function useDeleteCliente() {
    const queryClient = useQueryClient();

    const { mutate: eliminar, isLoading } = useMutation({
        mutationFn: deleteCliente,
        onSuccess: () => {
            toast.success("Cliente desactivado");
            queryClient.invalidateQueries({ queryKey: ["clientes"] });
        },
        onError: (err) => toast.error(err.message),
    });

    return { eliminar, isLoading };
}
