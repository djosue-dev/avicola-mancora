import supabase from "./supabase";

// ============================================================
// API Daily Inventory (Apertura de Día)
// ============================================================

export async function getDailyInventory(fecha) {
    const { data, error } = await supabase
        .from("daily_inventory")
        .select("*")
        .eq("fecha", fecha)
        .maybeSingle(); // no falla si no hay registro

    if (error) throw new Error(error.message);
    return data; // puede ser null si no hay apertura del día
}

export async function createDailyInventory({ fecha, pollos_iniciales, kilos_iniciales }) {
    const { data, error } = await supabase
        .from("daily_inventory")
        .insert([{ fecha, pollos_iniciales, kilos_iniciales }])
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}
