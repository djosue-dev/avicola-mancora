import supabase, { supabaseUrl } from "./supabase";

// ============================================================
// API Records (Pesajes - Tabla maestra)
// ============================================================

const BUCKET = "balanza-fotos";

/**
 * Sube la foto de balanza a Supabase Storage y devuelve la URL pública.
 * @param {File} fotoFile - Archivo de imagen (Blob/File)
 * @param {string} userId - ID del usuario para nombrar el archivo
 */
async function uploadFoto(fotoFile, userId) {
    const timestamp = Date.now();
    const fileName = `${userId}/${timestamp}.jpg`;

    const { error } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, fotoFile, {
            contentType: "image/jpeg",
            upsert: false,
        });

    if (error) throw new Error(`Error al subir foto: ${error.message}`);

    const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(fileName);

    return urlData.publicUrl;
}

/**
 * Obtiene registros con opciones de filtro para reportes.
 */
export async function getRecords({
    fechaInicio,
    fechaFin,
    zoneId = null,
    clientId = null,
    tipo = null,
} = {}) {
    let query = supabase
        .from("records")
        .select(`
            *,
            clients(id, nombre, zone_id, zones(id, nombre)),
            orders(id, hora_limite)
        `)
        .eq("eliminado", false)
        .order("created_at", { ascending: false });

    if (fechaInicio) query = query.gte("created_at", `${fechaInicio}T00:00:00`);
    if (fechaFin) query = query.lte("created_at", `${fechaFin}T23:59:59`);
    if (clientId) query = query.eq("client_id", clientId);
    if (tipo) query = query.eq("tipo_registro", tipo);
    if (zoneId) query = query.eq("clients.zone_id", zoneId);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
}

/**
 * Crea un registro de pesaje (Camal o Proceso).
 * Si se pasa `fotoFile` (Blob), lo sube primero a Storage.
 */
export async function createRecord({
    tipo_registro,
    user_id,
    client_id,
    order_id = null,
    peso_bruto,
    cant_tinas,
    cant_pollos = null,
    peso_neto,
    tipo_corte = null,
    precio_aplicado = null,
    fotoFile = null,       // Blob/File de la cámara
}) {
    let foto_url = null;

    if (fotoFile && user_id) {
        foto_url = await uploadFoto(fotoFile, user_id);
    }

    const { data, error } = await supabase
        .from("records")
        .insert([{
            tipo_registro,
            user_id,
            client_id,
            order_id,
            peso_bruto,
            cant_tinas,
            cant_pollos,
            peso_neto,
            tipo_corte,
            precio_aplicado,
            foto_url,
        }])
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

/** Eliminación lógica */
export async function softDeleteRecord(id) {
    const { error } = await supabase
        .from("records")
        .update({ eliminado: true })
        .eq("id", id);

    if (error) throw new Error(error.message);
}
