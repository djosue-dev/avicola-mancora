import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrdersByDate, createOrder, updateOrderStatus, deleteOrder } from "../services/apiOrders";
import { format } from "date-fns";
import toast from "react-hot-toast";

const todayStr = () => format(new Date(), "yyyy-MM-dd");

/** Pedidos del día con auto-refetch cada 60 segundos para alertas en tiempo real */
export function useOrders(fecha = todayStr()) {
    const { data: orders = [], isLoading, error } = useQuery({
        queryKey: ["orders", fecha],
        queryFn: () => getOrdersByDate(fecha),
        refetchInterval: 60_000,  // 60 segundos
    });
    return { orders, isLoading, error };
}

export function useCreateOrder() {
    const queryClient = useQueryClient();
    const { mutate: addOrder, isLoading } = useMutation({
        mutationFn: createOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            toast.success("Pedido registrado en la pizarra");
        },
        onError: (err) => toast.error(err.message),
    });
    return { addOrder, isLoading };
}

export function useUpdateOrderStatus() {
    const queryClient = useQueryClient();
    const { mutate: changeStatus, isLoading } = useMutation({
        mutationFn: updateOrderStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            toast.success("Estado del pedido actualizado");
        },
        onError: (err) => toast.error(err.message),
    });
    return { changeStatus, isLoading };
}

export function useDeleteOrder() {
    const queryClient = useQueryClient();
    const { mutate: removeOrder, isLoading } = useMutation({
        mutationFn: deleteOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            toast.success("Pedido eliminado");
        },
        onError: (err) => toast.error(err.message),
    });
    return { removeOrder, isLoading };
}
