import supabase from "./supabase";
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns";

export async function getVentas() {
    const { data, error } = await supabase
        .from("ventas")
        .select(`
      *,
      clientes ( nombre )
    `)
        .order("fecha", { ascending: false })
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
}

export async function getVentasHoy() {
    const hoy = new Date();
    const { data, error } = await supabase
        .from("ventas")
        .select("monto_total, total_kg")
        .gte("fecha", startOfDay(hoy).toISOString().split("T")[0])
        .lte("fecha", endOfDay(hoy).toISOString().split("T")[0]);

    if (error) throw new Error(error.message);
    return data;
}

export async function getVentasSemana() {
    const hoy = new Date();
    const { data, error } = await supabase
        .from("ventas")
        .select("monto_total")
        .gte("fecha", startOfWeek(hoy, { weekStartsOn: 1 }).toISOString().split("T")[0])
        .lte("fecha", endOfWeek(hoy, { weekStartsOn: 1 }).toISOString().split("T")[0]);

    if (error) throw new Error(error.message);
    return data;
}

export async function getVentasRecientes(limit = 5) {
    const { data, error } = await supabase
        .from("ventas")
        .select(`
      *,
      clientes ( nombre )
    `)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) throw new Error(error.message);
    return data;
}

export async function createVenta(venta) {
    const { data, error } = await supabase
        .from("ventas")
        .insert([venta])
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function deleteVenta(id) {
    const { error } = await supabase
        .from("ventas")
        .delete()
        .eq("id", id);

    if (error) throw new Error(error.message);
}
