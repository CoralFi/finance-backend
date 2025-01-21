import AddressService from "../../services/utila/AddressService.js";
import { createClient } from "@supabase/supabase-js";

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    console.log(req.method);

    if (req.method === "GET") {
        try {
            const { email } = req.query;
            const { data, error } = await supabase
                .from('usuarios')
                .select('qr_payment')
                .eq('email', email)
                .single();

            const qrUrl = data.qr_payment
            res.status(200).json({ qrUrl });

        } catch (error) {
            res.status(500).json({ message: "Error al obtener el estado del QR"});
        }

    }
  
    if (req.method === "POST") {
        try {
            const addressService = new AddressService();

            const { email, nombre, wallet } = req.body;
            const { data, error } = await supabase
                .from('usuarios')
                .select('qr_payment')
                .eq('email', email)
                .single();

            if(data.qr_payment === "waiting") {
                return res.status(200).json({ message: "Ya has solicitado el QR. En breve estará disponible" });

            }
            const getAddressAndNetwork = await addressService.getAddressAndNetwork(wallet);
            const googleFormURL = "https://docs.google.com/forms/d/e/1FAIpQLSdcfJHVDRdV-RroukEkEOJJIKFCnWV6y-pdRYs4E67ZELvlRQ/formResponse";
            const formData = new URLSearchParams();

            formData.append("entry.53891288", "USDC en Polygon (incluye pagos de BTC en Lightning, USDC en Base y UXD en LaChain)");
            formData.append("entry.595709547", getPolygonAddress(getAddressAndNetwork));
            formData.append("entry.860000856", email);

            /* Descomentar cuando las pruebas del ok
            const googleFormURL = "https://docs.google.com/forms/d/e/1FAIpQLSej3fUbuqaeXdN3D1WumkIb2wXzczMfKnVLHx2dL3mcXWuuiw/formResponse";
            const formData = new URLSearchParams();
            // Datos enviados en el formulario
            formData.append("entry.779624889", "USDC en Polygon (incluye pagos de BTC en Lightning, USDC en Base y UXD en LaChain)");
            //nombre
            formData.append("entry.988418741", nombre);
            formData.append("entry.601468703", "");
            formData.append("entry.360874907", "");
            //mail
            formData.append("entry.440066810", email);
            formData.append("entry.300204165", email);
            //address
            formData.append("entry.1855079229", getPolygonAddress(getAddressAndNetwork));
            */

            const response = await fetch(googleFormURL, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: formData
            });
    
            if (response.ok) {
                const { error: supabaseError } = await supabase
                    .from("usuarios")
                    .update({ qr_payment: "waiting" })
                    .eq("email", email);

                res.status(200).json({ message: "Hemos recibido tu solicitud para acepatar pagos con QR. En breve lo veras disponible." });
            } else {
                res.status(500).json({ message: "Error al enviar el formulario", error: await response.text() });
            }

        } catch (error) {
            res.status(500).json({ message: "Error al generar el QR"});
        }
    }


    function getPolygonAddress(arr) {
        const polygon = arr.find(item => item.network === 'networks/polygon-mainnet');
        return polygon ? polygon.address : null;
    }
}