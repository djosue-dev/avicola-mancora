import supabase, { supabaseUrl } from "./supabase";

/**
 * Crea un nuevo usuario con rol asignado (usado por Admin)
 * El rol se almacena en user_metadata para lectura rápida en cliente.
 */
export async function createUser({ fullName, email, password, rol }) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                fullName,
                rol,   // "admin" | "pesador" | "digitador"
                avatar: "",
            },
        },
    });

    if (error) throw new Error(error.message);

    return data;
}

/** @deprecated - Usar createUser con rol explícito */
export async function signup({ fullName, email, password }) {
    return createUser({ fullName, email, password, rol: "digitador" });
}

export async function login({ email, password }) {
    let { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw new Error(error.message);

    return data;
}

export async function getCurrentUser() {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return null;

    // Forzar refresh del token para obtener user_metadata actualizado desde la BD
    await supabase.auth.refreshSession();

    const { data, error } = await supabase.auth.getUser();

    if (error) throw new Error(error.message);
    return data?.user;
}

export async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
}

export async function updateCurrentUser({ password, fullName, avatar }) {
    let updateData;
    if (password) updateData = { password };
    if (fullName) updateData = { data: { fullName } };
    const { data, error } = await supabase.auth.updateUser(updateData);
    if (error) throw new Error(error.message);
    if (!avatar) return data;

    const fileName = `avatar-${data.user.id}-${Math.random()}`;
    const { error: storageError } = await supabase.storage
        .from("avatares")
        .upload(fileName, avatar);
    if (storageError) throw new Error(storageError.message);

    const { data: updatedUser, error: error2 } = await supabase.auth.updateUser({
        data: {
            avatar: `${supabaseUrl}/storage/v1/object/public/avatares/${fileName}`,
        },
    });
    if (error2) throw new Error(error2.message);
    return updatedUser;
}
