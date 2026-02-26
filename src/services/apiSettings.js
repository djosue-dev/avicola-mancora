import supabase from "./supabase";

// ============================================================
// API Settings (tabla "settings" - siempre opera fila id=1)
// ============================================================

export async function getSettings() {
    const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("id", 1)
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function updateSettings({ peso_tina_kg }) {
    const { data, error } = await supabase
        .from("settings")
        .update({ peso_tina_kg })
        .eq("id", 1)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}
