import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettings, updateSettings } from "../services/apiSettings";
import toast from "react-hot-toast";

export function useSettings() {
    const { data: settings, isLoading } = useQuery({
        queryKey: ["settings"],
        queryFn: getSettings,
    });
    return { settings, isLoading };
}

export function useUpdateSettings() {
    const queryClient = useQueryClient();
    const { mutate: saveSettings, isLoading } = useMutation({
        mutationFn: updateSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["settings"] });
            toast.success("Configuración guardada");
        },
        onError: (err) => toast.error(err.message),
    });
    return { saveSettings, isLoading };
}
