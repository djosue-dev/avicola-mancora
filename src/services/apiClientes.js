import supabase from "./supabase";

export async function getClientes() {
    const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("activo", true)
        .order("nombre");

    if (error) throw new Error(error.message);
    return data;
}

export async function createCliente(cliente) {
    const { data, error } = await supabase
        .from("clientes")
        .insert([cliente])
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function updateCliente(id, updates) {
    const { data, error } = await supabase
        .from("clientes")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function deleteCliente(id) {
    // Baja logica: no se elimina el registro, se desactiva
    const { error } = await supabase
        .from("clientes")
        .update({ activo: false })
        .eq("id", id);

    if (error) throw new Error(error.message);
}
