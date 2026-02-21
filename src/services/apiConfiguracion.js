import supabase from "./supabase";

export async function getConfiguracion() {
    const { data, error } = await supabase
        .from("configuracion")
        .select("*")
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function updateConfiguracion(updates) {
    const { data, error } = await supabase
        .from("configuracion")
        .update(updates)
        .eq("id", 1)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}
