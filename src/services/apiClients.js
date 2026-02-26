import supabase from "./supabase";

// ============================================================
// API Clientes (tabla "clients" con zone_id)
// ============================================================

export async function getClients({ withZone = false } = {}) {
    let query = supabase
        .from("clients")
        .select(withZone ? "*, zones(id, nombre, prioridad)" : "*")
        .eq("eliminado", false)
        .order("nombre", { ascending: true });

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
}

export async function getClientsByZone(zone_id) {
    const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("zone_id", zone_id)
        .eq("eliminado", false)
        .order("nombre", { ascending: true });

    if (error) throw new Error(error.message);
    return data;
}

export async function createClient({ nombre, zone_id, precio_defecto, corte_defecto }) {
    const { data, error } = await supabase
        .from("clients")
        .insert([{ nombre, zone_id, precio_defecto, corte_defecto }])
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function updateClient({ id, nombre, zone_id, precio_defecto, corte_defecto }) {
    const { data, error } = await supabase
        .from("clients")
        .update({ nombre, zone_id, precio_defecto, corte_defecto })
        .eq("id", id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

/** Eliminación lógica */
export async function deleteClient(id) {
    const { error } = await supabase
        .from("clients")
        .update({ eliminado: true })
        .eq("id", id);

    if (error) throw new Error(error.message);
}
