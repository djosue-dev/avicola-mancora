import supabase from "./supabase";

export async function getPesosLotes() {
    const { data, error } = await supabase
        .from("pesos_lotes")
        .select("*")
        .order("fecha", { ascending: false })
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
}

export async function getStockActual() {
    const { data, error } = await supabase
        .from("stock_actual")
        .select("stock_kg")
        .single();

    if (error) throw new Error(error.message);
    return data?.stock_kg ?? 0;
}

export async function createPesoLote(lote) {
    const { data, error } = await supabase
        .from("pesos_lotes")
        .insert([lote])
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function deletePesoLote(id) {
    const { error } = await supabase
        .from("pesos_lotes")
        .delete()
        .eq("id", id);

    if (error) throw new Error(error.message);
}
