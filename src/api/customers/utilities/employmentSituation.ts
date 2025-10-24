import supabase from "@/db/supabase";
import {Request, Response} from "express";

export const employmentSituationController = async (req: Request, res: Response) => {
    try {
    const {data: employmentSituation, error: employmentSituationError} = await supabase.
    rpc("get_active_employment_situations");

    if (employmentSituationError) {
        return res.status(500).json({error: employmentSituationError.message});
    }


    return res.status(200).json(employmentSituation);

} catch (error: any) {
        return res.status(500).json({error: error.message});
    }
}