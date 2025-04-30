import SupabaseClient from "../../database/client.js";

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*'); //todo: cambiar por la del front
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if(req.method === "POST") {
        const { id, tos_eur } = req.body;
        const supabase = new SupabaseClient().getClient();

        try {
            const { data, error } = await supabase
                .from('usuarios')
                .update({ tos_eur: tos_eur })
                .eq('user_id', id);

            console.log(data);
            console.log(error);
            if (error) {
                return res.status(500).json({ message: "Error al actualizar los términos y condiciones"});
            }

            res.status(201).json({ message: "Términos y condiciones actualizados"});
        } catch (error) {
            res.status(500).json({ message: "Error al actualizar los términos y condiciones"});
        }
    } else {
        return res.status(405).json({message: "Método no permitido"});
    }
}