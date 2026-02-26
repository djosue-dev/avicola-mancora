import supabase from "./supabase";

// ============================================================
// API Orders (Pizarra de Pedidos)
// ============================================================

export async function getOrdersByDate(fecha) {
    const { data, error } = await supabase
        .from("orders")
        .select(`
            *,
            clients(id, nombre, zone_id, zones(nombre))
        `)
        .eq("fecha", fecha)
        .eq("eliminado", false)
        .order("hora_limite", { ascending: true });

    if (error) throw new Error(error.message);
    return data;
}

export async function createOrder({ client_id, fecha, hora_limite, cantidad_solicitada }) {
    const { data, error } = await supabase
        .from("orders")
        .insert([{
            client_id,
            fecha,
            hora_limite,
            cantidad_solicitada,
            estado: "pendiente"
        }])
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function updateOrderStatus({ id, estado }) {
    const { data, error } = await supabase
        .from("orders")
        .update({ estado })
        .eq("id", id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

/** Eliminación lógica */
export async function deleteOrder(id) {
    const { error } = await supabase
        .from("orders")
        .update({ eliminado: true })
        .eq("id", id);

    if (error) throw new Error(error.message);
}
