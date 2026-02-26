import supabase from "./supabase";

// ============================================================
// API Zonas
// ============================================================

export async function getZones() {
    const { data, error } = await supabase
        .from("zones")
        .select("*")
        .eq("eliminado", false)
        .order("prioridad", { ascending: true });

    if (error) throw new Error(error.message);
    return data;
}

export async function createZone({ nombre, prioridad }) {
    const { data, error } = await supabase
        .from("zones")
        .insert([{ nombre, prioridad }])
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function updateZone({ id, nombre, prioridad }) {
    const { data, error } = await supabase
        .from("zones")
        .update({ nombre, prioridad })
        .eq("id", id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

/** Eliminación lógica: solo marca eliminado=true */
export async function deleteZone(id) {
    const { error } = await supabase
        .from("zones")
        .update({ eliminado: true })
        .eq("id", id);

    if (error) throw new Error(error.message);
}
