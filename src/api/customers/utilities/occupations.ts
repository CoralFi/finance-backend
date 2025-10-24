import supabase from "@/db/supabase";
import {Request, Response} from "express";

export const ocupationsController = async (req: Request, res: Response) => {
    try {
    const {data: ocupations, error: ocupationsError} = await supabase.
    rpc("get_active_occupations");

    if (ocupationsError) {
        return res.status(500).json({error: ocupationsError.message});
    }


    return res.status(200).json(ocupations);

} catch (error: any) {
        return res.status(500).json({error: error.message});
    }
}