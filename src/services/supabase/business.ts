import supabase from "@/db/supabase";

export const acceptTos = async (business_id: string) => {
    // Validate business_id
    if (!business_id) {
        throw new Error("business_id es requerido");
    }

    // validate if exists
    const { data: business, error: businessError } = await supabase
        .from("business")
        .select("business_id")
        .eq("business_id", business_id)
        .maybeSingle();

    if (businessError) {
        console.error("Error al obtener el negocio:", businessError.message);
        throw businessError;
    }

    if (!business) {
        throw new Error("El negocio no existe");
    }

    const { error } = await supabase
        .from("business")
        .update({ tos_coral: true })
        .eq("business_id", business_id);

    if (error) {
        console.error("Error al aceptar los TOS:", error.message);
        throw error;
    }
};