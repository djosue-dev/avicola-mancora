import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRecords, createRecord, softDeleteRecord } from "../services/apiRecords";
import toast from "react-hot-toast";

export function useRecords(filtros = {}) {
    const { data: records = [], isLoading, error } = useQuery({
        queryKey: ["records", filtros],
        queryFn: () => getRecords(filtros),
    });
    return { records, isLoading, error };
}

export function useCreateRecord() {
    const queryClient = useQueryClient();
    const { mutate: saveRecord, isLoading } = useMutation({
        mutationFn: createRecord,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["records"] });
            toast.success("Registro de pesaje guardado ✓");
        },
        onError: (err) => toast.error(`Error: ${err.message}`),
    });
    return { saveRecord, isLoading };
}

export function useSoftDeleteRecord() {
    const queryClient = useQueryClient();
    const { mutate: deleteRecord, isLoading } = useMutation({
        mutationFn: softDeleteRecord,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["records"] });
            toast.success("Registro eliminado");
        },
        onError: (err) => toast.error(err.message),
    });
    return { deleteRecord, isLoading };
}
