import { setCorsHeaders } from '../../config.js';
import supabase from '../../supabase.js';
import { requireAuth } from "../../../../middleware/requireAuth.js";
export default async function handler (req, res) {
    setCorsHeaders(res);
    //   const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(",") || [];
    //   const origin = req.headers.origin;
    //   if (allowedOrigins.includes(origin)) {
    //     res.setHeader("Access-Control-Allow-Origin", origin);
    //     res.setHeader("Access-Control-Allow-Credentials", "true");
    //   }
    //     res.setHeader("Access-Control-Allow-Credentials", "true");
    //     res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    //     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');
    // const session = await requireAuth(req);

    // if (!session) {
    //     return res.status(401).json({ error: "Sesión inválida" });

    // }
    if (req.method === 'GET') {

        const countryId = req.query.country;
        // console.log(countryId);
        try {
            const { data, error } = await supabase
                .from('states')
                .select('id, name, iso2 ')
                .eq('country_id', countryId);

            if (error) {
                return res.status(500).json({ error: error.message });
            }
            return res.status(200).json({ data });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
