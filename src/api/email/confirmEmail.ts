import { Request, Response } from 'express';
import supabase from '../../db/supabase';

export const confirmEmailController = async (req: Request, res: Response): Promise<Response> => {


    const { token, email } = req.query as { token: string; email: string };

    if (!token || !email) {
        return res.status(400).json({
            success: false,
            message: 'Token and email are required',
        });
    }

    const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .eq('reset_token', token)
        .single();

    if (error || !data) {
        return res.status(400).json({
            success: false,
            message: 'Invalid token or email',
        });
    }

    const { error: updateError } = await supabase
        .from('usuarios')
        .update({
            verificado_email: true,
            reset_token: null
        })
        .eq('email', email);

    if (updateError) {
        return res.status(500).json({
            success: false,
            message: 'Error updating email verification status',
        });
    }

    return res.status(200).json({
        success: true,
        message: 'Email confirmed successfully',
    });
};
