import { acceptTos } from '@/services/supabase/business';
import { Request, Response } from 'express';

export const acceptTosController = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { business_id } = req.body;

        if (!business_id) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos obligatorios en el cuerpo de la solicitud',
                requiredFields: ['business_id']
            });
        }

        await acceptTos(business_id);

        return res.status(200).json({
            success: true,
            message: 'TOS aceptados correctamente'
        });
    } catch (error: any) {
        console.error('Error aceptando TOS:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Error al aceptar TOS',
            error: error.message || error
        });
    }
};