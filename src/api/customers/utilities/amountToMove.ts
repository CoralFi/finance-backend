import supabase from "@/db/supabase";
import {Request, Response} from "express";

export const amountToMoveController = async (req: Request, res: Response) => {
    try {
    const {data: amountToMove, error: amountToMoveError} = await supabase.
    rpc("get_active_amount_to_moved");

    if (amountToMoveError) {
        return res.status(500).json({error: amountToMoveError.message});
    }

    return res.status(200).json(amountToMove);
    } catch (error: any) {
        return res.status(500).json({error: error.message});
    }
}